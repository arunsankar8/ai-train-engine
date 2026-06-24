import { useState, useEffect, useCallback } from "react";

export type OutputLine = {
  type: "stdout" | "stderr" | "system";
  text: string;
};

export type PyFile = {
  name: string;
  content: string;
};

export type CompletionItem = {
  name: string;
  type: string;
  description: string;
  docstring: string;
};

export type HoverInfo = {
  signature: string;
  docstring: string;
  type: string;
};

export function usePython() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [jediReady, setJediReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [pyodideInstance, setPyodideInstance] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function initPyodide() {
      try {
        if (!(window as any).loadPyodide) {
          throw new Error("Pyodide script not loaded");
        }

        const pyodide = await (window as any).loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/",
        });

        // Set up workspace filesystem
        try { pyodide.FS.mkdir("/workspace"); } catch { /* already exists */ }

        await pyodide.runPythonAsync(`
import sys
if '/workspace' not in sys.path:
    sys.path.insert(0, '/workspace')
`);

        if (mounted) {
          setPyodideInstance(pyodide);
          setIsReady(true);
          setOutput([{ type: "system", text: "Python initialized and ready." }]);
        }

        // Install Jedi in the background for completions
        try {
          await pyodide.loadPackage("micropip");
          await pyodide.runPythonAsync(`
import micropip
await micropip.install('jedi')
`);
          if (mounted) {
            setJediReady(true);
          }
        } catch {
          // Jedi unavailable — completions won't work, but the IDE still functions
        }
      } catch (err) {
        if (mounted) {
          setOutput([{ type: "stderr", text: `Failed to initialize Python: ${err}` }]);
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    }

    initPyodide();
    return () => { mounted = false; };
  }, []);

  const runCode = useCallback(
    async (activeCode: string, files: PyFile[]) => {
      if (!isReady || !pyodideInstance) {
        setOutput((prev) => [...prev, { type: "stderr", text: "Python is not ready yet." }]);
        return;
      }

      setIsRunning(true);
      setOutput([]);
      const localOutput: OutputLine[] = [];

      pyodideInstance.setStdout({
        batched: (text: string) => { localOutput.push({ type: "stdout", text }); },
      });
      pyodideInstance.setStderr({
        batched: (text: string) => { localOutput.push({ type: "stderr", text }); },
      });

      try {
        // Write all files to virtual FS
        for (const file of files) {
          pyodideInstance.FS.writeFile(`/workspace/${file.name}`, file.content, { encoding: "utf8" });
        }

        // Bust module import cache so re-runs pick up edited files
        await pyodideInstance.runPythonAsync(`
import sys
_to_remove = [k for k in list(sys.modules.keys())
              if not k.startswith('_') and k not in ('sys', 'importlib', 'micropip', 'jedi', 'parso')]
for _mod in _to_remove:
    sys.modules.pop(_mod, None)
`);

        await pyodideInstance.runPythonAsync(activeCode);
      } catch (err: any) {
        localOutput.push({ type: "stderr", text: err.toString() });
      } finally {
        setOutput((prev) => [...prev, ...localOutput]);
        setIsRunning(false);
      }
    },
    [isReady, pyodideInstance]
  );

  /**
   * Get Jedi completions for the given code at (line, col).
   * line is 1-indexed (Monaco convention), col is 1-indexed.
   */
  const getCompletions = useCallback(
    async (
      code: string,
      line: number,
      col: number,
      filename: string = "main.py"
    ): Promise<CompletionItem[]> => {
      if (!pyodideInstance || !jediReady) return [];
      try {
        // Pass code via globals to avoid string escaping issues
        pyodideInstance.globals.set("_jedi_code", code);
        pyodideInstance.globals.set("_jedi_line", line);
        pyodideInstance.globals.set("_jedi_col", col);
        pyodideInstance.globals.set("_jedi_path", filename);

        const result = await pyodideInstance.runPythonAsync(`
import jedi, json, sys

def _get_doc(c):
    try:
        raw = c.docstring(raw=True)
        if not raw:
            return ''
        paras = [p.strip() for p in raw.split('\\n\\n') if p.strip()]
        return paras[0][:600] if paras else raw[:600]
    except Exception:
        return ''

# Give Jedi the full Pyodide sys.path so it can resolve stdlib modules (random, os, etc.)
_project = jedi.Project(path='/workspace', added_sys_path=sys.path)
_script = jedi.Script(_jedi_code, path=_jedi_path, project=_project)
_comps = _script.complete(_jedi_line, _jedi_col)
json.dumps([
  {
    'name': c.name,
    'type': c.type,
    'description': c.description,
    'docstring': _get_doc(c)
  }
  for c in _comps[:80]
])
`);
        return JSON.parse(result) as CompletionItem[];
      } catch {
        return [];
      }
    },
    [pyodideInstance, jediReady]
  );

  /**
   * Get Jedi hover info (signature + docstring) for the symbol at (line, col).
   * line is 1-indexed, col is 0-indexed.
   */
  const getHover = useCallback(
    async (
      code: string,
      line: number,
      col: number,
      filename: string = "main.py"
    ): Promise<HoverInfo | null> => {
      if (!pyodideInstance || !jediReady) return null;
      try {
        pyodideInstance.globals.set("_jedi_code", code);
        pyodideInstance.globals.set("_jedi_line", line);
        pyodideInstance.globals.set("_jedi_col", col);
        pyodideInstance.globals.set("_jedi_path", filename);

        const result = await pyodideInstance.runPythonAsync(`
import jedi, json, sys

_project = jedi.Project(path='/workspace', added_sys_path=sys.path)
_script = jedi.Script(_jedi_code, path=_jedi_path, project=_project)

# infer() gives full type info + docstrings; fall back to help()
_names = _script.infer(_jedi_line, _jedi_col)
if not _names:
    _names = _script.help(_jedi_line, _jedi_col)

def _format(n):
    try:
        sig = n.description or n.name
        raw = ''
        try:
            raw = n.docstring(raw=True) or ''
        except Exception:
            pass
        if not sig and not raw:
            return None
        return {
            'signature': sig,
            'type': n.type or '',
            'docstring': raw[:2000],
        }
    except Exception:
        return None

_results = [r for r in (_format(n) for n in _names) if r]
json.dumps(_results[0] if _results else None)
`);
        return JSON.parse(result) as HoverInfo | null;
      } catch {
        return null;
      }
    },
    [pyodideInstance, jediReady]
  );

  /**
   * Fetch pydoc documentation for a query string.
   * kind: 'keyword' | 'topic' | 'builtin' | 'type' | 'module' | 'exception'
   */
  const getDocumentation = useCallback(
    async (query: string, kind: string): Promise<string | null> => {
      if (!pyodideInstance) return null;
      try {
        pyodideInstance.globals.set("_doc_query", query);
        pyodideInstance.globals.set("_doc_kind", kind);

        const result = await pyodideInstance.runPythonAsync(`
import pydoc, io, sys, importlib, builtins as _builtins

_q = _doc_query
_k = _doc_kind

def _capture_help(target):
    """Capture pydoc.help() output as a string."""
    old_out = sys.stdout
    sys.stdout = buf = io.StringIO()
    try:
        pydoc.help(target)
    except Exception:
        pass
    finally:
        sys.stdout = old_out
    return buf.getvalue().strip()

def _fetch():
    try:
        # Keywords and pydoc TOPICS — use captured help() directly
        if _k in ('keyword', 'topic'):
            text = _capture_help(_q)
            if text and 'no Python documentation' not in text.lower() and len(text) > 30:
                return text
            return f"No documentation available for '{_q}' in this environment."

        # Modules — import then help
        if _k == 'module':
            parts = _q.split('.')
            try:
                mod = importlib.import_module(_q)
                text = _capture_help(mod)
                return text if text else f"Module '{_q}' loaded but has no documentation."
            except ImportError:
                return f"Module '{_q}' is not available in this environment (Pyodide ships a subset of stdlib)."

        # Builtins, types, exceptions — getattr from builtins then help
        if _k in ('builtin', 'type', 'exception'):
            obj = getattr(_builtins, _q, None)
            if obj is not None:
                return _capture_help(obj)
            # Try as string (pydoc looks up by name)
            text = _capture_help(_q)
            if text and len(text) > 30:
                return text
            return f"'{_q}' not found in builtins."

        # Fallback: dotted names like urllib.parse
        parts = _q.split('.')
        try:
            mod = importlib.import_module(parts[0])
            obj = mod
            for p in parts[1:]:
                obj = getattr(obj, p)
            return _capture_help(obj)
        except Exception:
            pass

        # Last resort: pass string to help()
        text = _capture_help(_q)
        if text and len(text) > 30:
            return text
        return f"No documentation found for '{_q}'."

    except Exception as e:
        return f"Error retrieving docs: {str(e)}"

_fetch()
`);
        return result as string;
      } catch {
        return null;
      }
    },
    [pyodideInstance]
  );

  const clearOutput = useCallback(() => { setOutput([]); }, []);

  return { isInitializing, isReady, jediReady, isRunning, output, runCode, clearOutput, getCompletions, getHover, getDocumentation };
}

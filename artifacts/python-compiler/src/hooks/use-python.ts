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
import jedi, json

def _get_doc(c):
    try:
        raw = c.docstring(raw=True)
        if not raw:
            return ''
        # Return first meaningful paragraph, up to 600 chars
        paras = [p.strip() for p in raw.split('\\n\\n') if p.strip()]
        return paras[0][:600] if paras else raw[:600]
    except Exception:
        return ''

_script = jedi.Script(_jedi_code, path=_jedi_path)
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

  const clearOutput = useCallback(() => { setOutput([]); }, []);

  return { isInitializing, isReady, jediReady, isRunning, output, runCode, clearOutput, getCompletions };
}

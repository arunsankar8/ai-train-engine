import { useState, useEffect, useCallback } from "react";

export type OutputLine = {
  type: "stdout" | "stderr" | "system";
  text: string;
};

export type PyFile = {
  name: string;
  content: string;
};

export function usePython() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isReady, setIsReady] = useState(false);
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

        // Set up the workspace directory and add it to sys.path
        try {
          pyodide.FS.mkdir("/workspace");
        } catch {
          // Directory may already exist
        }

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
        // Write all files to the virtual filesystem so they can be imported
        for (const file of files) {
          const path = `/workspace/${file.name}`;
          pyodideInstance.FS.writeFile(path, file.content, { encoding: "utf8" });
        }

        // Invalidate Python's import caches so re-imports pick up file changes
        await pyodideInstance.runPythonAsync(`
import importlib
import sys
# Remove cached modules that correspond to workspace files so re-imports are fresh
_to_remove = [k for k in sys.modules if not k.startswith('_') and k not in ('sys', 'importlib')]
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

  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  return { isInitializing, isReady, isRunning, output, runCode, clearOutput };
}

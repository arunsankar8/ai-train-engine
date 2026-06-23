import { useState, useEffect, useCallback } from "react";

export type OutputLine = {
  type: "stdout" | "stderr" | "system";
  text: string;
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

        if (mounted) {
          setPyodideInstance(pyodide);
          setIsReady(true);
          setOutput((prev) => [
            ...prev,
            { type: "system", text: "Python initialized and ready." },
          ]);
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to initialize Pyodide:", err);
          setOutput((prev) => [
            ...prev,
            { type: "stderr", text: `Failed to initialize Python: ${err}` },
          ]);
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    }

    initPyodide();

    return () => {
      mounted = false;
    };
  }, []);

  const runCode = useCallback(
    async (code: string) => {
      if (!isReady || !pyodideInstance) {
        setOutput((prev) => [
          ...prev,
          { type: "stderr", text: "Python is not ready yet." },
        ]);
        return;
      }

      setIsRunning(true);
      
      // Clear previous stdout/stderr setup by wrapping execution in a safe way
      // We buffer outputs and set them after execution to avoid async issues with React state updates
      let localOutput: OutputLine[] = [];
      
      pyodideInstance.setStdout({
        batched: (text: string) => {
          localOutput.push({ type: "stdout", text });
        },
      });
      
      pyodideInstance.setStderr({
        batched: (text: string) => {
          localOutput.push({ type: "stderr", text });
        },
      });

      try {
        await pyodideInstance.runPythonAsync(code);
        // Sometimes Python script might just return a value without printing
      } catch (err: any) {
        // Pyodide throws errors as string-like objects
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

  return {
    isInitializing,
    isReady,
    isRunning,
    output,
    runCode,
    clearOutput,
  };
}

import { useState, useEffect, useRef } from "react";
import { Editor, useMonaco } from "@monaco-editor/react";
import { Play, Trash2, TerminalSquare, Settings2, CheckCircle2, Loader2, Code2 } from "lucide-react";
import { usePython } from "@/hooks/use-python";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const DEFAULT_CODE = `# Welcome to Python Compiler!
# Press Ctrl+Enter or click Run to execute

def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
print("Python is running in your browser via Pyodide!")

# Try some math
import math
print(f"π ≈ {math.pi:.4f}")
print(f"√2 ≈ {math.sqrt(2):.4f}")
`;

function IDE() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const { isInitializing, isReady, isRunning, output, runCode, clearOutput } = usePython();
  const outputEndRef = useRef<HTMLDivElement>(null);
  const monaco = useMonaco();

  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [output]);

  const handleRun = () => {
    if (!isReady || isRunning) return;
    // Add an execution separator if there's already output
    if (output.length > 0) {
      runCode(code);
    } else {
      runCode(code);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
    }
  };

  // Configure Monaco theme when it loads
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('my-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
          { token: 'keyword', foreground: '10b981' }, // primary/emerald
          { token: 'string', foreground: 'fcd34d' },
          { token: 'number', foreground: '818cf8' },
        ],
        colors: {
          'editor.background': '#0a0a0a', // foreground matching background
          'editor.lineHighlightBackground': '#171717',
          'editorLineNumber.foreground': '#525252',
          'editorIndentGuide.background': '#262626',
        }
      });
      monaco.editor.setTheme('my-dark');
    }
  }, [monaco]);

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      {/* Header */}
      <header className="flex-none h-14 border-b border-border bg-card flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            <Code2 size={18} />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Python Compiler</h1>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {isInitializing ? (
                <>
                  <Loader2 size={10} className="animate-spin" />
                  <span>Loading Pyodide...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={10} className="text-primary" />
                  <span>Ready</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearOutput}
            disabled={output.length === 0}
            className="h-8 gap-1.5 text-xs"
            data-testid="clear-button"
          >
            <Trash2 size={14} />
            Clear
          </Button>
          <Button 
            size="sm" 
            onClick={handleRun} 
            disabled={!isReady || isRunning}
            className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium w-[88px] relative overflow-hidden group"
            data-testid="run-button"
          >
            {isRunning ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <Play size={14} className="fill-current" />
                Run
              </>
            )}
            
            {/* Click ripple effect container */}
            {isRunning && (
              <span className="absolute inset-0 bg-white/20 animate-pulse" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden" onKeyDown={handleKeyDown}>
        {/* Editor Pane */}
        <div className="flex-1 flex flex-col min-h-[50vh] md:min-h-0 border-r border-border" data-testid="code-editor">
          <div className="flex-none h-9 border-b border-border bg-card/50 flex items-center px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
            main.py
          </div>
          <div className="flex-1 relative bg-[#0a0a0a]">
            <Editor
              height="100%"
              defaultLanguage="python"
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark" // Will be overridden by my-dark once loaded
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "JetBrains Mono, monospace",
                lineHeight: 1.6,
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                formatOnPaste: true,
                suggest: { showWords: false },
              }}
              loading={
                <div className="flex items-center justify-center h-full text-muted-foreground gap-2 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Loading Editor...
                </div>
              }
            />
          </div>
        </div>

        {/* Output Pane */}
        <div className="flex-1 flex flex-col min-h-[30vh] md:min-h-0 bg-card" data-testid="output-panel">
          <div className="flex-none h-9 border-b border-border bg-card/50 flex items-center px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider gap-2">
            <TerminalSquare size={14} />
            Output
          </div>
          <ScrollArea className="flex-1 font-mono text-sm">
            <div className="p-4 space-y-1.5">
              {output.length === 0 ? (
                <div className="text-muted-foreground/50 text-center mt-8 text-xs">
                  Run some code to see output here.
                </div>
              ) : (
                output.map((line, i) => (
                  <div 
                    key={i} 
                    className={[
                      "whitespace-pre-wrap break-all leading-relaxed",
                      line.type === 'stderr' ? 'text-destructive' : '',
                      line.type === 'system' ? 'text-muted-foreground italic' : '',
                      line.type === 'stdout' ? 'text-foreground/90' : '',
                    ].join(' ')}
                  >
                    {line.text}
                  </div>
                ))
              )}
              <div ref={outputEndRef} />
            </div>
          </ScrollArea>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return <IDE />;
}

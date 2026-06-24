import { useState, useEffect, useRef, useCallback } from "react";
import { Editor, useMonaco } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import {
  Play, Trash2, TerminalSquare, Code2, CheckCircle2,
  Loader2, Plus, FileCode, X, Pencil, ChevronRight, Sparkles,
} from "lucide-react";
import { usePython, PyFile } from "@/hooks/use-python";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const INITIAL_FILES: PyFile[] = [
  {
    name: "main.py",
    content: "",
  },
];

function generateNewFileName(files: PyFile[]): string {
  let i = 1;
  while (files.some((f) => f.name === `file${i}.py`)) i++;
  return `file${i}.py`;
}

function mapCompletionKind(monaco: typeof Monaco, type: string): Monaco.languages.CompletionItemKind {
  const K = monaco.languages.CompletionItemKind;
  switch (type) {
    case "function": return K.Function;
    case "class":    return K.Class;
    case "module":   return K.Module;
    case "keyword":  return K.Keyword;
    case "instance": return K.Variable;
    case "param":    return K.TypeParameter;
    case "property": return K.Property;
    case "statement":return K.Variable;
    case "path":     return K.File;
    default:         return K.Text;
  }
}

export default function App() {
  const [files, setFiles] = useState<PyFile[]>(INITIAL_FILES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const monaco = useMonaco();

  const { isInitializing, isReady, jediReady, isRunning, output, runCode, clearOutput, getCompletions, getHover } =
    usePython();

  // Keep stable refs so Monaco providers don't need re-registration on every render
  const getCompletionsRef = useRef(getCompletions);
  useEffect(() => { getCompletionsRef.current = getCompletions; }, [getCompletions]);

  const getHoverRef = useRef(getHover);
  useEffect(() => { getHoverRef.current = getHover; }, [getHover]);

  // Keep a stable ref to the active file name for use inside the completion provider
  const activeFileNameRef = useRef(files[activeIndex]?.name ?? "main.py");
  useEffect(() => {
    activeFileNameRef.current = files[activeIndex]?.name ?? "main.py";
  }, [files, activeIndex]);

  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [output]);

  useEffect(() => {
    if (renamingIndex !== null && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingIndex]);

  // Register Monaco dark theme + Python completion provider
  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme("my-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6b7280", fontStyle: "italic" },
        { token: "keyword", foreground: "10b981" },
        { token: "string",  foreground: "fcd34d" },
        { token: "number",  foreground: "818cf8" },
      ],
      colors: {
        "editor.background": "#0a0a0a",
        "editor.lineHighlightBackground": "#171717",
        "editorLineNumber.foreground": "#525252",
        "editorIndentGuide.background": "#262626",
      },
    });
    monaco.editor.setTheme("my-dark");

    // Hover provider — shows signature + docstring when user hovers a symbol
    const hoverProvider = monaco.languages.registerHoverProvider("python", {
      provideHover: async (
        model: Monaco.editor.ITextModel,
        position: Monaco.Position
      ): Promise<Monaco.languages.Hover | null> => {
        const code = model.getValue();
        const line = position.lineNumber;
        const col  = position.column - 1; // Jedi uses 0-indexed columns

        const info = await getHoverRef.current(code, line, col, activeFileNameRef.current);
        if (!info) return null;

        const parts: string[] = [];

        // Signature block
        if (info.signature) {
          parts.push("```python\n" + info.signature + "\n```");
        }

        // Formatted docstring
        if (info.docstring) {
          const doc = info.docstring.trim();
          // Split on double-newlines to get paragraphs
          const paragraphs = doc.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
          // Show up to 4 paragraphs so the popup isn't overwhelming
          parts.push(paragraphs.slice(0, 4).join("\n\n"));
        }

        if (parts.length === 0) return null;

        // Highlight the hovered word range
        const word = model.getWordAtPosition(position);
        const range: Monaco.IRange | undefined = word
          ? {
              startLineNumber: position.lineNumber,
              endLineNumber:   position.lineNumber,
              startColumn: word.startColumn,
              endColumn:   word.endColumn,
            }
          : undefined;

        return {
          contents: [{ value: parts.join("\n\n---\n\n"), isTrusted: true }],
          range,
        };
      },
    });

    const provider = monaco.languages.registerCompletionItemProvider("python", {
      // Only trigger explicitly on dot — Monaco's quickSuggestions handles word typing
      triggerCharacters: ["."],
      provideCompletionItems: async (
        model: Monaco.editor.ITextModel,
        position: Monaco.Position
      ): Promise<Monaco.languages.CompletionList> => {
        const code = model.getValue();
        const line = position.lineNumber;     // 1-indexed (matches Jedi)
        const col  = position.column - 1;    // Jedi uses 0-indexed columns

        const items = await getCompletionsRef.current(code, line, col, activeFileNameRef.current);
        if (!items.length) return { suggestions: [] };

        // Build a word range so Monaco replaces the right text on accept
        const word = model.getWordUntilPosition(position);
        const range: Monaco.IRange = {
          startLineNumber: position.lineNumber,
          endLineNumber:   position.lineNumber,
          startColumn: word.startColumn,
          endColumn:   position.column,
        };

        const suggestions: Monaco.languages.CompletionItem[] = items.map((c) => {
          const kind = mapCompletionKind(monaco, c.type);
          const isCallable = c.type === "function" || c.type === "class";

          // Build a markdown documentation string shown in Monaco's detail panel
          const docParts: string[] = [];
          if (c.description) {
            docParts.push("```python\n" + c.description + "\n```");
          }
          if (c.docstring) {
            docParts.push(c.docstring);
          }
          const documentation = docParts.length
            ? { value: docParts.join("\n\n"), isTrusted: true }
            : undefined;

          return {
            label: {
              label: c.name,
              // Show type label inline in the dropdown (e.g. "def random() -> float")
              description: c.description || c.type,
            },
            kind,
            insertText: isCallable ? `${c.name}($1)` : c.name,
            insertTextRules: isCallable
              ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
              : undefined,
            // `detail` shows as grayed text right of the label
            detail: c.description || c.type,
            documentation,
            range,
            sortText: c.type === "keyword" ? "z" + c.name : c.name,
          };
        });

        return { suggestions };
      },
    });

    return () => {
      hoverProvider.dispose();
      provider.dispose();
    };
  }, [monaco]);

  const activeFile = files[activeIndex] ?? files[0];

  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      setFiles((prev) =>
        prev.map((f, i) => (i === activeIndex ? { ...f, content: value ?? "" } : f))
      );
    },
    [activeIndex]
  );

  const handleRun = useCallback(() => {
    if (!isReady || isRunning) return;
    runCode(activeFile.content, files);
  }, [isReady, isRunning, activeFile, files, runCode]);

  // Stable ref so Monaco's onMount can always call the latest handleRun
  const handleRunRef = useRef(handleRun);
  useEffect(() => { handleRunRef.current = handleRun; }, [handleRun]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
      if (e.key === "F5") {
        e.preventDefault();
        handleRun();
      }
    },
    [handleRun]
  );

  const addFile = () => {
    const name = generateNewFileName(files);
    const newFile: PyFile = { name, content: `# ${name}\n` };
    setFiles((prev) => [...prev, newFile]);
    setActiveIndex(files.length);
  };

  const deleteFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length === 1) return;
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    setActiveIndex((prev) => Math.min(prev, next.length - 1));
  };

  const startRename = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingIndex(index);
    setRenameValue(files[index].name);
  };

  const commitRename = () => {
    if (renamingIndex === null) return;
    const trimmed = renameValue.trim();
    const name = trimmed.endsWith(".py") ? trimmed : trimmed + ".py";
    if (name && !files.some((f, i) => i !== renamingIndex && f.name === name)) {
      setFiles((prev) =>
        prev.map((f, i) => (i === renamingIndex ? { ...f, name } : f))
      );
    }
    setRenamingIndex(null);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0a0a] text-zinc-200 overflow-hidden font-sans">
      {/* Header */}
      <header className="flex-none h-12 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-3 z-10 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded"
            data-testid="toggle-sidebar"
          >
            <ChevronRight
              size={16}
              className={["transition-transform duration-200", sidebarOpen ? "rotate-180" : ""].join(" ")}
            />
          </button>
          <div className="w-6 h-6 rounded bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
            <Code2 size={14} />
          </div>
          <span className="text-sm font-semibold text-zinc-100 truncate">Python Compiler</span>

          {/* Status indicators */}
          <div className="flex items-center gap-3 ml-1">
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              {isInitializing ? (
                <>
                  <Loader2 size={10} className="animate-spin" />
                  <span>Loading…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={10} className="text-emerald-500" />
                  <span className="text-emerald-600">Ready</span>
                </>
              )}
            </div>
            {/* Jedi / autocomplete status */}
            {!isInitializing && (
              <div className="flex items-center gap-1 text-xs" title={jediReady ? "Jedi autocomplete active" : "Loading autocomplete…"}>
                {jediReady ? (
                  <>
                    <Sparkles size={10} className="text-violet-400" />
                    <span className="text-violet-500">Autocomplete</span>
                  </>
                ) : (
                  <>
                    <Loader2 size={10} className="animate-spin text-zinc-600" />
                    <span className="text-zinc-600">Autocomplete…</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearOutput}
            disabled={output.length === 0}
            className="h-7 gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            data-testid="clear-button"
          >
            <Trash2 size={13} />
            Clear
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            disabled={!isReady || isRunning}
            className="h-7 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium w-20 relative overflow-hidden"
            data-testid="run-button"
          >
            {isRunning ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <>
                <Play size={13} className="fill-current" />
                Run
              </>
            )}
            {isRunning && <span className="absolute inset-0 bg-white/10 animate-pulse" />}
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden" onKeyDown={handleKeyDown}>
        {/* File Explorer Sidebar */}
        {sidebarOpen && (
          <aside className="w-48 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-950 overflow-hidden">
            <div className="flex items-center justify-between px-3 h-8 border-b border-zinc-800">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Files</span>
              <button
                onClick={addFile}
                className="text-zinc-500 hover:text-emerald-400 transition-colors rounded p-0.5"
                title="New file"
                data-testid="new-file-button"
              >
                <Plus size={14} />
              </button>
            </div>
            <ScrollArea className="flex-1">
              <div className="py-1">
                {files.map((file, i) => (
                  <div
                    key={i}
                    onClick={() => { setActiveIndex(i); setRenamingIndex(null); }}
                    data-testid={`file-item-${i}`}
                    className={[
                      "group flex items-center gap-1.5 px-2 py-1.5 cursor-pointer select-none",
                      i === activeIndex
                        ? "bg-zinc-800 text-zinc-100"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200",
                    ].join(" ")}
                  >
                    <FileCode
                      size={13}
                      className={i === activeIndex ? "text-emerald-400 shrink-0" : "text-zinc-600 shrink-0"}
                    />

                    {renamingIndex === i ? (
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") setRenamingIndex(null);
                          e.stopPropagation();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 min-w-0 bg-zinc-700 text-zinc-100 text-xs rounded px-1 py-0 outline-none border border-emerald-500/60 font-mono"
                        data-testid="rename-input"
                      />
                    ) : (
                      <span className="flex-1 min-w-0 text-xs font-mono truncate">{file.name}</span>
                    )}

                    {renamingIndex !== i && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => startRename(i, e)}
                          className="hover:text-zinc-200 p-0.5 rounded"
                          title="Rename"
                          data-testid={`rename-file-${i}`}
                        >
                          <Pencil size={11} />
                        </button>
                        {files.length > 1 && (
                          <button
                            onClick={(e) => deleteFile(i, e)}
                            className="hover:text-red-400 p-0.5 rounded"
                            title="Delete"
                            data-testid={`delete-file-${i}`}
                          >
                            <X size={11} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-800" data-testid="code-editor">
          {/* Tab bar */}
          <div className="flex-none h-8 border-b border-zinc-800 bg-zinc-950 flex items-center px-1 gap-0.5 overflow-x-auto">
            {files.map((file, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={[
                  "flex items-center gap-1.5 px-3 h-full text-xs font-mono rounded-t transition-colors whitespace-nowrap shrink-0 border-b-2",
                  i === activeIndex
                    ? "bg-[#0a0a0a] text-zinc-100 border-emerald-500"
                    : "text-zinc-500 hover:text-zinc-300 border-transparent hover:bg-zinc-800/50",
                ].join(" ")}
                data-testid={`tab-${i}`}
              >
                <FileCode size={11} className={i === activeIndex ? "text-emerald-400" : "text-zinc-600"} />
                {file.name}
              </button>
            ))}
            <button
              onClick={addFile}
              className="flex items-center justify-center w-7 h-full text-zinc-600 hover:text-emerald-400 transition-colors shrink-0"
              title="New file"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Monaco editor */}
          <div className="flex-1 bg-[#0a0a0a]">
            <Editor
              key={activeIndex}
              height="100%"
              defaultLanguage="python"
              value={activeFile?.content ?? ""}
              onChange={handleCodeChange}
              theme="my-dark"
              onMount={(editor, monacoInstance) => {
                // F5 to run — bound inside Monaco so it works when editor has focus
                editor.addCommand(monacoInstance.KeyCode.F5, () => {
                  handleRunRef.current();
                });
                // Ctrl+Enter / Shift+Enter inside Monaco
                editor.addCommand(
                  monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
                  () => { handleRunRef.current(); }
                );
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1.6,
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                wordBasedSuggestions: "off",
                suggest: {
                  showWords: false,
                  preview: true,
                  showIcons: true,
                  // Only accept with Tab or Enter, not on other commit characters
                  acceptSuggestionOnCommitCharacter: false,
                },
                // Show suggestions while typing, never on click
                quickSuggestions: {
                  other: "on",
                  comments: false,
                  strings: false,
                },
                quickSuggestionsDelay: 200,
                // Do not open suggestion widget on trigger chars from mouse click
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: "on",
                tabCompletion: "on",
                parameterHints: { enabled: true },
              }}
              loading={
                <div className="flex items-center justify-center h-full text-zinc-500 gap-2 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Loading Editor…
                </div>
              }
            />
          </div>
        </div>

        {/* Output Panel */}
        <div
          className="w-80 shrink-0 flex flex-col bg-zinc-950 md:w-[340px] lg:w-[400px]"
          data-testid="output-panel"
        >
          <div className="flex-none h-8 border-b border-zinc-800 flex items-center px-3 gap-2 text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
            <TerminalSquare size={12} />
            Output
          </div>
          <ScrollArea className="flex-1 font-mono text-sm">
            <div className="p-4 space-y-1">
              {output.length === 0 ? (
                <p className="text-zinc-600 text-xs text-center mt-8">
                  Run some code to see output here.
                </p>
              ) : (
                output.map((line, i) => (
                  <div
                    key={i}
                    className={[
                      "whitespace-pre-wrap break-all leading-relaxed text-[13px]",
                      line.type === "stderr" ? "text-red-400" : "",
                      line.type === "system" ? "text-zinc-500 italic" : "",
                      line.type === "stdout" ? "text-zinc-200" : "",
                    ].join(" ")}
                  >
                    {line.text}
                  </div>
                ))
              )}
              <div ref={outputEndRef} />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

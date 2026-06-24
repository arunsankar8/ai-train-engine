import { useState, useRef, useEffect, useCallback } from "react";
import { X, Search, BookOpen, Loader2, ChevronRight } from "lucide-react";
import { PYTHON_TOPICS, KIND_COLORS, type PythonTopic } from "@/data/python-topics";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  onClose: () => void;
  getDocumentation: (query: string, kind: string) => Promise<string | null>;
  pyodideReady: boolean;
};

const KIND_LABEL: Record<string, string> = {
  keyword:   "keyword",
  topic:     "concept",
  builtin:   "built-in",
  type:      "type",
  module:    "module",
  exception: "exception",
};

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-zinc-100 font-semibold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

// Render pydoc help() output — split into lines and colour section headers
function formatDoc(raw: string): React.ReactNode {
  const lines = raw.split("\n");
  const nodes: React.ReactNode[] = [];
  let key = 0;
  let i = 0;

  // pydoc section headers are ALL-CAPS words on their own line (NAME, FUNCTIONS, etc.)
  const isSectionHeader = (line: string) => {
    const t = line.trim();
    return (
      t.length > 1 &&
      t.length < 40 &&
      t === t.toUpperCase() &&
      /^[A-Z][A-Z\s_-]+$/.test(t)
    );
  };

  // Underline / dashed separator lines — skip them
  const isSeparator = (line: string) => /^[=\-*#]{3,}$/.test(line.trim());

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    i++;

    if (!trimmed) {
      nodes.push(<div key={key++} className="h-1.5" />);
      continue;
    }

    if (isSeparator(trimmed)) continue;

    if (isSectionHeader(trimmed)) {
      nodes.push(
        <p key={key++} className="text-violet-400 font-bold text-[11px] uppercase tracking-widest mt-5 mb-1 border-b border-zinc-800 pb-1">
          {trimmed}
        </p>
      );
      continue;
    }

    // "Help on …" header line
    if (trimmed.startsWith("Help on ")) {
      nodes.push(
        <p key={key++} className="text-zinc-500 text-xs italic mb-3">{trimmed}</p>
      );
      continue;
    }

    // Lines that look like function/class signatures (contain parens, no leading spaces)
    const isSignature =
      !line.startsWith("  ") &&
      (trimmed.includes("(") || trimmed.endsWith(":")) &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("|") &&
      trimmed.length < 200;

    if (isSignature && /^[a-zA-Z_]/.test(trimmed)) {
      nodes.push(
        <pre key={key++} className="font-mono text-emerald-300 text-xs bg-zinc-900 rounded px-2 py-0.5 my-1 overflow-x-auto whitespace-pre-wrap">
          {trimmed}
        </pre>
      );
      continue;
    }

    // Indented lines — code / body text
    if (line.startsWith("    ") || line.startsWith("\t")) {
      nodes.push(
        <p key={key++} className="font-mono text-xs text-zinc-400 leading-relaxed pl-4 whitespace-pre-wrap">
          {trimmed}
        </p>
      );
      continue;
    }

    // Regular text
    nodes.push(
      <p key={key++} className="text-zinc-300 text-sm leading-relaxed">
        {trimmed}
      </p>
    );
  }

  return <>{nodes}</>;
}

export default function ReferencePanel({ onClose, getDocumentation, pyodideReady }: Props) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<PythonTopic[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selected, setSelected] = useState<PythonTopic | null>(null);
  const [docText, setDocText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Filter suggestions as user types
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      return;
    }
    const matches = PYTHON_TOPICS.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.query.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q)
    ).slice(0, 12);
    setSuggestions(matches);
    setHighlightIndex(0);
  }, [search]);

  const fetchDoc = useCallback(
    async (topic: PythonTopic) => {
      setSelected(topic);
      setShowSuggestions(false);
      setSearch(topic.label);
      setDocText(null);
      setLoading(true);
      const result = await getDocumentation(topic.query, topic.kind);
      setDocText(result ?? `No documentation found for "${topic.query}".`);
      setLoading(false);
    },
    [getDocumentation]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      fetchDoc(suggestions[highlightIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Scroll highlighted suggestion into view
  useEffect(() => {
    const el = suggestionRef.current?.children[highlightIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex]);

  return (
    <div className="w-[420px] shrink-0 flex flex-col border-l border-zinc-800 bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="flex-none h-12 border-b border-zinc-800 flex items-center gap-2 px-3">
        <BookOpen size={14} className="text-violet-400 shrink-0" />
        <span className="text-sm font-semibold text-zinc-100 flex-1">Python Reference</span>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded"
        >
          <X size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="flex-none px-3 py-2 border-b border-zinc-800 relative">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder="Search: for loop, random, list, map…"
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded px-8 py-1.5 outline-none focus:border-violet-500/60 transition-colors placeholder:text-zinc-600"
          />
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionRef}
            className="absolute left-3 right-3 top-full mt-1 z-50 bg-zinc-900 border border-zinc-700 rounded shadow-xl max-h-64 overflow-y-auto"
          >
            {suggestions.map((t, i) => (
              <button
                key={t.query + t.kind}
                onMouseDown={() => fetchDoc(t)}
                className={[
                  "w-full text-left px-3 py-2 flex items-center gap-2 transition-colors",
                  i === highlightIndex ? "bg-zinc-700" : "hover:bg-zinc-800",
                ].join(" ")}
              >
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono shrink-0 ${KIND_COLORS[t.kind]}`}>
                  {KIND_LABEL[t.kind]}
                </span>
                <span className="text-sm text-zinc-200 flex-1 min-w-0 truncate">
                  {highlight(t.label, search.trim())}
                </span>
                <span className="text-xs text-zinc-500 truncate max-w-[120px] shrink-0 hidden sm:block">
                  {t.desc}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {!pyodideReady && !selected && (
            <div className="flex flex-col items-center justify-center mt-16 gap-3 text-zinc-600">
              <Loader2 size={20} className="animate-spin" />
              <p className="text-xs">Waiting for Python to load…</p>
            </div>
          )}

          {pyodideReady && !selected && (
            <div className="mt-6 space-y-5">
              <p className="text-zinc-500 text-xs text-center">Search any Python keyword, module, function, or concept</p>
              {/* Quick category pills */}
              {(["keyword", "topic", "builtin", "type", "module", "exception"] as const).map((kind) => {
                const items = PYTHON_TOPICS.filter((t) => t.kind === kind).slice(0, 6);
                return (
                  <div key={kind}>
                    <p className={`text-[10px] uppercase tracking-wider font-semibold mb-2 px-1 ${KIND_COLORS[kind].split(" ")[1]}`}>
                      {KIND_LABEL[kind]}s
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((t) => (
                        <button
                          key={t.query}
                          onClick={() => fetchDoc(t)}
                          className={`text-xs px-2 py-0.5 rounded border transition-colors hover:opacity-80 ${KIND_COLORS[t.kind]}`}
                        >
                          {t.label}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setSearch(KIND_LABEL[kind]);
                          searchRef.current?.focus();
                          setSuggestions(PYTHON_TOPICS.filter((t) => t.kind === kind));
                          setShowSuggestions(true);
                        }}
                        className="text-xs px-2 py-0.5 rounded border border-zinc-700 text-zinc-500 hover:text-zinc-300 flex items-center gap-0.5"
                      >
                        more <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center mt-16 gap-3 text-zinc-500">
              <Loader2 size={20} className="animate-spin text-violet-400" />
              <p className="text-xs">Fetching docs for <span className="text-violet-300">{selected?.label}</span>…</p>
            </div>
          )}

          {!loading && selected && docText && (
            <div>
              {/* Topic header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono shrink-0 ${KIND_COLORS[selected.kind]}`}>
                  {KIND_LABEL[selected.kind]}
                </span>
                <span className="text-base font-semibold text-zinc-100">{selected.label}</span>
              </div>
              <div className="space-y-1">
                {formatDoc(docText)}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

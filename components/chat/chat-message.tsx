import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"
import { Sparkles, Copy, Check } from "lucide-react"

function tokenize(code: string, language: string) {
  const rules = {
    comment: /(\/\/.*|\/\*[\s\S]*?\*\/|#.*)/,
    string: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^\`\\])*`)/,
    keyword: /\b(const|let|var|function|return|import|export|from|default|class|extends|if|else|for|while|do|switch|case|break|continue|new|try|catch|finally|throw|async|await|yield|def|print|import|as|from|self|class|in|is|not|and|or|elif|pass|lambda|return|null|undefined|true|false)\b/,
    type: /\b(string|number|boolean|any|void|unknown|never|object|Array|Map|Set|Promise|Error|dict|list|set|tuple|str|int|float|bool|List|Dict|Tuple|Optional|Union)\b/,
    number: /\b(\d+(\.\d+)?)\b/,
    functionName: /\b(\w+)(?=\s*\()/,
  };

  const masterRegex = new RegExp(
    Object.entries(rules)
      .map(([name, regex]) => `(?<${name}>${regex.source})`)
      .join("|") + "|(?<other>[\\s\\S])",
    "g"
  );

  const tokens: { text: string; className?: string }[] = [];
  let match;
  masterRegex.lastIndex = 0;
  
  while ((match = masterRegex.exec(code)) !== null) {
    const groups = match.groups as any;
    if (groups.comment) {
      tokens.push({ text: groups.comment, className: "text-zinc-500 italic" });
    } else if (groups.string) {
      tokens.push({ text: groups.string, className: "text-emerald-400" });
    } else if (groups.keyword) {
      tokens.push({ text: groups.keyword, className: "text-pink-400 font-semibold" });
    } else if (groups.type) {
      tokens.push({ text: groups.type, className: "text-cyan-400" });
    } else if (groups.number) {
      tokens.push({ text: groups.number, className: "text-amber-400" });
    } else if (groups.functionName) {
      tokens.push({ text: groups.functionName, className: "text-sky-400" });
    } else if (groups.other) {
      tokens.push({ text: groups.other, className: "text-zinc-300" });
    }
    if (match.index === masterRegex.lastIndex) {
      masterRegex.lastIndex++;
    }
  }
  return tokens;
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const highlighted = tokenize(code, language);

  return (
    <div className="relative my-4 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden text-left">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/60 border-b border-zinc-800 text-[10px] text-zinc-400 font-mono select-none">
        <span>{language}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-zinc-100 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono">
        <code>
          {highlighted.map((token, i) => (
            <span key={i} className={token.className}>{token.text}</span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export function ChatMessage({ message }: { message: { role: string, content: string } }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  
  if (isSystem) {
    return (
      <div className="flex w-full justify-center mb-6">
        <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-8`}>
      <div className={`flex max-w-full md:max-w-[80%] gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {!isUser && (
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border shadow-sm bg-primary text-primary-foreground mt-1">
            <Sparkles className="h-5 w-5" />
          </div>
        )}
        <div className={`px-5 py-3 ${isUser ? "rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-foreground" : "rounded-none bg-transparent"}`}>
          <div className="max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkMath]} 
              rehypePlugins={[rehypeKatex]}
              components={{
                h3: ({ node, ...props }) => <h3 className={`text-lg font-bold mt-6 mb-3 ${isUser ? "text-inherit" : "text-primary"}`} {...props} />,
                h4: ({ node, ...props }) => <h4 className={`text-base font-semibold mt-4 mb-2 ${isUser ? "text-inherit" : "text-zinc-800 dark:text-zinc-100"}`} {...props} />,
                p: ({ node, ...props }) => <p className={`text-sm leading-relaxed mb-4 ${isUser ? "text-inherit" : "text-zinc-700 dark:text-zinc-300"}`} {...props} />,
                ul: ({ node, ...props }) => <ul className={`list-disc pl-5 mb-4 space-y-2 text-sm ${isUser ? "text-inherit" : "text-zinc-700 dark:text-zinc-300"}`} {...props} />,
                ol: ({ node, ...props }) => <ol className={`list-decimal pl-5 mb-4 space-y-2 text-sm ${isUser ? "text-inherit" : "text-zinc-700 dark:text-zinc-300"}`} {...props} />,
                li: ({ node, ...props }) => <li className="text-sm mb-1" {...props} />,
                strong: ({ node, ...props }) => <strong className={`font-bold ${isUser ? "text-inherit" : "text-zinc-900 dark:text-zinc-100"}`} {...props} />,
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <table className="w-full border-collapse text-sm text-left" {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => <thead className="bg-zinc-100 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800" {...props} />,
                th: ({ node, ...props }) => <th className="px-4 py-3 font-semibold text-zinc-800 dark:text-zinc-200" {...props} />,
                td: ({ node, ...props }) => <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-800/50" {...props} />,
                code: ({ node, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  const codeContent = String(children).replace(/\n$/, '');
                  return !match ? (
                    <code className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 px-1.5 py-0.5 rounded text-xs font-mono text-zinc-800 dark:text-zinc-200" {...props}>
                      {children}
                    </code>
                  ) : (
                    <CodeBlock code={codeContent} language={language} />
                  );
                },
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-primary bg-primary/5 pl-4 pr-2 py-3 my-4 italic text-zinc-700 dark:text-zinc-300 rounded-r-2xl" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}

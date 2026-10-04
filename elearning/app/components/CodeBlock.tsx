"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

type CodeBlockProps = {
  code: string;
  language?: string;
  filename?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function highlight(code: string, language: string) {
  const escaped = escapeHtml(code);
  const lang = language.toLowerCase();

  if (["html", "xml", "jsx", "tsx"].includes(lang)) {
    return escaped
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="codeComment">$1</span>')
      .replace(/(&lt;\/?)([a-zA-Z][\w.-]*)/g, '$1<span class="codeTag">$2</span>')
      .replace(/([a-zA-Z:-]+)(=)(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="codeAttr">$1</span>$2<span class="codeString">$3</span>');
  }

  if (["css", "scss"].includes(lang)) {
    return escaped
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="codeComment">$1</span>')
      .replace(/([.#]?[a-zA-Z][\w-]*)(\s*\{)/g, '<span class="codeSelector">$1</span>$2')
      .replace(/(["'].*?["'])/g, '<span class="codeString">$1</span>');
  }

  if (["js", "javascript", "ts", "typescript", "jsx", "tsx", "json"].includes(lang)) {
    return escaped
      .replace(/(\/\/.*)$/gm, '<span class="codeComment">$1</span>')
      .replace(/(["'\`].*?["'\`])/g, '<span class="codeString">$1</span>')
      .replace(/\b(const|let|var|function|return|if|else|for|while|class|new|import|from|export|default|async|await|try|catch|throw|interface|type|extends|implements)\b/g, '<span class="codeKeyword">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, '<span class="codeBoolean">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="codeNumber">$1</span>');
  }

  return escaped;
}

export default function CodeBlock({ code, language = "text", filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const highlighted = useMemo(() => highlight(code, language), [code, language]);
  const lines = highlighted.split("\n");

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <figure className="codeBlock">
      <figcaption className="codeBlockHeader">
        <span>
          {filename ? <strong>{filename}</strong> : null}
          <small>{language}</small>
        </span>
        <button type="button" onClick={copyCode} aria-label="Copy code">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre className="codeBlockBody">
        <code>
          {lines.map((line, index) => (
            <span className="codeLine" key={index}>
              <span className="codeLineNumber" aria-hidden="true">{index + 1}</span>
              <span dangerouslySetInnerHTML={{ __html: line || " " }} />
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

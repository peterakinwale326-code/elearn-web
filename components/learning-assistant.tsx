"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Bot, RotateCcw, Send, Sparkles, X } from "lucide-react";
import styles from "./learning-assistant.module.css";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type LearningAssistantProps = {
  courseId: string;
  courseTitle: string;
  variant?: "floating" | "embedded";
};

const maximumSavedMessages = 40;
const suggestedPrompts = [
  "Explain a difficult idea",
  "Help me plan my revision",
  "Give me a practice question",
];

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function formatAnswer(content: string) {
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let listType: "ul" | "ol" | null = null;

  function flushParagraph() {
    if (paragraph.length === 0) return;
    blocks.push(<p key={`p-${blocks.length}`}>{renderInline(paragraph.join(" "))}</p>);
    paragraph = [];
  }

  function flushList() {
    if (list.length === 0 || !listType) return;
    const List = listType;
    blocks.push(
      <List key={`list-${blocks.length}`}>
        {list.map((item, index) => <li key={index}>{renderInline(item)}</li>)}
      </List>,
    );
    list = [];
    listType = null;
  }

  for (const line of content.split(/\r?\n/)) {
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.+)$/);

    if (heading) {
      flushParagraph();
      flushList();
      const Heading = heading[1].length === 1 ? "h3" : "h4";
      blocks.push(<Heading key={`h-${blocks.length}`}>{renderInline(heading[2])}</Heading>);
    } else if (bullet || numbered) {
      flushParagraph();
      const nextType = bullet ? "ul" : "ol";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      list.push((bullet ?? numbered)![1]);
    } else if (line.trim()) {
      flushList();
      paragraph.push(line.trim());
    } else {
      flushParagraph();
      flushList();
    }
  }

  flushParagraph();
  flushList();
  return blocks;
}

function storageKey(courseId: string) {
  return `fieldnote-chat-${courseId}`;
}

function restoreMessages(courseId: string): ChatMessage[] {
  try {
    const saved = localStorage.getItem(storageKey(courseId));
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is ChatMessage =>
      item &&
      typeof item === "object" &&
      (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string",
    ).slice(-maximumSavedMessages);
  } catch {
    return [];
  }
}

export default function LearningAssistant({
  courseId,
  courseTitle,
  variant = "floating",
}: LearningAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(variant === "embedded");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [restoredFor, setRestoredFor] = useState("");
  const endOfMessages = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRestoredFor("");
    setMessages(restoreMessages(courseId));
    setRestoredFor(courseId);
  }, [courseId]);

  useEffect(() => {
    if (restoredFor !== courseId) return;
    try {
      localStorage.setItem(
        storageKey(courseId),
        JSON.stringify(messages.slice(-maximumSavedMessages)),
      );
    } catch {
      setNotice("This browser could not save the conversation.");
    }
  }, [courseId, messages, restoredFor]);

  useEffect(() => {
    endOfMessages.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending, open]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || pending) return;

    const history: ChatMessage[] = [
      ...messages.slice(-(maximumSavedMessages - 1)),
      { role: "user" as const, content },
    ];
    setInput("");
    setPending(true);
    setNotice("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
        }),
      });
      const result = await response.json() as {
        reply?: string;
        message?: string;
      };

      if (!response.ok || !result.reply) {
        throw new Error(result.message || "The assistant could not answer just now.");
      }

      setMessages((current) => [
        ...current,
        history.at(-1)!,
        { role: "assistant" as const, content: result.reply! },
      ].slice(-maximumSavedMessages));
    } catch (error) {
      setInput(content);
      setNotice(error instanceof Error ? error.message : "The assistant could not answer just now.");
    } finally {
      setPending(false);
    }
  }

  function clearConversation() {
    setMessages([]);
    setNotice("");
  }

  return (
    <div className={`${styles.root} ${variant === "embedded" ? styles.embeddedRoot : ""}`}>
      {open && (
        <section
          className={`${styles.panel} ${variant === "embedded" ? styles.embeddedPanel : ""}`}
          aria-label="Learning assistant"
        >
          <header className={styles.header}>
            <div className={styles.identity}>
              <span className={styles.avatar}><Bot size={19} /></span>
              <span>
                <strong>Study assistant</strong>
                <small>{courseTitle}</small>
              </span>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={clearConversation}
                aria-label="Clear conversation"
                title="Clear conversation"
                disabled={messages.length === 0 || pending}
              >
                <RotateCcw size={16} />
              </button>
              {variant === "floating" && (
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => setOpen(false)}
                  aria-label="Close assistant"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </header>

          <div className={styles.transcript} aria-live="polite" aria-relevant="additions text">
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}><Sparkles size={19} /></span>
                <strong>What would you like to explore?</strong>
                <p>Ask a question, share an idea, or start with one of these.</p>
                <div className={styles.suggestions}>
                  {suggestedPrompts.map((prompt) => (
                    <button
                      type="button"
                      key={prompt}
                      onClick={() => {
                        setInput(prompt);
                        inputRef.current?.focus();
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.messages}>
                {messages.map((message, index) => (
                  <article
                    className={`${styles.message} ${message.role === "user" ? styles.userMessage : styles.assistantMessage}`}
                    key={`${index}-${message.role}`}
                  >
                    <span className={styles.messageRole}>
                      {message.role === "user" ? "You" : "Fieldnote"}
                    </span>
                    {message.role === "assistant" ? (
                      <div className={styles.answerContent}>{formatAnswer(message.content)}</div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </article>
                ))}
              </div>
            )}
            {pending && (
              <div className={styles.typing} role="status">
                <span /><span /><span />
                <span className={styles.srOnly}>Assistant is thinking</span>
              </div>
            )}
            <div ref={endOfMessages} />
          </div>

          {notice && (
            <p className={styles.errorNotice} role="status">
              {notice}
            </p>
          )}

          <form className={styles.composer} onSubmit={sendMessage}>
            <label className={styles.srOnly} htmlFor={`assistant-input-${courseId}`}>
              Message the study assistant
            </label>
            <input
              ref={inputRef}
              id={`assistant-input-${courseId}`}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask or share what's on your mind..."
              maxLength={maximumSavedMessages * 60}
              disabled={pending}
            />
            <button type="submit" aria-label="Send message" disabled={!input.trim() || pending}>
              <Send size={17} />
            </button>
          </form>
          <p className={styles.privacyNote}>Saved in this browser. Messages are sent to the learning service for replies.</p>
        </section>
      )}

      {variant === "floating" && (
        <button
          type="button"
          className={`${styles.launcher} ${open ? styles.launcherOpen : ""}`}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close learning assistant" : "Open learning assistant"}
        >
          {open ? <X size={20} /> : <><Bot size={20} /><span>Ask Fieldnote</span></>}
        </button>
      )}
    </div>
  );
}
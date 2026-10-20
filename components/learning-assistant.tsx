"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, RotateCcw, Send, Sparkles, X } from "lucide-react";
import styles from "./learning-assistant.module.css";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type LearningAssistantProps = {
  courseId: string;
  courseTitle: string;
  lessonTitle?: string;
  lessonContent?: string;
};

const maximumSavedMessages = 40;

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
  lessonTitle,
  lessonContent,
}: LearningAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [restoredFor, setRestoredFor] = useState("");
  const endOfMessages = useRef<HTMLDivElement>(null);

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

    const history = [
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
          courseTitle,
          lessonTitle,
          lessonContent,
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
        { role: "assistant", content: result.reply! },
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
    <div className={styles.root}>
      {open && (
        <section className={styles.panel} aria-label="Learning assistant">
          <header className={styles.header}>
            <div className={styles.identity}>
              <span className={styles.avatar}><Bot size={19} /></span>
              <span>
                <strong>Study assistant</strong>
                <small>{lessonTitle ? `Following ${lessonTitle}` : courseTitle}</small>
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
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <div className={styles.transcript} aria-live="polite" aria-relevant="additions text">
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}><Sparkles size={19} /></span>
                <strong>What are you working on?</strong>
                <p>Ask a question about this course or get help with the lesson you have open.</p>
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
                    <p>{message.content}</p>
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
              id={`assistant-input-${courseId}`}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about this lesson..."
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

      <button
        type="button"
        className={`${styles.launcher} ${open ? styles.launcherOpen : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close learning assistant" : "Open learning assistant"}
      >
        {open ? <X size={20} /> : <><Bot size={20} /><span>Ask Fieldnote</span></>}
      </button>
    </div>
  );
}
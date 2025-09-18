"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "./ChatBox.css";

export function MarkdownBlock({ content }: { content: string }) {
  return <div><ReactMarkdown>{content}</ReactMarkdown></div>;
}

export default function ChatBox({ onEnd }: { onEnd: () => void }) {
  const [messages, setMessages] = useState<{ role: string; text: string; loading?: boolean }[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  async function sendMessage() {
    if (!input.trim()) return;

    // Add user message
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    // Add temporary AI loading message
    const loadingMsg = { role: "assistant", text: "", loading: true };
    setMessages((prev) => [...prev, loadingMsg]);

    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();

      // Replace loading message with actual AI response
      setMessages((prev) =>
        prev.map((m) =>
          m.loading ? { role: "assistant", text: data.answer || "I don’t know." } : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.loading ? { role: "assistant", text: "Error: Unable to get response." } : m
        )
      );
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-box">
        <h1>LawBandit QA ChatBot</h1>

        <div ref={scrollRef} className="chat-messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`chat-message ${m.role === "user" ? "user-message" : "ai-message"}`}
            >
              {m.loading ? <div className="spinner"></div> : <MarkdownBlock content={m.text} />}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
          <button onClick={onEnd}>End Chat</button>
        </div>
      </div>
    </div>
  );
}

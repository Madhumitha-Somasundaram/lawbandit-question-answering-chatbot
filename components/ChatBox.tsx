"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";


export function MarkdownBlock({ content }: { content: string }) {
  return (
    <div className="border rounded p-2 my-2 prose prose-sm">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

export default function ChatBox({ onEnd }: { onEnd: () => void }) {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  async function sendMessage() {
    if (!input.trim()) return;

    const newMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, newMsg]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: data.answer || "I don’t know." },
    ]);

    setInput("");
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="p-4 border rounded mt-4 flex flex-col h-[500px]">
      <h1 className="text-2xl font-bold text-center text-blue-700 mb-4">
        LawBandit QA ChatBot
      </h1>
      <div ref={scrollRef} className="flex-1 overflow-y-auto border p-2 mb-2 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-blue-600" : "text-green-600"}>
            <strong>{m.role === "user" ? "You" : "AI"}:</strong>
            <MarkdownBlock content={m.text || ""} />
          </div>
        ))}
      </div>

      <div className="flex mt-auto space-x-2">
        <input
          className="flex-1 border p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-green-600 text-white"
        >
          Send
        </button>
        <button
          onClick={onEnd}
          className="px-4 py-2 bg-red-600 text-white"
        >
          End Chat
        </button>
      </div>
    </div>
  );
}

import { FormEvent, useState } from "react";
import axios from "axios";
import { ChatBubble } from "./ChatBubble";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessage: Message = { role: "user", content: input.trim() };
    const history = [...messages, newMessage];
    setMessages(history);
    setInput("");
    setLoading(true);
    try {
      const res = await axios.post("/api/v1/chat", {
        history,
        user_input: newMessage.content
      });
      const reply: Message = { role: "assistant", content: res.data.reply };
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I could not reach the backend. Please check if the FastAPI server is running."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400">
            Ask anything about FY 2024–25 Indian income tax. I will explain in
            simple language (educational only, not legal advice).
          </p>
        )}
        {messages.map((m, idx) => (
          <ChatBubble key={idx} role={m.role} content={m.content} />
        ))}
        {loading && (
          <div className="text-xs text-slate-500">Thinking with local model…</div>
        )}
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input
          className="input flex-1"
          placeholder="Type your tax question or describe your situation…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}



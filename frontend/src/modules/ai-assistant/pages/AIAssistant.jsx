import { useState, useEffect, useRef } from "react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { Bot, Send, Sparkles, User, Loader2 } from "lucide-react";

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: `Hello ${user?.name || "there"}! 👋 I am your HCM Lite Executive AI Assistant. How can I help you today with your attendance, leave records, or organizational queries?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = { id: Date.now(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", { prompt: text });
      const aiReply = res.data?.answer || "I processed your inquiry based on company records.";
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "ai", text: aiReply, data: res.data?.data },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "ai", text: "Sorry, I encountered an issue retrieving that record. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "What is the total headcount?",
    "Show attendance summary for today",
    "Are there any pending leave approvals?",
    "What is the current payroll summary?",
    "How many employees are late today?",
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-slate-300 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              HCM Lite AI Assistant <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-xs font-bold text-slate-600">Natural language workforce query engine</p>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                m.sender === "user"
                  ? "bg-slate-900 text-white"
                  : "bg-indigo-600 text-white shadow-xs"
              }`}
            >
              {m.sender === "user" ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium leading-relaxed ${
                m.sender === "user"
                  ? "bg-indigo-600 text-white font-bold rounded-tr-none shadow-sm"
                  : "bg-slate-100 text-slate-900 font-semibold rounded-tl-none border border-slate-200"
              }`}
            >
              <p className="whitespace-pre-line">{m.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot size={14} />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-700">
              <Loader2 size={14} className="animate-spin text-indigo-600" />
              <span>Analyzing organization records...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
        <Sparkles size={12} className="text-indigo-600 shrink-0" />
        <span className="text-slate-700 font-black shrink-0">Quick Queries:</span>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s)}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-800 border border-slate-300 shrink-0 transition-colors font-bold cursor-pointer shadow-xs"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-3.5 border-t border-slate-200 flex items-center gap-2 bg-white">
        <input
          type="text"
          placeholder="Ask anything about headcount, leaves, payroll, attendance..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="btn-primary py-2.5 px-4 disabled:opacity-40"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { SendHorizonal, Bot, Shield } from "lucide-react";
import axios from "axios";

export default function ChatAssistant() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔄 Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("/api/chat", { message: input });
      const reply = res.data.reply || "⚠️ I couldn’t process that request right now.";
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "⚠️ Network or server error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-6 right-6 w-80 bg-gradient-to-b from-[#1a1a1f] to-[#0d0d11] rounded-2xl shadow-lg border border-purple-600/40 overflow-hidden backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span>MindShield Assistant</span>
        </div>
      </div>

      {/* Messages */}
      <div className="p-3 h-80 overflow-y-auto space-y-3 text-sm text-gray-200 scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-transparent">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-20">
            💬 Ask me about phishing, breaches, or cybersecurity insights!
          </p>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl ${
              msg.role === "user"
                ? "bg-purple-700/30 self-end text-right ml-10"
                : "bg-blue-700/20 border border-blue-600/20 text-left mr-10"
            }`}
          >
            {msg.role === "bot" && (
              <div className="flex items-center gap-2 mb-1 text-purple-400 text-xs">
                <Bot className="w-3 h-3" />
                <span>MindShield</span>
              </div>
            )}
            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
          </motion.div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm animate-pulse">
            <Bot className="w-4 h-4 text-purple-400" /> Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t border-gray-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1 bg-transparent text-gray-200 text-sm placeholder-gray-500 focus:outline-none"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition"
        >
          <SendHorizonal className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

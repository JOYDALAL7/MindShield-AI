"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SendHorizonal, Bot, Shield, Minus, MessageSquare } from "lucide-react";
import axios from "axios";

export default function ChatAssistant() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const mine = { role: "user", text: input };
    setMessages((prev) => [...prev, mine]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("/api/chat", { message: mine.text });

      const reply = res.data?.reply || "⚠️ I couldn’t process that.";
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Network or server error." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating AI orb when minimized */}
      {!open && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.25 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-xl shadow-purple-500/40 flex items-center justify-center text-white"
        >
          <motion.div
            className="absolute w-full h-full rounded-full bg-purple-500/40 blur-xl"
            animate={{ opacity: [0.5, 0.2, 0.5], scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <MessageSquare className="w-6 h-6 relative" />
        </motion.button>
      )}

      {/* Chatbox */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-6 right-6 w-80 md:w-96 bg-[#0c0c11] rounded-2xl border border-purple-700/40 shadow-2xl shadow-purple-500/25 backdrop-blur-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>MindShield Assistant</span>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition"
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="p-4 h-80 overflow-y-auto space-y-3 text-sm text-gray-200 scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-transparent">
              {messages.length === 0 && (
                <p className="text-gray-400 text-center mt-20">
                  🧠 I’m here to help with cybersecurity, threats, malware, phishing, and more.
                </p>
              )}

              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-xl max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-purple-700/30 self-end ml-auto text-right"
                      : "bg-blue-700/20 border border-blue-600/20 mr-auto text-left"
                  }`}
                >
                  {msg.role === "bot" && (
                    <div className="flex items-center gap-1 mb-1 text-purple-300 text-xs">
                      <Bot className="w-3 h-3" />
                      <span>MindShield</span>
                    </div>
                  )}
                  {msg.text}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex items-center gap-2 text-purple-400 text-sm">
                  <Bot className="w-4 h-4" />
                  <motion.div
                    className="flex gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.span
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                    />
                    <motion.span
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    />
                    <motion.span
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    />
                  </motion.div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 p-3 border-t border-gray-800">
              <input
                type="text"
                className="flex-1 bg-transparent text-gray-200 text-sm placeholder-gray-500 focus:outline-none"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />

              <motion.button
                whileTap={{ scale: 0.9 }}
                disabled={loading}
                onClick={handleSend}
                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition"
              >
                <SendHorizonal className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#22c55e", "#ef4444", "#6366f1", "#a855f7"];

export default function Analytics({ data }: { data: any[] }) {

  // --- 🧠 Correct Safe + Risky Calculation ---
  const totalScans = data.length;

  const safeCount = data.filter(d => {
    if (typeof d.riskScore === "number") return d.riskScore < 40;
    return !d.isRisky; // fallback
  }).length;

  const riskyCount = totalScans - safeCount;

  const pieData = [
    { name: "Safe", value: safeCount },
    { name: "Risky", value: riskyCount },
  ];

  // --- 📈 Line Chart Now Uses riskScore (0–100) ---
  const lineData = data.map((d, i) => ({
    scan: `#${i + 1}`,
    Score: typeof d.riskScore === "number"
      ? d.riskScore
      : d.isRisky
      ? 70
      : 20,
  }));

  // --- 📊 Category Bar Chart ---
  const categoryData = [
    { name: "Phishing", value: data.filter((d) => d.type === "phishing").length },
    { name: "IP Check", value: data.filter((d) => d.type === "ip").length },
    { name: "Data Leak", value: data.filter((d) => d.type === "dataleak").length },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md mt-12 shadow-lg"
    >
      <h2 className="text-2xl font-semibold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
        📊 AI Threat Analytics
      </h2>

      <div className="grid md:grid-cols-3 gap-6">

        {/* 🍩 PIE CHART */}
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-medium text-gray-300 mb-3">Safe vs Risky</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 📈 LINE CHART */}
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-medium text-gray-300 mb-3">Risk Score Timeline</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="scan" stroke="#888" />
              <YAxis stroke="#888" domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="Score" stroke="#a855f7" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 📊 BAR CHART */}
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-medium text-gray-300 mb-3">Threat Categories</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="value" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </motion.div>
  );
}

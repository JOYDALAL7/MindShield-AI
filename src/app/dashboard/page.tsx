"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Background from "@/components/Background";
import Analytics from "@/components/Analytics";
import ChatAssistant from "@/components/ChatAssistant";

type ScanType = "phishing" | "ip" | "dataleak";
type ScanColor = "purple" | "blue" | "red" | "green";

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [ip, setIp] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeScan, setActiveScan] = useState<ScanType | null>(null);
  const [scanColor, setScanColor] = useState<ScanColor>("purple");

  const handleAnalyze = async (type: ScanType) => {
    try {
      setLoading(true);
      setActiveScan(type);
      setResult(null);

      // 🧠 Change background color based on scan type
      if (type === "phishing") setScanColor("purple");
      else if (type === "ip") setScanColor("blue");
      else if (type === "dataleak") setScanColor("red");

      let res;
      if (type === "phishing") res = await axios.post("/api/analyze/phishing", { url });
      else if (type === "ip") res = await axios.post("/api/analyze/ip", { ip });
      else if (type === "dataleak") res = await axios.post("/api/analyze/dataleak", { email });

      const newResult = { ...res?.data, type };
      setResult(newResult);
      setHistory((prev) => [...prev, newResult]);
    } catch (error) {
      setResult({ error: "Error analyzing input. Please try again." });
    } finally {
      setLoading(false);
      setActiveScan(null);
    }
  };

  // 🌈 Auto-change color on safe / risky result
  useEffect(() => {
    if (!result || result.error) return;
    if (result.isSuspicious || result.maliciousCount > 0 || result.breached)
      setScanColor("red");
    else if (!loading && result)
      setScanColor("green");
  }, [result, loading]);

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white overflow-hidden">
      <Background activeScan={scanColor} />
      <Navbar />

      {/* 🧠 Title */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-bold text-center pt-28 mb-10 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500"
      >
        🛡️ MindShield-AI Dashboard
      </motion.h1>

      {/* 🧩 Dashboard Content */}
      <div className="max-w-5xl mx-auto px-4 grid gap-8 pb-24">
        {/* 🔍 Input Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <GlassCard
            title="🔗 Phishing URL Detector"
            placeholder="Enter URL (e.g. https://example.com)"
            value={url}
            onChange={setUrl}
            onScan={() => handleAnalyze("phishing")}
            loading={loading && activeScan === "phishing"}
            color="purple"
          />

          <GlassCard
            title="🌐 Malicious IP / Domain Checker"
            placeholder="Enter IP or domain (e.g. 8.8.8.8)"
            value={ip}
            onChange={setIp}
            onScan={() => handleAnalyze("ip")}
            loading={loading && activeScan === "ip"}
            color="blue"
          />

          <GlassCard
            title="🔒 Data Leak Risk Analyzer"
            placeholder="Enter email (e.g. user@gmail.com)"
            value={email}
            onChange={setEmail}
            onScan={() => handleAnalyze("dataleak")}
            loading={loading && activeScan === "dataleak"}
            color="red"
          />
        </motion.div>

        {/* 📊 Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400"
            >
              🔍 Scanning... please wait
            </motion.div>
          )}

          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {result.error && (
                <Alert className="bg-gradient-to-br from-red-900/60 to-black/70 border border-red-800 rounded-2xl p-6 shadow-lg backdrop-blur-xl">
                  <h3 className="text-lg font-semibold mb-2 text-red-400">❌ Scan Failed</h3>
                  <p className="text-gray-300">{result.error}</p>
                </Alert>
              )}

              {!result.error && (
                <>
                  <ResultCard
                    title="🧠 AI Threat Summary"
                    description={
                      result.explanation ||
                      result.aiSummary ||
                      "AI analysis summary not available."
                    }
                    color="purple"
                  />

                  {typeof result.isSuspicious !== "undefined" && (
                    <ResultCard
                      title="⚠️ Risk Level"
                      description={
                        result.isSuspicious
                          ? "Suspicious activity detected"
                          : "No major threats found"
                      }
                      color={result.isSuspicious ? "red" : "green"}
                    />
                  )}

                  {typeof result.maliciousCount !== "undefined" && (
                    <ResultCard
                      title="🧩 IP / Domain Report"
                      description={`Detected ${result.maliciousCount} malicious engines flagging this IP.`}
                      color={result.maliciousCount > 0 ? "red" : "green"}
                    />
                  )}

                  {typeof result.breached !== "undefined" && (
                    <ResultCard
                      title="🔒 Data Leak Status"
                      description={
                        result.breached === null
                          ? "RapidAPI Breach Directory — AI risk assessment applied."
                          : result.breached
                          ? "⚠️ This email appears in known breaches!"
                          : "✅ No breaches found for this email."
                      }
                      color={
                        result.breached === null
                          ? "blue"
                          : result.breached
                          ? "red"
                          : "green"
                      }
                      leaks={result.leaks}
                    />
                  )}
                </>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* 📈 Analytics */}
        {history.length > 0 && <Analytics data={history} />}

        {/* 🤖 Chat Assistant */}
        <ChatAssistant />
      </div>
    </main>
  );
}

/* 🧊 GlassCard Component */
function GlassCard({
  title,
  placeholder,
  value,
  onChange,
  onScan,
  loading,
  color,
}: {
  title: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onScan: () => void;
  loading: boolean;
  color: "purple" | "blue" | "red";
}) {
  const colorMap: Record<string, string> = {
    purple: "from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700",
    blue: "from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700",
    red: "from-red-600 to-red-800 hover:from-red-500 hover:to-red-700",
  };

  return (
    <Card className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md hover:shadow-lg transition-all duration-300">
      <h2 className="text-xl font-semibold mb-2 text-gray-100">{title}</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
        />
        <Button
          onClick={onScan}
          disabled={loading}
          className={`text-white font-semibold bg-gradient-to-r ${colorMap[color]} transition-all rounded-xl px-6`}
        >
          {loading ? "Analyzing..." : "Scan"}
        </Button>
      </div>
    </Card>
  );
}

/* 🧠 ResultCard Component with Leak Badges */
function ResultCard({
  title,
  description,
  color,
  leaks,
}: {
  title: string;
  description: string;
  color: "purple" | "red" | "green" | "blue";
  leaks?: { name: string; domain: string; date?: string; dataClasses?: string[] }[];
}) {
  const colors: Record<string, string> = {
    purple: "from-purple-500/30 to-purple-700/20 border-purple-500/40",
    red: "from-red-500/30 to-red-700/20 border-red-500/40",
    green: "from-green-500/30 to-green-700/20 border-green-500/40",
    blue: "from-blue-500/30 to-blue-700/20 border-blue-500/40",
  };

  const getBadgeColor = (type: string) => {
    if (type.toLowerCase().includes("password")) return "bg-red-700/40 text-red-300";
    if (type.toLowerCase().includes("email")) return "bg-blue-700/40 text-blue-300";
    if (type.toLowerCase().includes("phone")) return "bg-green-700/40 text-green-300";
    if (type.toLowerCase().includes("ip")) return "bg-purple-700/40 text-purple-300";
    return "bg-gray-700/40 text-gray-300";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`p-5 rounded-2xl bg-gradient-to-br ${colors[color]} border backdrop-blur-md hover:shadow-lg transition-all`}
    >
      <h4 className="text-lg font-semibold mb-2 text-white">{title}</h4>
      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{description}</p>

      {/* 💥 Leak Details Section */}
      {leaks?.length ? (
        <ul className="text-sm text-gray-400 list-disc pl-6 mt-2 space-y-2">
          {leaks.slice(0, 5).map((l, i) => (
            <li key={i}>
              <span className="font-medium text-gray-200">{l.name || "Unknown Source"}</span>{" "}
              ({l.domain}) — {l.date || "Date Unknown"}
              {l.dataClasses?.length ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {l.dataClasses.map((type, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded-full ${getBadgeColor(type)}`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </motion.div>
  );
}

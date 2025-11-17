"use client";

import { useState, useEffect, KeyboardEvent } from "react";
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
type RiskLevel = "Low" | "Medium" | "High";

type ScanResult = {
  type: ScanType;
  input: string;
  timestamp: string;
  isRisky: boolean;
  riskScore?: number; // mapped from backend finalScore
  riskLevel?: RiskLevel; // mapped from backend riskLevel
  riskColor?: ScanColor; // mapped from backend color
  error?: string;
  [key: string]: any; // keep all original fields
};

const HISTORY_KEY = "mindshield-history";

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [ip, setIp] = useState("");
  const [email, setEmail] = useState("");

  // Separate results per scan module
  const [phishingResult, setPhishingResult] = useState<ScanResult | null>(null);
  const [ipResult, setIpResult] = useState<ScanResult | null>(null);
  const [dataLeakResult, setDataLeakResult] = useState<ScanResult | null>(null);

  const [history, setHistory] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeScan, setActiveScan] = useState<ScanType | null>(null);
  const [scanColor, setScanColor] = useState<ScanColor>("purple");

  // Which tab is open
  const [activeView, setActiveView] = useState<ScanType>("phishing");

  const currentResult: ScanResult | null =
    activeView === "phishing"
      ? phishingResult
      : activeView === "ip"
      ? ipResult
      : dataLeakResult;

  // 🔁 Load history from localStorage on first mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined"
        ? window.localStorage.getItem(HISTORY_KEY)
        : null;
      if (!raw) return;
      const parsed: ScanResult[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      setHistory(parsed);

      // restore last results per type (for nicer UX after refresh)
      const lastPhishing = parsed.find((h) => h.type === "phishing");
      const lastIp = parsed.find((h) => h.type === "ip");
      const lastData = parsed.find((h) => h.type === "dataleak");
      if (lastPhishing) setPhishingResult(lastPhishing);
      if (lastIp) setIpResult(lastIp);
      if (lastData) setDataLeakResult(lastData);
    } catch {
      // ignore corrupted history
    }
  }, []);

  // 💾 Persist history to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!history.length) {
      window.localStorage.removeItem(HISTORY_KEY);
      return;
    }
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async (type: ScanType) => {
    try {
      setLoading(true);
      setActiveScan(type);
      setActiveView(type); // switch view to the one being scanned

      // initial background based on scan type
      if (type === "phishing") setScanColor("purple");
      else if (type === "ip") setScanColor("blue");
      else if (type === "dataleak") setScanColor("red");

      let res;
      if (type === "phishing")
        res = await axios.post("/api/analyze/phishing", { url: url.trim() });
      else if (type === "ip")
        res = await axios.post("/api/analyze/ip", { ip: ip.trim() });
      else if (type === "dataleak")
        res = await axios.post("/api/analyze/dataleak", { email: email.trim() });

      const base = res?.data || {};

      // Prefer backend finalScore → riskScore
      const backendScore =
        typeof base.finalScore === "number"
          ? base.finalScore
          : typeof base.riskScore === "number"
          ? base.riskScore
          : undefined;

      // Map backend riskLevel ("low" | "medium" | "high" | "critical") → "Low" | "Medium" | "High"
      let mappedLevel: RiskLevel | undefined;
      if (typeof base.riskLevel === "string") {
        const lower = base.riskLevel.toLowerCase();
        if (lower === "low") mappedLevel = "Low";
        else if (lower === "medium") mappedLevel = "Medium";
        else mappedLevel = "High"; // treat both "high" and "critical" as High
      }

      // Map backend color to ScanColor if possible
      const mappedColor: ScanColor | undefined =
        base.color === "purple" ||
        base.color === "blue" ||
        base.color === "red" ||
        base.color === "green"
          ? base.color
          : undefined;

      // isRisky based on backend score or flags
      let isRisky = false;
      if (typeof backendScore === "number") {
        isRisky = backendScore >= 40; // threshold
      } else {
        isRisky =
          !!base.isSuspicious ||
          !!base.breached ||
          (typeof base.maliciousCount === "number" &&
            base.maliciousCount > 0);
      }

      const inputValue = type === "phishing" ? url : type === "ip" ? ip : email;

      const newResult: ScanResult = {
        ...base,
        type,
        input: inputValue.trim(),
        timestamp: new Date().toISOString(),
        isRisky,
        riskScore: backendScore,
        riskLevel: mappedLevel,
        riskColor: mappedColor,
      };

      // save per-module
      if (type === "phishing") setPhishingResult(newResult);
      else if (type === "ip") setIpResult(newResult);
      else setDataLeakResult(newResult);

      // global history for analytics
      setHistory((prev) => [newResult, ...prev]);
    } catch (error: any) {
      const inputValue = type === "phishing" ? url : type === "ip" ? ip : email;

      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Error analyzing input. Please try again.";

      const errorResult: ScanResult = {
        type,
        input: inputValue.trim(),
        timestamp: new Date().toISOString(),
        isRisky: true,
        error: message,
      };

      if (type === "phishing") setPhishingResult(errorResult);
      else if (type === "ip") setIpResult(errorResult);
      else setDataLeakResult(errorResult);

      setHistory((prev) => [errorResult, ...prev]);
    } finally {
      setLoading(false);
      setActiveScan(null);
    }
  };

  // Clear history + reset meters
  const handleClearHistory = () => {
    setHistory([]);
    setPhishingResult(null);
    setIpResult(null);
    setDataLeakResult(null);
    setScanColor("purple");
  };

  // Auto-change color based on current tab's result
  useEffect(() => {
    if (!currentResult || (currentResult as any).error) return;

    if (currentResult.riskColor) {
      setScanColor(currentResult.riskColor);
      return;
    }

    const score =
      typeof currentResult.riskScore === "number"
        ? currentResult.riskScore
        : undefined;

    if (typeof score === "number") {
      if (score >= 70) setScanColor("red");
      else if (score >= 35) setScanColor("purple");
      else setScanColor("green");
    } else if (currentResult.isRisky) {
      setScanColor("red");
    } else if (!loading) {
      setScanColor("green");
    }
  }, [currentResult, loading]);

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white overflow-hidden">
      <Background activeScan={scanColor} />
      <Navbar />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-bold text-center pt-28 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500"
      >
        🛡️ MindShield-AI Dashboard
      </motion.h1>

      {/* Summary strip */}
      <SummaryStrip
        history={history}
        loading={loading}
        onClear={handleClearHistory}
      />

      <div className="max-w-5xl mx-auto px-4 grid gap-8 pb-24">
        {/* Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full bg-black/40 border border-white/10 p-1">
            {(["phishing", "ip", "dataleak"] as ScanType[]).map((tab) => {
              const label =
                tab === "phishing"
                  ? "Phishing Scanner"
                  : tab === "ip"
                  ? "IP / Domain Scanner"
                  : "Data Leak Scanner";
              const active = activeView === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveView(tab)}
                  className={`px-4 py-1.5 text-xs sm:text-sm rounded-full transition-all ${
                    active
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input card per active tab */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {activeView === "phishing" && (
            <GlassCard
              title="🔗 Phishing URL Detector"
              placeholder="Enter URL (e.g. https://example.com)"
              helperText="Detects spoofed login pages, fake payment portals, and malicious redirects."
              value={url}
              onChange={setUrl}
              onScan={() => handleAnalyze("phishing")}
              loading={loading && activeScan === "phishing"}
              color="purple"
              examples={[
                "https://secure-paypal.com-login.net",
                "https://accounts.google.com.security-check.com",
              ]}
            />
          )}

          {activeView === "ip" && (
            <GlassCard
              title="🌐 Malicious IP / Domain Checker"
              placeholder="Enter IP or domain (e.g. 8.8.8.8)"
              helperText="Checks reputation, malware listings, and security vendor flags for IPs/domains."
              value={ip}
              onChange={setIp}
              onScan={() => handleAnalyze("ip")}
              loading={loading && activeScan === "ip"}
              color="blue"
              examples={["5.255.255.5", "malicious-example.com"]}
            />
          )}

          {activeView === "dataleak" && (
            <GlassCard
              title="🔒 Data Leak Risk Analyzer"
              placeholder="Enter email (e.g. user@gmail.com)"
              helperText="Searches breach data for your email and gives AI-powered remediation tips."
              value={email}
              onChange={setEmail}
              onScan={() => handleAnalyze("dataleak")}
              loading={loading && activeScan === "dataleak"}
              color="red"
              examples={["yourname123@gmail.com"]}
            />
          )}
        </motion.div>

        {/* Results + Risk Meter for CURRENT tab only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
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

          {currentResult && !loading && (
            <div className="space-y-6">
              <RiskMeter result={currentResult} />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-6 md:grid-cols-2"
              >
                {currentResult.error && (
                  <Alert className="bg-gradient-to-br from-red-900/60 to-black/70 border border-red-800 rounded-2xl p-6 shadow-lg backdrop-blur-xl">
                    <h3 className="text-lg font-semibold mb-2 text-red-400">
                      ❌ Scan Failed
                    </h3>
                    <p className="text-gray-300">{currentResult.error}</p>
                  </Alert>
                )}

                {!currentResult.error && (
                  <>
                    <ResultCard
                      title="🧠 AI Threat Summary"
                      description={
                        currentResult.explanation ||
                        currentResult.aiSummary ||
                        "AI analysis summary not available."
                      }
                      color="purple"
                    />

                    {typeof currentResult.isSuspicious !== "undefined" && (
                      <ResultCard
                        title="⚠️ Risk Flag"
                        description={
                          currentResult.isSuspicious
                            ? "Suspicious indicators were detected for this input."
                            : "No strong risk indicators were detected."
                        }
                        color={currentResult.isSuspicious ? "red" : "green"}
                      />
                    )}

                    {typeof currentResult.maliciousCount !== "undefined" && (
                      <ResultCard
                        title="🧩 IP / Domain Report"
                        description={`Detected ${currentResult.maliciousCount} malicious engines flagging this IP.`}
                        color={
                          currentResult.maliciousCount > 0 ? "red" : "green"
                        }
                      />
                    )}

                    {typeof currentResult.breached !== "undefined" && (
                      <ResultCard
                        title="🔒 Data Leak Status"
                        description={
                          currentResult.breached === null
                            ? "RapidAPI Breach Directory — AI risk assessment applied."
                            : currentResult.breached
                            ? "⚠️ This email appears in known breaches!"
                            : "✅ No breaches found for this email."
                        }
                        color={
                          currentResult.breached === null
                            ? "blue"
                            : currentResult.breached
                            ? "red"
                            : "green"
                        }
                        leaks={currentResult.leaks}
                      />
                    )}
                  </>
                )}
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Global Analytics across ALL scans */}
        {history.length > 0 && <Analytics data={history} />}

        {/* Recent scan list */}
        {history.length > 0 && (
          <RecentScans history={history.slice(0, 6)} />
        )}

        {/* Chat Assistant */}
        <ChatAssistant />
      </div>
    </main>
  );
}

/* Summary strip at top */
function SummaryStrip({
  history,
  loading,
  onClear,
}: {
  history: ScanResult[];
  loading: boolean;
  onClear: () => void;
}) {
  const total = history.length;
  const risky = history.filter((h) => h.isRisky).length;
  const safe = history.filter((h) => !h.isRisky && !h.error).length;
  const lastScan = history[0];

  const scoredHistory = history.filter((h) => typeof h.riskScore === "number");
  const averageScore =
    scoredHistory.reduce((sum, h) => sum + (h.riskScore || 0), 0) /
    (scoredHistory.length || 1);

  const phishingCount = history.filter((h) => h.type === "phishing").length;
  const ipCount = history.filter((h) => h.type === "ip").length;
  const dataLeakCount = history.filter((h) => h.type === "dataleak").length;

  return (
    <div className="max-w-5xl mx-auto px-4 mb-6 grid gap-4 md:grid-cols-3">
      <Card className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-gray-400">
            Total scans
          </span>
          {total > 0 && (
            <button
              onClick={onClear}
              className="text-[10px] px-2 py-1 rounded-full bg-gray-900/70 border border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Clear
            </button>
          )}
        </div>
        <span className="text-2xl font-semibold mt-1">{total}</span>
        <span className="text-xs text-gray-500 mt-1">
          {loading ? "Running analysis..." : "Run more scans to build your timeline."}
        </span>
      </Card>

      <Card className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col">
        <span className="text-xs uppercase tracking-wide text-gray-400">
          Risk snapshot
        </span>
        <span className="mt-1 text-sm text-gray-300">
          🟥 Risky:{" "}
          <span className="font-semibold text-red-400">{risky}</span> · 🟩 Safe:{" "}
          <span className="font-semibold text-green-400">{safe}</span>
        </span>
        <span className="text-xs text-gray-500 mt-1">
          Avg risk score:{" "}
          {Number.isFinite(averageScore) ? Math.round(averageScore) : 0}
          /100
        </span>
        <span className="text-[11px] text-gray-500 mt-2">
          Phishing: {phishingCount} · IP: {ipCount} · Data leak: {dataLeakCount}
        </span>
      </Card>

      <Card className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col">
        <span className="text-xs uppercase tracking-wide text-gray-400">
          Last scan
        </span>
        {lastScan ? (
          <>
            <span className="mt-1 text-sm text-gray-200 capitalize">
              {lastScan.type} ·{" "}
              {lastScan.riskLevel
                ? `${lastScan.riskLevel} risk`
                : lastScan.isRisky
                ? "⚠️ Risky"
                : "✅ Safe"}
            </span>
            <span className="text-xs text-gray-500 mt-1 truncate">
              {new Date(lastScan.timestamp).toLocaleTimeString()} ·{" "}
              {lastScan.input}
            </span>
          </>
        ) : (
          <span className="mt-1 text-sm text-gray-400">
            No scans yet. Try a test URL or IP.
          </span>
        )}
      </Card>
    </div>
  );
}

/* Risk Meter Component */
function RiskMeter({ result }: { result: ScanResult }) {
  // Prefer mapped riskScore, fallback to backend finalScore, then heuristic fallback
  const backendFinal =
    typeof (result as any).finalScore === "number"
      ? (result as any).finalScore
      : undefined;

  const rawScore =
    typeof result.riskScore === "number"
      ? result.riskScore
      : typeof backendFinal === "number"
      ? backendFinal
      : result.isRisky
      ? 70
      : 20;

  const percent = Math.max(0, Math.min(100, rawScore));

  const level: RiskLevel =
    result.riskLevel || (percent >= 70 ? "High" : percent >= 35 ? "Medium" : "Low");

  let barColor = "bg-green-500";
  if (level === "Medium") barColor = "bg-purple-500";
  if (level === "High") barColor = "bg-red-500";

  return (
    <Card className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs uppercase tracking-wide text-gray-400">
            Overall threat score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-gray-100">
              {Math.round(percent)}
            </span>
            <span className="text-sm text-gray-400">/100 · {level} risk</span>
          </div>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-900/70 border border-gray-700 text-gray-300 capitalize">
          {result.type} scan
        </span>
      </div>

      <div className="w-full h-3 rounded-full bg-gray-800 overflow-hidden mt-2">
        <div
          className={`h-3 ${barColor} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Higher scores indicate stronger phishing signs, malicious IP reputation, or
        serious data breaches.
      </p>
    </Card>
  );
}

/* GlassCard Component */
type GlassColor = "purple" | "blue" | "red";

function GlassCard({
  title,
  placeholder,
  value,
  onChange,
  onScan,
  loading,
  color,
  helperText,
  examples,
}: {
  title: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onScan: () => void;
  loading: boolean;
  color: GlassColor;
  helperText?: string;
  examples?: string[];
}) {
  const colorMap: Record<GlassColor, string> = {
    purple: "from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700",
    blue: "from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700",
    red: "from-red-600 to-red-800 hover:from-red-500 hover:to-red-700",
  };

  const disabled = loading || !value.trim();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !disabled) {
      e.preventDefault();
      onScan();
    }
  };

  return (
    <Card className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-2 gap-2">
        <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
        {loading && (
          <span className="text-xs text-purple-300 animate-pulse">Scanning…</span>
        )}
      </div>

      {helperText && <p className="text-xs text-gray-400 mb-3">{helperText}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
        />
        <Button
          onClick={onScan}
          disabled={disabled}
          className={`text-white font-semibold bg-gradient-to-r ${colorMap[color]} transition-all rounded-xl px-6`}
        >
          {loading ? "Analyzing..." : "Scan"}
        </Button>
      </div>

      {examples && examples.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => onChange(ex)}
              className="text-xs px-2 py-1 rounded-full bg-gray-800/70 hover:bg-gray-700/80 text-gray-300 border border-gray-700/80"
            >
              Use example
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ResultCard Component with Leak Badges */
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
    const lower = type.toLowerCase();
    if (lower.includes("password")) return "bg-red-700/40 text-red-300";
    if (lower.includes("email")) return "bg-blue-700/40 text-blue-300";
    if (lower.includes("phone")) return "bg-green-700/40 text-green-300";
    if (lower.includes("ip")) return "bg-purple-700/40 text-purple-300";
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

      {leaks?.length ? (
        <ul className="text-sm text-gray-400 list-disc pl-6 mt-2 space-y-2">
          {leaks.slice(0, 5).map((l, i) => (
            <li key={i}>
              <span className="font-medium text-gray-200">
                {l.name || "Unknown Source"}
              </span>{" "}
              ({l.domain}) — {l.date || "Date Unknown"}
              {l.dataClasses?.length ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {l.dataClasses.map((type, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded-full ${getBadgeColor(
                        type
                      )}`}
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

/* Small recent scans list */
function RecentScans({ history }: { history: ScanResult[] }) {
  if (!history.length) return null;

  const labelMap: Record<ScanType, string> = {
    phishing: "Phishing",
    ip: "IP / Domain",
    dataleak: "Data Leak",
  };

  return (
    <Card className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-2">
      <h3 className="text-sm font-semibold text-gray-100 mb-2">
        Recent scans
      </h3>
      <ul className="space-y-1 text-xs text-gray-300">
        {history.map((h) => (
          <li
            key={h.timestamp + h.input}
            className="flex items-center justify-between gap-2"
          >
            <span className="truncate">
              <span className="px-2 py-0.5 mr-2 rounded-full bg-gray-900/70 border border-gray-700 text-[10px] uppercase tracking-wide">
                {labelMap[h.type]}
              </span>
              {h.input}
            </span>
            <span className="shrink-0 text-[10px] text-gray-500">
              {new Date(h.timestamp).toLocaleTimeString()}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

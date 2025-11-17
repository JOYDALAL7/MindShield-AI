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
  riskScore?: number;
  riskLevel?: RiskLevel;
  riskColor?: ScanColor;
  error?: string;
  [key: string]: any;
};

const HISTORY_KEY = "mindshield-history";

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [ip, setIp] = useState("");
  const [email, setEmail] = useState("");

  const [phishingResult, setPhishingResult] = useState<ScanResult | null>(null);
  const [ipResult, setIpResult] = useState<ScanResult | null>(null);
  const [dataLeakResult, setDataLeakResult] = useState<ScanResult | null>(null);

  const [history, setHistory] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeScan, setActiveScan] = useState<ScanType | null>(null);
  const [scanColor, setScanColor] = useState<ScanColor>("purple");
  const [activeView, setActiveView] = useState<ScanType>("phishing");

  const [insights, setInsights] = useState<string>(
    "Run a scan to generate insights."
  );

  const currentResult: ScanResult | null =
    activeView === "phishing"
      ? phishingResult
      : activeView === "ip"
      ? ipResult
      : dataLeakResult;

  // Load history
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (!raw) return;

      const parsed: ScanResult[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      setHistory(parsed);

      const lastPhishing = parsed.find((h) => h.type === "phishing");
      const lastIp = parsed.find((h) => h.type === "ip");
      const lastData = parsed.find((h) => h.type === "dataleak");
      if (lastPhishing) setPhishingResult(lastPhishing);
      if (lastIp) setIpResult(lastIp);
      if (lastData) setDataLeakResult(lastData);
    } catch {
      // ignore
    }
  }, []);

  // Persist history
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!history.length) {
      window.localStorage.removeItem(HISTORY_KEY);
    } else {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  }, [history]);

  // Generate insights from history
  useEffect(() => {
    if (!history.length) {
      setInsights(
        "No scans yet. Start with a phishing URL, IP, or email to see insights."
      );
      return;
    }

    const riskyCount = history.filter((h) => h.isRisky && !h.error).length;
    const safeCount = history.filter((h) => !h.isRisky && !h.error).length;
    const errorCount = history.filter((h) => !!h.error).length;

    const scored = history.filter((h) => typeof h.riskScore === "number");
    const avgScore =
      scored.reduce((sum, h) => sum + (h.riskScore || 0), 0) /
      (scored.length || 1);

    const last = history[0];
    const lastTwo = history.slice(0, 2);
    let trendText = "";

    if (lastTwo.length === 2 && lastTwo[0].riskScore && lastTwo[1].riskScore) {
      const diff = (lastTwo[0].riskScore || 0) - (lastTwo[1].riskScore || 0);
      if (Math.abs(diff) < 5)
        trendText = "Risk level is stable compared to your last scan.";
      else if (diff < 0)
        trendText =
          "Your latest scan looks safer than the previous one. Keep it up!";
      else
        trendText =
          "Your latest scan looks riskier than the previous one. Review suspicious sources.";
    }

    const textLines: string[] = [];

    textLines.push(
      `You’ve run ${history.length} total scans so far, with around ${Math.round(
        avgScore
      )}/100 average risk.`
    );

    if (riskyCount > safeCount) {
      textLines.push(
        "Most of your inputs are being flagged as risky — you may be exploring a lot of unknown or unsafe links."
      );
    } else if (safeCount > riskyCount) {
      textLines.push(
        "Most of your inputs look safe — good digital hygiene! Keep verifying before you click."
      );
    } else {
      textLines.push(
        "Your safe vs risky results are balanced — stay cautious with links and login pages."
      );
    }

    if (errorCount > 0) {
      textLines.push(
        `Some scans failed (${errorCount}). If this keeps happening, check your API keys or connection.`
      );
    }

    if (last) {
      textLines.push(
        `Last scan: ${last.type.toUpperCase()} · ${
          last.riskLevel || (last.isRisky ? "High" : "Low")
        } risk for "${last.input.slice(0, 40)}${
          last.input.length > 40 ? "..." : ""
        }".`
      );
    }

    if (trendText) textLines.push(trendText);

    setInsights(textLines.join(" "));
  }, [history]);

  const handleAnalyze = async (type: ScanType) => {
    try {
      setLoading(true);
      setActiveScan(type);
      setActiveView(type);

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

      const backendScore =
        typeof base.finalScore === "number"
          ? base.finalScore
          : typeof base.riskScore === "number"
          ? base.riskScore
          : undefined;

      let mappedLevel: RiskLevel | undefined;
      if (typeof base.riskLevel === "string") {
        const lower = base.riskLevel.toLowerCase();
        if (lower === "low") mappedLevel = "Low";
        else if (lower === "medium") mappedLevel = "Medium";
        else mappedLevel = "High";
      }

      const mappedColor: ScanColor | undefined =
        base.color === "purple" ||
        base.color === "blue" ||
        base.color === "red" ||
        base.color === "green"
          ? base.color
          : undefined;

      let isRisky = false;
      if (typeof backendScore === "number") {
        isRisky = backendScore >= 40;
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

      if (type === "phishing") setPhishingResult(newResult);
      else if (type === "ip") setIpResult(newResult);
      else setDataLeakResult(newResult);

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

  const handleClearHistory = () => {
    setHistory([]);
    setPhishingResult(null);
    setIpResult(null);
    setDataLeakResult(null);
    setScanColor("purple");
  };

  // Download report as JSON
  const handleDownloadReport = () => {
    if (typeof window === "undefined" || !history.length) return;
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindshield-report-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Change particle color based on current result
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

  // When clicking a recent scan, restore it
  const handleSelectScanFromHistory = (scan: ScanResult) => {
    setActiveView(scan.type);

    if (scan.type === "phishing") {
      setUrl(scan.input);
      setPhishingResult(scan);
    } else if (scan.type === "ip") {
      setIp(scan.input);
      setIpResult(scan);
    } else {
      setEmail(scan.input);
      setDataLeakResult(scan);
    }
  };

  const quickActions = [
    {
      label: "Test a phishing login",
      type: "phishing" as ScanType,
      value: "https://secure-paypal.com-login.net",
      set: setUrl,
    },
    {
      label: "Check a suspicious IP",
      type: "ip" as ScanType,
      value: "5.255.255.5",
      set: setIp,
    },
    {
      label: "Check leaked email",
      type: "dataleak" as ScanType,
      value: "user@example.com",
      set: setEmail,
    },
  ];

  const runQuickAction = (qa: (typeof quickActions)[number]) => {
    qa.set(qa.value);
    handleAnalyze(qa.type);
  };

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      <Background activeScan={scanColor} />
      <Navbar />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-bold text-center pt-28 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500"
      >
        🛡️ MindShield-AI Dashboard
      </motion.h1>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-4xl mx-auto px-4 mb-5 flex flex-wrap justify-center gap-2"
      >
        {quickActions.map((qa) => (
          <button
            key={qa.label}
            onClick={() => runQuickAction(qa)}
            className="text-xs sm:text-sm px-3 py-1.5 rounded-full bg-card/70 hover:bg-card border border-border text-muted-foreground transition-all"
          >
            {qa.label}
          </button>
        ))}
      </motion.div>

      {/* Summary strip + insights */}
      <SummaryStrip
        history={history}
        loading={loading}
        onClear={handleClearHistory}
        onDownload={handleDownloadReport}
      />

      {/* Insights bubble */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-5xl mx-auto px-4 mb-6"
      >
        <Card className="bg-card border border-border rounded-2xl p-4 text-xs sm:text-sm text-muted-foreground shadow-sm">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-lg">💡</span>
            <p className="leading-relaxed">{insights}</p>
          </div>
        </Card>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 grid gap-8 pb-24">
        {/* Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full bg-card/80 border border-border p-1">
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
                      : "text-muted-foreground hover:bg-muted"
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

        {/* Results + Risk Meter */}
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
              className="text-center text-muted-foreground"
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
                  <Alert className="bg-destructive/10 border border-destructive rounded-2xl p-6 shadow-lg backdrop-blur-xl text-destructive-foreground">
                    <h3 className="text-lg font-semibold mb-2">
                      ❌ Scan Failed
                    </h3>
                    <p>{currentResult.error}</p>
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

        {history.length > 0 && <Analytics data={history} />}

        {history.length > 0 && (
          <RecentScans
            history={history.slice(0, 6)}
            onSelect={handleSelectScanFromHistory}
          />
        )}

        <ChatAssistant />
      </div>
    </main>
  );
}

/* ------------ Summary strip ------------- */

function SummaryStrip({
  history,
  loading,
  onClear,
  onDownload,
}: {
  history: ScanResult[];
  loading: boolean;
  onClear: () => void;
  onDownload: () => void;
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

  const getStreak = () => {
    if (!history.length) return 0;
    const days = Array.from(
      new Set(
        history.map((h) => new Date(h.timestamp).toISOString().slice(0, 10))
      )
    ).sort();
    if (!days.length) return 0;

    let streak = 1;
    for (let i = days.length - 1; i > 0; i--) {
      const d1 = new Date(days[i]);
      const d0 = new Date(days[i - 1]);
      const diffDays = (d1.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) streak++;
      else break;
    }
    return streak;
  };

  const streak = getStreak();

  let trendLabel = "Stable";
  if (scoredHistory.length >= 2) {
    const recent = scoredHistory.slice(0, 3);
    const first = recent[recent.length - 1].riskScore || 0;
    const last = recent[0].riskScore || 0;
    const diff = last - first;
    if (diff <= -10) trendLabel = "Improving";
    else if (diff >= 10) trendLabel = "Getting riskier";
  }

  return (
    <div className="max-w-5xl mx-auto px-4 mb-6 grid gap-4 md:grid-cols-3">
      <Card className="bg-card border border-border rounded-2xl p-4 flex flex-col shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Total scans
          </span>
          <div className="flex items-center gap-2">
            {total > 0 && (
              <button
                onClick={onDownload}
                className="text-[10px] px-2 py-1 rounded-full bg-purple-600/90 hover:bg-purple-600 text-white"
              >
                Download report
              </button>
            )}
            {total > 0 && (
              <button
                onClick={onClear}
                className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <span className="text-2xl font-semibold mt-1 text-foreground">
          {total}
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          {loading
            ? "Running analysis..."
            : "Build your personal security timeline."}
        </span>
        <span className="text-[11px] text-purple-500 mt-2">
          🔥 Streak: {streak} day{streak === 1 ? "" : "s"} in a row
        </span>
      </Card>

      <Card className="bg-card border border-border rounded-2xl p-4 flex flex-col shadow-sm">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Risk snapshot
        </span>
        <span className="mt-1 text-sm text-foreground">
          🟥 Risky:{" "}
          <span className="font-semibold text-red-500">{risky}</span> · 🟩 Safe:{" "}
          <span className="font-semibold text-green-500">{safe}</span>
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          Avg risk score:{" "}
          {Number.isFinite(averageScore) ? Math.round(averageScore) : 0}
          /100
        </span>
        <span className="text-[11px] text-muted-foreground mt-2 flex flex-wrap gap-1">
          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-[10px]">
            Phishing: {phishingCount}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px]">
            IP: {ipCount}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-[10px]">
            Data leak: {dataLeakCount}
          </span>
        </span>
      </Card>

      <Card className="bg-card border border-border rounded-2xl p-4 flex flex-col shadow-sm">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Last scan
        </span>
        {lastScan ? (
          <>
            <span className="mt-1 text-sm text-foreground capitalize">
              {lastScan.type} ·{" "}
              {lastScan.riskLevel
                ? `${lastScan.riskLevel} risk`
                : lastScan.isRisky
                ? "⚠️ Risky"
                : "✅ Safe"}
            </span>
            <span className="text-xs text-muted-foreground mt-1 truncate">
              {new Date(lastScan.timestamp).toLocaleTimeString()} ·{" "}
              {lastScan.input}
            </span>
            <span className="text-[11px] mt-2 px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground inline-flex w-fit">
              Trend: {trendLabel}
            </span>
          </>
        ) : (
          <span className="mt-1 text-sm text-muted-foreground">
            No scans yet. Try a test URL or IP.
          </span>
        )}
      </Card>
    </div>
  );
}

/* ------------ Risk Meter ------------- */

function RiskMeter({ result }: { result: ScanResult }) {
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
    <Card className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Overall threat score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-foreground">
              {Math.round(percent)}
            </span>
            <span className="text-sm text-muted-foreground">
              /100 · {level} risk
            </span>
          </div>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-muted border border-border text-muted-foreground capitalize">
          {result.type} scan
        </span>
      </div>

      <div className="w-full h-3 rounded-full bg-muted overflow-hidden mt-2">
        <div
          className={`h-3 ${barColor} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Higher scores indicate stronger phishing signs, malicious IP reputation, or
        serious data breaches.
      </p>
    </Card>
  );
}

/* ------------ Glass input card ------------- */

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
    <Card className="bg-card border border-border p-6 rounded-2xl backdrop-blur-md hover:shadow-lg transition-all duration-300 shadow-sm">
      <div className="flex items-center justify-between mb-2 gap-2">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {loading && (
          <span className="text-xs text-purple-500 animate-pulse">
            Scanning…
          </span>
        )}
      </div>

      {helperText && (
        <p className="text-xs text-muted-foreground mb-3">{helperText}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
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
              className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground border border-border"
            >
              Use example
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ------------ Result card ------------- */

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
    purple: "from-purple-500/20 to-purple-700/10 border-purple-500/40",
    red: "from-red-500/20 to-red-700/10 border-red-500/40",
    green: "from-green-500/20 to-green-700/10 border-green-500/40",
    blue: "from-blue-500/20 to-blue-700/10 border-blue-500/40",
  };

  const getBadgeColor = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes("password")) return "bg-red-500/20 text-red-500";
    if (lower.includes("email")) return "bg-blue-500/20 text-blue-500";
    if (lower.includes("phone")) return "bg-green-500/20 text-green-500";
    if (lower.includes("ip")) return "bg-purple-500/20 text-purple-500";
    return "bg-muted text-muted-foreground";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`p-5 rounded-2xl bg-gradient-to-br ${colors[color]} border backdrop-blur-md hover:shadow-lg transition-all`}
    >
      <h4 className="text-lg font-semibold mb-2 text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {description}
      </p>

      {leaks?.length ? (
        <ul className="text-sm text-muted-foreground list-disc pl-6 mt-2 space-y-2">
          {leaks.slice(0, 5).map((l, i) => (
            <li key={i}>
              <span className="font-medium text-foreground">
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

/* ------------ Recent scans ------------- */

function RecentScans({
  history,
  onSelect,
}: {
  history: ScanResult[];
  onSelect: (scan: ScanResult) => void;
}) {
  if (!history.length) return null;

  const labelMap: Record<ScanType, string> = {
    phishing: "Phishing",
    ip: "IP / Domain",
    dataleak: "Data Leak",
  };

  return (
    <Card className="bg-card border border-border rounded-2xl p-4 mt-2 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-2">
        Recent scans
      </h3>
      <ul className="space-y-1 text-xs text-muted-foreground">
        {history.map((h) => (
          <li
            key={h.timestamp + h.input}
            className="flex items-center justify-between gap-2 cursor-pointer hover:bg-muted rounded-lg px-2 py-1 transition"
            onClick={() => onSelect(h)}
          >
            <span className="truncate">
              <span className="px-2 py-0.5 mr-2 rounded-full bg-muted border border-border text-[10px] uppercase tracking-wide text-muted-foreground">
                {labelMap[h.type]}
              </span>
              {h.input}
            </span>
            <span className="shrink-0 text-[10px] text-muted-foreground/80">
              {new Date(h.timestamp).toLocaleTimeString()}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-muted-foreground mt-2">
        Tip: Click any item to reopen that scan and view its full report.
      </p>
    </Card>
  );
}

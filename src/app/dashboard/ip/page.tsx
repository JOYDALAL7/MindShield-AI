"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

import Navbar from "@/components/Navbar";
import Background from "@/components/Background";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

import RiskMeter from "@/components/RiskMeter";
import ResultCard from "@/components/ResultCard";

type RiskColor = "purple" | "blue" | "red" | "green";

export default function IPScannerPage() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scanColor, setScanColor] = useState<RiskColor>("blue");

  const handleScan = async () => {
    try {
      setLoading(true);
      setResult(null);
      setScanColor("blue");

      const res = await axios.post("/api/analyze/ip", { ip });
      const base = res.data || {};

      // Score Mapping
      const score =
        typeof base.finalScore === "number"
          ? base.finalScore
          : typeof base.riskScore === "number"
          ? base.riskScore
          : base.maliciousCount > 0
          ? 70
          : 20;

      // Color safe-map
      const color: RiskColor =
        ["purple", "blue", "red", "green"].includes(base.color)
          ? base.color
          : score >= 70
          ? "red"
          : score >= 35
          ? "purple"
          : "green";

      setScanColor(color);

      setResult({
        ...base,
        riskScore: score,
        riskColor: color,
      });
    } catch {
      setResult({
        error: "Failed to analyze IP. Try again later.",
        isSuspicious: true,
        riskScore: 70,
        riskColor: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <Background activeScan={scanColor} />
      <Navbar />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center pt-24 mb-6
          bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
      >
        🌐 Malicious IP / Domain Scanner
      </motion.h1>

      <div className="max-w-3xl mx-auto px-4 pb-20 space-y-8">
        {/* Input Card */}
        <Card className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
          <label className="text-sm text-gray-300">Enter IP or Domain</label>

          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <Input
              placeholder="e.g. 5.255.255.5"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="bg-gray-900 text-white border-gray-700"
            />

            <Button
              onClick={handleScan}
              disabled={!ip.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 font-semibold px-6 rounded-xl"
            >
              {loading ? "Scanning..." : "Scan"}
            </Button>
          </div>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {!result.error ? (
              <>
                {/* Risk Meter */}
                <RiskMeter result={result} />

                {/* AI Summary */}
                <ResultCard
                  title="🧠 IP Reputation Summary"
                  description={
                    result.explanation ||
                    result.aiSummary ||
                    "No AI explanation available."
                  }
                  color="blue"
                />

                {/* Malware Vendor Flags */}
                {typeof result.maliciousCount !== "undefined" && (
                  <ResultCard
                    title="🧩 Security Vendor Report"
                    description={`Detected ${result.maliciousCount} vendors flagging this IP/domain.`}
                    color={result.maliciousCount > 0 ? "red" : "green"}
                  />
                )}

                {/* Geolocation */}
                {result.country && (
                  <ResultCard
                    title="🌍 Geolocation"
                    description={`This IP is located in: ${
                      result.country || "Not available"
                    }`}
                    color="purple"
                  />
                )}
              </>
            ) : (
              <Alert className="bg-red-900/60 border-red-700 text-red-300 p-4 rounded-xl">
                {result.error}
              </Alert>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

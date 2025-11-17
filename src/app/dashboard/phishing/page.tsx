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

export default function PhishingScannerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scanColor, setScanColor] = useState<RiskColor>("purple");

  const handleScan = async () => {
    try {
      setLoading(true);
      setResult(null);
      setScanColor("purple");

      const res = await axios.post("/api/analyze/phishing", { url });
      const base = res.data || {};

      // Score mapping (fallback safe)
      const score =
        typeof base.finalScore === "number"
          ? base.finalScore
          : typeof base.riskScore === "number"
          ? base.riskScore
          : base.isSuspicious
          ? 70
          : 20;

      // Color mapping
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
        error: "Scan failed. Please try again.",
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

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center pt-24 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400"
      >
        🔗 Phishing URL Detector
      </motion.h1>

      <div className="max-w-3xl mx-auto px-4 pb-20 space-y-8">
        {/* Input Card */}
        <Card className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
          <label className="text-sm text-gray-300">Enter a URL to scan</label>

          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
            />

            <Button
              onClick={handleScan}
              disabled={!url.trim() || loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 rounded-xl"
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

                {/* Summary */}
                <ResultCard
                  title="🧠 AI Threat Summary"
                  description={
                    result.explanation ||
                    result.aiSummary ||
                    "No detailed AI explanation available."
                  }
                  color="purple"
                />

                {/* Risk Flag */}
                {typeof result.isSuspicious !== "undefined" && (
                  <ResultCard
                    title="⚠️ Phishing Likelihood"
                    description={
                      result.isSuspicious
                        ? "⚠️ Suspicious phishing characteristics detected."
                        : "✅ This URL seems safe from phishing indicators."
                    }
                    color={result.isSuspicious ? "red" : "green"}
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

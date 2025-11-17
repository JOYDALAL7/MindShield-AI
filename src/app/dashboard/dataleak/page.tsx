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

export default function DataLeakPage() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scanColor, setScanColor] = useState<RiskColor>("red");

  const handleScan = async () => {
    try {
      setLoading(true);
      setResult(null);
      setScanColor("red");

      const res = await axios.post("/api/analyze/dataleak", { email });
      const base = res.data || {};

      // --- Risk score ---
      const score =
        typeof base.finalScore === "number"
          ? base.finalScore
          : typeof base.riskScore === "number"
          ? base.riskScore
          : base.breached
          ? 75
          : 20;

      // --- Color mapping ---
      const color: RiskColor =
        ["red", "purple", "green", "blue"].includes(base.color)
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
        error: "Failed to check data leak. Please try again.",
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

      {/* Page Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center pt-24 mb-6
          bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-400"
      >
        🔒 Data Leak Risk Analyzer
      </motion.h1>

      <div className="max-w-3xl mx-auto px-4 pb-20 space-y-8">
        {/* Input Card */}
        <Card className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
          <label className="text-sm text-gray-300">Enter email address</label>

          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <Input
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-900 text-white border-gray-700"
            />

            <Button
              onClick={handleScan}
              disabled={!email.trim() || loading}
              className="bg-red-600 hover:bg-red-700 font-semibold px-6 rounded-xl"
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
                {/* Threat Risk Meter */}
                <RiskMeter result={result} />

                {/* AI Summary */}
                <ResultCard
                  title="🧠 AI Breach Summary"
                  description={
                    result.aiSummary ||
                    result.explanation ||
                    "AI analysis summary not available."
                  }
                  color="purple"
                />

                {/* Breach Status */}
                <ResultCard
                  title="🔍 Leak Status"
                  description={
                    result.breached
                      ? "⚠️ This email appears in known data breaches!"
                      : "✅ No breaches found in the RapidAPI directory."
                  }
                  color={result.breached ? "red" : "green"}
                />

                {/* Leak Details */}
                {result.leaks?.length > 0 && (
                  <ResultCard
                    title="🗂️ Breach Details"
                    description="Here are the top breach sources linked to this email."
                    leaks={result.leaks}
                    color="blue"
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

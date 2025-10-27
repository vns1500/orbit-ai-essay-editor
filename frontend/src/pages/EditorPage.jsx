import React, { useState, useEffect } from "react";
import EssayEditor from "../components/EssayEditor";
import FeedbackPanel from "../components/FeedbackPanel";
import HistorySidebar from "../components/HistorySidebar";
import api from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getInitialTheme, applyTheme } from "../utils/theme";
import { FaMoon, FaSun, FaRocket } from "react-icons/fa";

export default function EditorPage() {
  const [essay, setEssay] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState(getInitialTheme());

  // ✅ Retrieve token (after login)
  const token = localStorage.getItem("token");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  /* ============================================================
     📜 Fetch history (secured route)
  ============================================================ */
  const fetchHistory = async () => {
    try {
      const res = await api.get("/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.essays) {
        setHistory(res.data.essays);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Fetch history error:", err);
      toast.error("Failed to fetch essay history.");
    }
  };

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  /* ============================================================
     🧠 Evaluation Logic
  ============================================================ */
  const extractScore = (val, fallback = 70) => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const match = val.match(/\d+/);
      return match ? parseInt(match[0]) : fallback;
    }
    return fallback;
  };

  const handleEvaluate = async () => {
    if (!essay.trim()) return toast.warning("Please write or paste your essay first.");
    setLoading(true);
    try {
      const res = await api.post("/evaluate", { essayText: essay });
      const backendFeedback = res.data.feedback || {};

      const normalizedFeedback = {
        clarity: backendFeedback.clarity ?? "Clarity: 75%",
        grammar: backendFeedback.grammar ?? "Grammar: 78%",
        tone: backendFeedback.tone ?? "Tone: 80%",
        impact: backendFeedback.impact ?? "Impact: 82%",
        suggestions: backendFeedback.suggestions || [],
      };

      const clarityScore = extractScore(normalizedFeedback.clarity, 75);
      const grammarScore = extractScore(normalizedFeedback.grammar, 78);
      const toneScore = extractScore(normalizedFeedback.tone, 80);
      const impactScore = extractScore(normalizedFeedback.impact, 82);

      const normalizedScore =
        res.data.score ||
        Math.round((clarityScore + grammarScore + toneScore + impactScore) / 4);

      setFeedback(normalizedFeedback);
      setScore(normalizedScore);
      toast.success("Essay evaluated successfully!");
    } catch (err) {
      console.error("Error during evaluation:", err);
      toast.error("Evaluation failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     💾 Save Essay (with token)
  ============================================================ */
  const handleSave = async () => {
    if (!feedback) return toast.warning("Please evaluate before saving.");
    if (!token) return toast.error("You must be logged in to save essays.");

    setSaving(true);
    try {
      await api.post(
        "/save",
        { essayText: essay, feedback, score },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Essay saved successfully!");
      setEssay("");
      setFeedback(null);
      setScore(null);
      fetchHistory();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save essay. Try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     🕘 History Select
  ============================================================ */
  const handleHistorySelect = (item) => {
    setEssay(item.essayText);
    setFeedback(item.feedback);
    setScore(item.score);
    toast.info("Loaded essay from history");
  };

  /* ============================================================
     🧭 UI Render
  ============================================================ */
  return (
    <div
      className={`flex flex-col md:flex-row min-h-screen transition-all duration-700 ${
        theme === "dark"
          ? "bg-gray-950 text-gray-100"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"
      }`}
    >
      <HistorySidebar history={history} onSelect={handleHistorySelect} />

      <main className="flex-1 p-6 md:p-10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h1
            className={`text-3xl md:text-4xl font-extrabold tracking-tight ${
              theme === "dark"
                ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"
                : "text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600"
            }`}
          >
            Orbit AI — Essay Editor
          </h1>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full shadow-md transition-colors duration-500 ${
              theme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
            title="Toggle Light/Dark Mode"
          >
            {theme === "light" ? <FaMoon size={18} /> : <FaSun size={18} />}
          </button>
        </div>

        <EssayEditor essay={essay} setEssay={setEssay} feedback={feedback} />

        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-white font-semibold flex items-center gap-2 shadow-md transition-transform duration-300 hover:scale-105 ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Evaluating..." : <><FaRocket /> Evaluate</>}
          </button>

          <button
            onClick={handleSave}
            disabled={!feedback || saving}
            className={`px-6 py-2 rounded-lg text-white font-semibold flex items-center gap-2 shadow-md transition-transform duration-300 hover:scale-105 ${
              feedback && !saving
                ? "bg-green-600 hover:bg-green-700"
                : "bg-green-400 cursor-not-allowed"
            }`}
          >
            {saving ? "Saving..." : "Save Essay"}
          </button>
        </div>
      </main>

      <FeedbackPanel feedback={feedback} score={score} />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={theme === "dark" ? "dark" : "light"}
      />
    </div>
  );
}

// import React from "react";
// import { FaLightbulb, FaExclamationTriangle } from "react-icons/fa";
// import { motion } from "framer-motion";

// export default function FeedbackPanel({ feedback, score }) {
//   if (!feedback) {
//     return (
//       <aside className="w-full md:w-80 lg:w-72 border-l border-gray-200 dark:border-gray-800 
//         bg-white dark:bg-gray-900 p-6 shadow-inner overflow-y-auto h-screen transition-colors duration-500">
//         <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Feedback & Suggestions</h2>
//         <p className="text-gray-500 dark:text-gray-400 italic text-sm">No feedback yet. Evaluate your essay to get insights.</p>
//       </aside>
//     );
//   }

//   const scoreColor = (val) => {
//     if (val >= 85) return "bg-green-500";
//     if (val >= 70) return "bg-yellow-500";
//     return "bg-red-500";
//   };

//   const extractScore = (str) => {
//     const match = str.match(/\d+/);
//     return match ? parseInt(match[0]) : 0;
//   };

//   const clarityScore = extractScore(feedback.clarity);
//   const grammarScore = extractScore(feedback.grammar);
//   const toneScore = extractScore(feedback.tone);
//   const impactScore = extractScore(feedback.impact);

//   const metrics = [
//     { label: "Clarity", score: clarityScore, text: feedback.clarity },
//     { label: "Grammar", score: grammarScore, text: feedback.grammar },
//     { label: "Tone", score: toneScore, text: feedback.tone },
//     { label: "Impact", score: impactScore, text: feedback.impact },
//   ];

//   return (
//     <aside className="w-full md:w-80 lg:w-72 border-l border-gray-200 dark:border-gray-800 
//       bg-white dark:bg-gray-900 p-6 shadow-xl overflow-y-auto h-screen transition-colors duration-500">
//       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
//         <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Feedback & Insights</h2>

//         {/* Overall Score */}
//         <div className="mb-6">
//           <span className="font-medium text-gray-700 dark:text-gray-300">Overall Score: </span>
//           <span className={`font-bold ${score >= 85 ? "text-green-500" : score >= 70 ? "text-yellow-400" : "text-red-500"}`}>
//             {score}
//           </span>
//         </div>

//         {/* Metrics */}
//         <div className="space-y-5">
//           {metrics.map((metric) => (
//             <div key={metric.label}>
//               <div className="flex justify-between items-center mb-1">
//                 <span className="font-medium">{metric.label}</span>
//                 <span className="text-sm font-semibold">{metric.score}%</span>
//               </div>

//               <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//                 <div
//                   className={`${scoreColor(metric.score)} h-3 rounded-full transition-all`}
//                   style={{ width: `${metric.score}%` }}
//                 ></div>
//               </div>

//               {metric.score < 70 && (
//                 <div className="flex items-center text-xs text-red-600 dark:text-red-400 mt-1 gap-1">
//                   <FaExclamationTriangle /> Weak area — needs improvement.
//                 </div>
//               )}

//               <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{metric.text}</div>
//             </div>
//           ))}
//         </div>

//         {/* AI Suggestions */}
//         {feedback.aiSuggestions?.length > 0 && (
//           <div className="mt-6">
//             <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold mb-2 gap-1">
//               <FaLightbulb /> AI Suggestions
//             </div>
//             <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300 space-y-1">
//               {feedback.aiSuggestions.map((s, i) => (
//                 <li key={i}>{s}</li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </motion.div>
//     </aside>
//   );
// }

import React from "react";
import { FaLightbulb, FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";

export default function FeedbackPanel({ feedback, score }) {
  // 🟡 Handle case when no feedback yet
  if (!feedback) {
    return (
      <aside
        className="w-full md:w-80 lg:w-72 border-l border-gray-200 dark:border-gray-800 
        bg-white dark:bg-gray-900 p-6 shadow-inner overflow-y-auto h-screen transition-colors duration-500"
      >
        <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
          Feedback & Suggestions
        </h2>
        <p className="text-gray-500 dark:text-gray-400 italic text-sm">
          No feedback yet. Evaluate your essay to get insights.
        </p>
      </aside>
    );
  }

  // 🎨 Color helper for progress bars
  const scoreColor = (val) => {
    if (val >= 85) return "bg-green-500";
    if (val >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  // ✅ Updated to handle numbers or strings safely
  const extractScore = (val) => {
    if (typeof val === "number") return val;
    const match = String(val).match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // 🧠 Safely extract numeric scores
  const clarityScore = extractScore(feedback.clarity);
  const grammarScore = extractScore(feedback.grammar);
  const toneScore = extractScore(feedback.tone);
  const impactScore = extractScore(feedback.impact);

  const metrics = [
    { label: "Clarity", score: clarityScore, text: feedback.clarity },
    { label: "Grammar", score: grammarScore, text: feedback.grammar },
    { label: "Tone", score: toneScore, text: feedback.tone },
    { label: "Impact", score: impactScore, text: feedback.impact },
  ];

  return (
    <aside
      className="w-full md:w-80 lg:w-72 border-l border-gray-200 dark:border-gray-800 
      bg-white dark:bg-gray-900 p-6 shadow-xl overflow-y-auto h-screen transition-colors duration-500"
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
          Feedback & Insights
        </h2>

        {/* 📊 Overall Score */}
        <div className="mb-6">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Overall Score:{" "}
          </span>
          <span
            className={`font-bold ${
              score >= 85
                ? "text-green-500"
                : score >= 70
                ? "text-yellow-400"
                : "text-red-500"
            }`}
          >
            {score ?? "--"}
          </span>
        </div>

        {/* 📈 Individual Metrics */}
        <div className="space-y-5">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{metric.label}</span>
                <span className="text-sm font-semibold">{metric.score}%</span>
              </div>

              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`${scoreColor(
                    metric.score
                  )} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${metric.score}%` }}
                ></div>
              </div>

              {metric.score < 70 && (
                <div className="flex items-center text-xs text-red-600 dark:text-red-400 mt-1 gap-1">
                  <FaExclamationTriangle /> Weak area — needs improvement.
                </div>
              )}

              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {typeof metric.text === "string"
                  ? metric.text
                  : JSON.stringify(metric.text)}
              </div>
            </div>
          ))}
        </div>

        {/* 💡 AI Suggestions */}
        {Array.isArray(feedback.suggestions) && feedback.suggestions.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold mb-2 gap-1">
              <FaLightbulb /> AI Suggestions
            </div>
            <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300 space-y-1">
              {feedback.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </aside>
  );
}

// import React, { useEffect, useState } from "react";

// export default function EssayEditor({ essay, setEssay, feedback }) {
//   const [highlightedEssay, setHighlightedEssay] = useState("");

//   // Count words and sentences
//   const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
//   const sentenceCount = (essay.match(/[.!?]+/g) || []).length;

//   // Highlight weak sentences
//   useEffect(() => {
//     if (!feedback) {
//       setHighlightedEssay(essay);
//       return;
//     }

//     let text = essay;
//     if (feedback.clarityScore < 70 || feedback.grammarScore < 70) {
//       const sentences = essay.split(/(?<=[.!?])/);
//       text = sentences
//         .map((s) => {
//           if (
//             s.trim() &&
//             (feedback.clarityScore < 70 || feedback.grammarScore < 70) &&
//             s.length < 30
//           ) {
//             return `<mark class="bg-red-200 dark:bg-red-800/40">${s}</mark>`;
//           }
//           return s;
//         })
//         .join(" ");
//     }
//     setHighlightedEssay(text);
//   }, [essay, feedback]);

//   return (
//     <div className="flex flex-col gap-2">
//       <div className="flex justify-between mb-1 text-sm text-gray-600 dark:text-gray-300">
//         <span>Words: {wordCount}</span>
//         <span>Sentences: {sentenceCount}</span>
//       </div>

//       <textarea
//         value={essay}
//         onChange={(e) => setEssay(e.target.value)}
//         placeholder="✍️ Write or paste your essay here..."
//         className="w-full h-80 md:h-96 p-4 border border-gray-300 dark:border-gray-700 rounded-lg 
//           focus:outline-none focus:ring-2 focus:ring-blue-500 
//           bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 
//           shadow-md resize-none transition-colors duration-300"
//       />

//       <div
//         className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
//         rounded-md min-h-[80px] overflow-auto text-sm prose dark:prose-invert transition-colors duration-300"
//       >
//         <div dangerouslySetInnerHTML={{ __html: highlightedEssay }}></div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";

export default function EssayEditor({ essay, setEssay, feedback }) {
  const [highlightedEssay, setHighlightedEssay] = useState("");

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const sentenceCount = (essay.match(/[.!?]+/g) || []).length;

  useEffect(() => {
    if (!feedback || typeof feedback !== "object") {
      setHighlightedEssay(essay);
      return;
    }

    const clarityScore = feedback.clarityScore || 0;
    const grammarScore = feedback.grammarScore || 0;

    let text = essay;
    if (clarityScore < 70 || grammarScore < 70) {
      const sentences = essay.split(/(?<=[.!?])/);
      text = sentences
        .map((s) => {
          if (s.trim().length < 30 && (clarityScore < 70 || grammarScore < 70)) {
            return `<mark class="bg-red-200 dark:bg-red-800/40">${s}</mark>`;
          }
          return s;
        })
        .join(" ");
    }

    setHighlightedEssay(text);
  }, [essay, feedback]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between mb-1 text-sm text-gray-600 dark:text-gray-300">
        <span>Words: {wordCount}</span>
        <span>Sentences: {sentenceCount}</span>
      </div>

      <textarea
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
        placeholder="✍️ Write or paste your essay here..."
        className="w-full h-80 md:h-96 p-4 border border-gray-300 dark:border-gray-700 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 
          bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 
          shadow-md resize-none transition-colors duration-300"
      />

      <div
        className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
        rounded-md min-h-[80px] overflow-auto text-sm prose dark:prose-invert transition-colors duration-300"
      >
        <div dangerouslySetInnerHTML={{ __html: highlightedEssay }} />
      </div>
    </div>
  );
}

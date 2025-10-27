import React from "react";

export default function HistorySidebar({ history = [], onSelect }) {
  return (
    <aside className="w-full md:w-80 lg:w-72 border-r border-gray-200 bg-white shadow-inner overflow-y-auto h-screen p-4">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Saved Essays</h2>

      {history.length === 0 ? (
        <div className="text-gray-500 text-sm italic">No saved essays yet.</div>
      ) : (
        <ul className="space-y-3">
          {history.map((item) => (
            <li
              key={item._id || item.id}
              onClick={() => onSelect(item)}
              className="p-3 border rounded-lg hover:shadow-md hover:bg-blue-50 cursor-pointer transition duration-200"
            >
              <div className="flex justify-between items-center text-sm text-gray-700">
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                <span className="font-medium">{item.score}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-3">
                {item.essayText?.slice(0, 120) || "No content"}...
              </p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

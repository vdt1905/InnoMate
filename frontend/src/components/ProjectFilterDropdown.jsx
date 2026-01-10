import { createPortal } from "react-dom";
import React from "react";
const ProjectFilterDropdown = ({
  filterBy,
  setFilterBy,
  sortBy,
  setSortBy,
  setFilterDropdownOpen
}) => {
  return createPortal(
    <div className="fixed right-8 top-16 w-64 bg-gray-800 border border-gray-600/50 rounded-xl shadow-2xl z-[9999] overflow-hidden">
      <div className="p-2 border-b border-gray-700/50">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2">
          Filter Projects
        </p>
      </div>

      <div className="p-2">
        {[
          { value: "all", label: "All Projects", icon: "📋", desc: "Show all your projects" },
          { value: "with-requests", label: "With Requests", icon: "📬", desc: "Projects with pending requests" },
          { value: "hackathon", label: "Hackathons", icon: "⚡", desc: "Competition-based projects" },
          { value: "normal", label: "Normal Projects", icon: "🔧", desc: "Regular development projects" }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => {
              setFilterBy(option.value);
              setFilterDropdownOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
              filterBy === option.value
                ? "bg-yellow-500/20 text-yellow-300"
                : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{option.icon}</span>
              <div>
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs text-gray-500">{option.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-2 border-t border-gray-700/50">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2">
          Sort By
        </p>
        {[
          { value: "newest", label: "Newest First", icon: "🆕" },
          { value: "requests", label: "Most Requests", icon: "📬" },
          { value: "team-size", label: "Team Size", icon: "👥" },
          { value: "title", label: "Title A-Z", icon: "📝" }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => {
              setSortBy(option.value);
              setFilterDropdownOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
              sortBy === option.value
                ? "bg-blue-500/20 text-blue-300"
                : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
            }`}
          >
            <span className="text-sm">{option.icon}</span>
            <span className="text-sm font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
};

export default ProjectFilterDropdown;

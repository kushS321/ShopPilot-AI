import React from 'react';
import { Tag, CheckCircle2, Sparkles, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useAI } from '../context/AIContext';

interface WorkspaceProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories: string[];
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export const AssistantWorkspace: React.FC<WorkspaceProps> = ({
  selectedCategory,
  setSelectedCategory,
  categories,
  sortBy,
  setSortBy,
}) => {
  const { recommendations, executeSearch, isLoading } = useAI();

  if (!recommendations) return null;

  const prefs = recommendations.parsed_preferences;

  const handleFollowupClick = (followupText: string) => {
    if (isLoading) return;
    executeSearch(followupText, true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl border border-ivory-300 p-5 sm:p-6 shadow-subtle">
        {/* Header: Extracted Requirements Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-ivory-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cobalt-50 text-cobalt-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                AI Interpreted Requirements
              </span>
              <p className="text-sm font-medium text-ink-900">
                {prefs.query_summary || recommendations.query}
              </p>
            </div>
          </div>

          {/* Preferences Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {prefs.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-ivory-200 text-ink-800 font-medium">
                <Tag className="w-3 h-3 text-ink-500" />
                {prefs.category}
              </span>
            )}
            {prefs.budget_max && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cobalt-50 text-cobalt-800 font-medium border border-cobalt-200/60">
                Max: {prefs.currency} {prefs.budget_max.toLocaleString()}
              </span>
            )}
            {prefs.priorities.map((p, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-ivory-100 border border-ivory-300 text-ink-700 capitalize"
              >
                ✓ {p}
              </span>
            ))}
          </div>
        </div>

        {/* AI Grounded Conversational Narrative */}
        <div className="mt-4 p-4 rounded-xl bg-ivory-100/70 border border-ivory-200/80">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-cobalt-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-ink-800 leading-relaxed font-normal">
                {recommendations.conversational_response}
              </p>
              {recommendations.comparison_summary && (
                <p className="text-xs text-ink-500">
                  {recommendations.comparison_summary}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Suggested Follow-ups */}
        {recommendations.suggested_followups?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-ivory-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-ink-500">Refine search:</span>
            {recommendations.suggested_followups.map((followup, idx) => (
              <button
                key={idx}
                onClick={() => handleFollowupClick(followup)}
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-ivory-200 border border-ivory-300 text-ink-700 hover:text-ink-900 text-xs transition-colors shadow-subtle disabled:opacity-50"
              >
                <span>{followup}</span>
                <ChevronRight className="w-3 h-3 text-ink-400" />
              </button>
            ))}
          </div>
        )}

        {/* Filters and Sorting Toolbar */}
        <div className="mt-5 pt-4 border-t border-ivory-200 flex flex-wrap items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-ink-900 text-white'
                  : 'bg-ivory-200 text-ink-700 hover:bg-ivory-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-ink-900 text-white'
                    : 'bg-ivory-200 text-ink-700 hover:bg-ivory-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-ink-500" />
            <span className="text-ink-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-ivory-100 border border-ivory-300 rounded-lg px-2.5 py-1 text-ink-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cobalt-500"
            >
              <option value="relevance">Match Score (AI Recommended)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

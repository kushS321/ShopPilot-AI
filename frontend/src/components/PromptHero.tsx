import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Sparkles, X, CornerDownLeft } from 'lucide-react';
import { useAI } from '../context/AIContext';

const EXAMPLE_PROMPTS = [
  {
    title: 'College Wireless Headphones',
    prompt: 'I need wireless headphones for college under ₹5,000. Battery life, comfort, microphone quality, and value for money are my priorities.',
  },
  {
    title: 'Developer Productivity Setup',
    prompt: 'Ergonomic wireless mouse and compact mechanical keyboard for hybrid developer desk setup under $200.',
  },
  {
    title: 'University Ultrabook',
    prompt: 'Lightweight laptop for college programming and lectures under $1,000 with long battery life.',
  },
  {
    title: 'Fitness & Sleep Smartwatch',
    prompt: 'Smartwatch for workout tracking and sleep coaching with AMOLED display under ₹25,000.',
  },
];

export const PromptHero: React.FC = () => {
  const { activeQuery, executeSearch, isLoading } = useAI();
  const [inputVal, setInputVal] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeQuery && !inputVal) {
      setInputVal(activeQuery);
    }
  }, [activeQuery]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    executeSearch(inputVal.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectPrompt = (promptText: string) => {
    setInputVal(promptText);
    executeSearch(promptText);
  };

  return (
    <section className="relative pt-8 pb-12 sm:pt-14 sm:pb-16 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Editorial Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ivory-200 border border-ivory-300 text-ink-700 text-xs font-medium mb-6 shadow-subtle">
          <span className="w-2 h-2 rounded-full bg-cobalt-600 animate-pulse"></span>
          <span>AI Shopping Agent with Authoritative Catalogue Verification</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink-900 leading-[1.12] mb-4">
          Find what fits <span className="italic font-normal text-cobalt-800">your life.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-ink-600 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Tell us what matters. Discover better options, compare confidently with verified specifications, and check out securely with PayPal.
        </p>

        {/* Prompt Input Box */}
        <form
          onSubmit={handleSubmit}
          className="relative max-w-3xl mx-auto rounded-2xl bg-white border border-ivory-400 p-2 sm:p-3 shadow-card hover:border-cobalt-400 focus-within:border-cobalt-600 focus-within:ring-4 focus-within:ring-cobalt-100 transition-all text-left"
        >
          <div className="flex items-start gap-3 px-2 pt-1">
            <Sparkles className="w-5 h-5 text-cobalt-600 mt-2 shrink-0" />
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything: e.g., 'I need wireless headphones for college under ₹5,000 with 40+ hr battery life and clear mic...'"
              className="w-full bg-transparent resize-none border-none outline-none text-ink-900 placeholder:text-ink-400 text-sm sm:text-base leading-relaxed py-1"
            />
            {inputVal && (
              <button
                type="button"
                onClick={() => setInputVal('')}
                className="p-1 rounded-full text-ink-400 hover:text-ink-700 hover:bg-ivory-200 transition-colors mt-1"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-ivory-200 mt-2 px-2 text-xs text-ink-400">
            <span className="hidden sm:inline-flex items-center gap-1">
              Press <kbd className="px-1.5 py-0.5 bg-ivory-200 rounded text-ink-600 font-mono text-[10px]">Enter ↵</kbd> to ask
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink-900 hover:bg-cobalt-700 disabled:opacity-40 disabled:hover:bg-ink-900 text-white font-medium text-xs sm:text-sm transition-all shadow-subtle"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Catalogue...</span>
                  </>
                ) : (
                  <>
                    <span>Find Products</span>
                    <ArrowUp className="w-3.5 h-3.5 text-cobalt-200" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Suggested Starter Prompts */}
        <div className="mt-6 max-w-3xl mx-auto">
          <div className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2.5">
            Or try a sample request:
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPrompt(item.prompt)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ivory-200 hover:bg-ivory-300 text-ink-700 hover:text-ink-900 border border-ivory-300/80 text-xs transition-colors text-left"
              >
                <CornerDownLeft className="w-3 h-3 text-cobalt-600 shrink-0" />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};


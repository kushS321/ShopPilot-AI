import React, { createContext, useContext, useState } from 'react';
import { AIRecommendationResponse } from '../types';
import { sendAIQuery } from '../services/api';

interface AIContextType {
  activeQuery: string;
  recommendations: AIRecommendationResponse | null;
  isLoading: boolean;
  error: string | null;
  executeSearch: (query: string, refine?: boolean) => Promise<void>;
  resetSearch: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [recommendations, setRecommendations] = useState<AIRecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const executeSearch = async (query: string, refine: boolean = false) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setActiveQuery(query);

    try {
      const existingPrefs = refine && recommendations ? recommendations.parsed_preferences : undefined;
      const data = await sendAIQuery(query, existingPrefs);
      setRecommendations(data);
    } catch (err: any) {
      console.error('AI Query failed:', err);
      setError(err.message || 'Failed to interpret shopping request.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setActiveQuery('');
    setRecommendations(null);
    setError(null);
  };

  return (
    <AIContext.Provider
      value={{
        activeQuery,
        recommendations,
        isLoading,
        error,
        executeSearch,
        resetSearch,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within an AIProvider');
  return context;
};


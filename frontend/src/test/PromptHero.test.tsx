import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PromptHero } from '../components/PromptHero';
import { AIProvider } from '../context/AIContext';

describe('PromptHero component', () => {
  it('renders headline and starter example prompt pills', () => {
    render(
      <AIProvider>
        <PromptHero />
      </AIProvider>
    );

    // Headline check
    expect(screen.getByText(/Find what fits/)).toBeInTheDocument();
    expect(screen.getByText(/your life./)).toBeInTheDocument();

    // Canonical prompt pill
    expect(screen.getByText('College Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('Developer Productivity Setup')).toBeInTheDocument();

    // Textarea placeholder
    const textarea = screen.getByPlaceholderText(/Ask anything: e.g./);
    expect(textarea).toBeInTheDocument();
  });
});


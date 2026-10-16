import React from 'react';
import { SiteHeader } from './components/SiteHeader';
import { Hero } from './components/Hero';
import { Ticker } from './components/Ticker';
import { Manifesto } from './components/Manifesto';
import { QuoteBand } from './components/QuoteBand';
import { VoiceComposer } from './components/VoiceComposer';
import { JoinSection } from './components/JoinSection';
import { SiteFooter } from './components/SiteFooter';

export function App() {
  return (
    <div id="top" className="min-h-screen w-full bg-paper font-sans text-ink">
      <SiteHeader />
      <main>
        <Hero />
        <Ticker />
        <Manifesto />
        <QuoteBand />
        <VoiceComposer />
        <JoinSection />
      </main>
      <SiteFooter />
    </div>);

}
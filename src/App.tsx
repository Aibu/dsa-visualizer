import { useState } from 'react';
import { GridVisualizer } from './visualizers/GridVisualizer';
import { SortVisualizer } from './visualizers/SortVisualizer';
import { StructureVisualizer } from './visualizers/structures/StructureVisualizer';

const tabs = [
  { id: 'sorting', label: 'Sorting', Component: SortVisualizer },
  { id: 'graphs', label: 'Graph search', Component: GridVisualizer },
  { id: 'structures', label: 'Data structures', Component: StructureVisualizer },
] as const;

export function App() {
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('sorting');
  const { Component } = tabs.find((t) => t.id === tab)!;

  return (
    <main>
      <header>
        <h1>DSA Visualizer</h1>
        <p className="subtitle">Common algorithms, one step at a time.</p>
        <nav role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? 'tab active' : 'tab'}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <Component />
    </main>
  );
}

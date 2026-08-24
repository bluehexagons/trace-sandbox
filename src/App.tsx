import { useEffect, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import Docs from './features/docs/DocsPage';
import Playground from './features/playground/Playground';
import { buildEmptySandboxHref } from './features/playground/sandboxUrl';

type View = 'playground' | 'docs';

const currentUrl = () =>
  typeof window === 'undefined' ? 'https://example.invalid/' : window.location.href;

export default function App() {
  const [view, setView] = useState<View>('playground');
  const emptySandboxHref = buildEmptySandboxHref(currentUrl());

  useEffect(() => {
    const showPlayground = () => setView('playground');
    window.addEventListener('popstate', showPlayground);
    return () => window.removeEventListener('popstate', showPlayground);
  }, []);

  const followEmptySandboxLink = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    window.history.pushState(null, '', emptySandboxHref);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <h1 className="logo">
            <span className="logo-accent">trace</span> sandbox
          </h1>
          <nav className="header-links">
            <button
              type="button"
              className={`header-btn${view === 'docs' ? ' active' : ''}`}
              onClick={() => setView('docs')}
            >
              Language docs
            </button>
            <button
              type="button"
              className={`header-btn${view === 'playground' ? ' active' : ''}`}
              onClick={() => setView('playground')}
            >
              Playground
            </button>
            <a href={emptySandboxHref} onClick={followEmptySandboxLink}>
              Empty sandbox
            </a>
            <a
              href="https://github.com/bluehexagons/trace-sandbox"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <div className={`playground-view${view === 'docs' ? ' is-hidden' : ''}`}>
        <Playground />
      </div>
      {view === 'docs' && <Docs />}

      <footer className="footer">
        <p>
          trace language by{' '}
          <a href="https://github.com/bluehexagons" target="_blank" rel="noopener noreferrer">
            bluehexagons
          </a>{' '}
          · MIT License
        </p>
      </footer>
    </div>
  );
}

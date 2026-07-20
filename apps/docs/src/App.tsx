import { JQLEditor } from '@query-builder/react'

import './App.css'

function App() {
  return (
    <main className="docs-shell">
      <section className="docs-panel">
        <div className="docs-copy">
          <p className="docs-eyebrow">Query Builder</p>
          <h1>Local dev playground</h1>
          <p className="docs-lead">
            Use this page to work on the JQL editor outside Storybook. It renders the
            package component directly.
          </p>
        </div>

        <div className="docs-editor-surface">
          <JQLEditor />
        </div>
      </section>
    </main>
  )
}

export default App

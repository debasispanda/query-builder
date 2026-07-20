import { JQLEditor } from '@/components/JQLEditor'

function App() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-start justify-center px-4 py-12">
      <section className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">JQL Query Builder</h1>
        <p className="mb-6 text-sm text-slate-600">
          Phase 1 scaffolding complete. The editor shell is ready for query logic.
        </p>
        <JQLEditor />
      </section>
    </main>
  )
}

export default App

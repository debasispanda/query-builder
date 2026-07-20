import type { Meta, StoryObj } from '@storybook/react-vite'

import { JQLEditor } from '@query-builder/react'

const meta = {
  title: 'Query Builder/JQL Editor',
  component: JQLEditor,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof JQLEditor>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
            Query Builder
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            JQL editor demo
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            This Storybook page now hosts the interactive showcase that used to live in
            the React package dev server.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-inner">
          <JQLEditor />
        </div>
      </div>
    </div>
  ),
}
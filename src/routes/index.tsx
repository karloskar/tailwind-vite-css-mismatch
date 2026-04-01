import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            CSS Hash Repro
          </h1>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
              About
            </a>
            <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Action
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Tailwind CSS v4 + Vite Environment API
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            This page uses many Tailwind utility classes to generate non-trivial CSS output.
            The bug occurs when Vite builds client and SSR bundles in separate environment
            passes — the CSS content hash can differ between them.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card title="Responsive" description="Grid columns adapt from 1 to 2 to 3" />
            <Card title="Colors" description="Indigo, gray, white, blue gradients" />
            <Card title="Typography" description="Font sizes, weights, tracking, leading" />
            <Card title="Spacing" description="Padding, margin, gap utilities" />
            <Card title="Borders" description="Rounded corners, rings, shadows" />
            <Card title="States" description="Hover, focus-visible transitions" />
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Badge One
            </span>
            <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
              Badge Two
            </span>
            <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
              Badge Three
            </span>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-400">
          Minimal reproduction for tailwindlabs/tailwindcss#19853
        </div>
      </footer>
    </div>
  );
}

function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 transition-shadow hover:shadow-md">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

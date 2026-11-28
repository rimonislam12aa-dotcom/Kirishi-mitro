import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Krishi Mitra runtime recovery:', error);
  }

  handleReload = () => {
    try {
      if ('caches' in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
      }
    } catch {
      // Ignore cache clear failure
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#F4F5F2] px-4 py-12 text-zinc-900">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-lg font-bold text-zinc-900">
            কৃষি মিত্র (Krishi Mitra)
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            পৃষ্ঠাটি লোড করতে সাময়িক সমস্যা হয়েছে। নিচের বোতামে চাপ দিয়ে পুনরায় চালু করুন।
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#2E7D32] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#256628]"
          >
            <RotateCw className="h-4 w-4" />
            <span>আবার লোড করুন / Reload App</span>
          </button>
        </div>
      </div>
    );
  }
}

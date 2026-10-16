/* eslint-disable react-refresh/only-export-components -- class component; hot reload never applies to it. */
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { readJson } from '../lib/storage';

// Plain markup on purpose: this must work even if the providers or router are what crashed.
const TEXT = {
  en: { title: 'Something went wrong', body: 'Please refresh the page. If it keeps happening, you can order on WhatsApp.', refresh: 'Refresh', whatsapp: 'Order on WhatsApp' },
  hi: { title: 'कुछ गड़बड़ हो गई', body: 'कृपया पेज रीफ़्रेश करें। बार-बार ऐसा हो तो WhatsApp पर ऑर्डर कर सकते हैं।', refresh: 'रीफ़्रेश करें', whatsapp: 'WhatsApp पर ऑर्डर करें' },
};

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Order Kaaro crashed', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const text = TEXT[readJson<string>('ok_lang', 'en') === 'hi' ? 'hi' : 'en'];
    return (
      <main className="flex min-h-screen items-center justify-center bg-oat p-4">
        <div className="card flex max-w-md flex-col items-center gap-3 px-6 py-10 text-center">
          <h1 className="text-2xl">{text.title}</h1>
          <p className="text-stone">{text.body}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <button type="button" className="btn-primary" onClick={() => window.location.reload()}>{text.refresh}</button>
            <a className="btn-outline" href="https://wa.me/919942089120">{text.whatsapp}</a>
          </div>
        </div>
      </main>
    );
  }
}

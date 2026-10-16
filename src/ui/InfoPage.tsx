import type { ReactNode } from 'react';
import { usePageTitle } from './usePageTitle';

export interface InfoSection {
  heading: string;
  body: ReactNode;
}

/** Plain reading layout for About, Terms, Privacy and Cookies. */
export function InfoPage({ title, intro, sections, children }: { title: string; intro?: ReactNode; sections: InfoSection[]; children?: ReactNode }) {
  usePageTitle(title);
  return (
    <article className="page mx-auto max-w-2xl">
      <h1 className="text-[32px]">{title}</h1>
      {intro && <div className="mt-2 text-lg text-ink-soft">{intro}</div>}
      <div className="mt-6 space-y-6">
        {sections.map((s) => (
          <section key={s.heading} className="card p-5">
            <h2 className="text-xl">{s.heading}</h2>
            <div className="mt-2 space-y-2 text-ink-soft [&_a]:text-sage [&_a]:underline [&_li]:ml-5 [&_li]:list-disc">{s.body}</div>
          </section>
        ))}
      </div>
      {children}
    </article>
  );
}

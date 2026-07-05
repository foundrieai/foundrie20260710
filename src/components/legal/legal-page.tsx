type LegalSection = {
  title: string;
  body: string[];
};

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-[#08070c] px-6 py-20 text-white">
      <section className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#ffc400]">Legal &gt;</p>
        <h1 className="mt-4 text-5xl font-bold tracking-normal text-white md:text-7xl">{title}</h1>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-white/42">Last updated: {updated}</p>
        <p className="mt-8 text-lg leading-8 text-white/72">{intro}</p>
        <div className="mt-12 space-y-8">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <h2 className="text-2xl font-bold tracking-normal text-white">{section.title}</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-white/66">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-xs leading-6 text-white/45">
          This page is product-facing draft language for Foundrie AI and should be reviewed by qualified counsel before public launch.
        </p>
      </section>
    </main>
  );
}

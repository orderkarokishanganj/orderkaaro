const CataloguePage = () => {
  return (
    <main className="bg-white">
      <section className="container-custom py-10 sm:py-14">
        <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-primary-50 via-white to-cream-50 p-6 sm:p-8 shadow-sm">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-primary-700 mb-4">
              Catalogue
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Full catalogue, inside the site.
            </h1>
            <p className="mt-4 max-w-2xl text-gray-600 text-base sm:text-lg leading-relaxed">
              The catalogue now opens within the main website shell, so the shared header and footer stay visible while the shopping experience loads below.
            </p>
          </div>
        </div>
      </section>

      <section className="container-custom pb-16">
        <div className="rounded-[28px] border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 px-4 sm:px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-[0.2em]">Embedded catalogue</p>
              <p className="text-sm text-gray-600 mt-1">Scroll, search, and order without leaving the site layout.</p>
            </div>
            <a
              href="/Catelog.html"
              className="inline-flex items-center justify-center rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Open full page
            </a>
          </div>
          <iframe
            src="/Catelog.html"
            title="Order Kaaro Catalogue"
            className="h-[1200px] w-full bg-white"
            loading="lazy"
          />
        </div>
      </section>
    </main>
  );
};

export default CataloguePage;

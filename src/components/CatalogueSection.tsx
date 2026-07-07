import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';

const CatalogueSection = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-700 mb-4">
              <Sparkles className="w-4 h-4" />
              Catalogue Preview
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              See what’s available in the Order Kaaro catalogue.
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-xl">
              Browse fresh groceries, daily essentials, snacks and home care products before placing your order on WhatsApp. Ordering is easier when you know what’s in stock.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/catalogue"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-8 py-4 text-white font-semibold transition hover:bg-primary-700"
              >
                <ShoppingBag className="w-5 h-5" />
                View Catalogue
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/919942089120?text=I%20want%20to%20order"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-4 text-gray-700 font-semibold transition hover:bg-gray-100"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
          <div className="grid gap-4">
            {[
              { title: 'Fresh Produce', description: 'Seasonal vegetables, fruits and herbs.' },
              { title: 'Household Staples', description: 'Rice, pulses, milk and daily essentials.' },
              { title: 'Snacks & Drinks', description: 'Quick bites and beverages for every mood.' },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-xl transition">
                <h3 className="font-semibold text-xl text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CatalogueSection;

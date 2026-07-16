import { ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';

const CATALOGUE_URL = '/Catelog.html';

const catalogueImages = [
  {
    src: 'https://images.pexels.com/photos/4197421/pexels-photo-4197421.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Fresh vegetables and grocery essentials',
    label: 'Fresh Produce',
    description: 'Seasonal vegetables, fruits and herbs.',
  },
  {
    src: 'https://images.pexels.com/photos/4022089/pexels-photo-4022089.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Assorted grocery items on a table',
    label: 'Daily Staples',
    description: 'Rice, pulses, milk and household basics.',
  },
  {
    src: 'https://images.pexels.com/photos/6690146/pexels-photo-6690146.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Delivery-ready grocery package',
    label: 'Quick Delivery',
    description: 'Packed neatly and sent straight to your door.',
  },
];

const CatalogueSection = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
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
              <a
                href={CATALOGUE_URL}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-8 py-4 text-white font-semibold transition hover:bg-primary-700"
              >
                <ShoppingBag className="w-5 h-5" />
                View Catalogue
                <ArrowRight className="w-4 h-4" />
              </a>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-200">
              <div className="relative">
                <img
                  src={catalogueImages[0].src}
                  alt={catalogueImages[0].alt}
                  className="h-72 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute left-5 bottom-5 rounded-2xl bg-white/90 backdrop-blur-sm px-4 py-3 shadow-lg">
                  <p className="text-sm font-semibold text-primary-700">{catalogueImages[0].label}</p>
                  <p className="text-xs text-gray-600">{catalogueImages[0].description}</p>
                </div>
              </div>
            </div>

            {catalogueImages.slice(1).map((item) => (
              <div key={item.label} className="rounded-3xl overflow-hidden shadow-lg bg-white border border-gray-200">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="h-40 w-full object-cover"
                />
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.label}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CatalogueSection;

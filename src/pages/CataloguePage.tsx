import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, Truck, Shield, Clock, RefreshCcw } from 'lucide-react';

const categories = [
  { title: 'Fresh Produce', description: 'Vegetables, fruits and fresh herbs delivered daily.' },
  { title: 'Daily Essentials', description: 'Milk, bread, rice, pulses and kitchen staples.' },
  { title: 'Snacks & Beverages', description: 'Chips, cookies, juices and cold drinks.' },
  { title: 'Home Care', description: 'Cleaning supplies, detergents and hygiene essentials.' },
];

const featuredItems = [
  { title: 'Organic Tomatoes', price: '₹79 / kg' },
  { title: 'Bananas', price: '₹49 / dozen' },
  { title: 'Fresh Paneer', price: '₹220 / 250g' },
  { title: 'Toothpaste', price: '₹99' },
];

const CataloguePage = () => {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-green-500 text-white py-24">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl text-center mx-auto">
            <span className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-semibold tracking-wide text-white mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Explore the Order Kaaro Catalogue
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Browse fresh groceries and essentials from home.
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10">
              Choose from our curated catalogue, then place your order instantly via WhatsApp for fast delivery across Kishanganj.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-primary-600 font-semibold px-6 py-3 shadow-lg hover:bg-white/90 transition"
              >
                <ShoppingBag className="w-5 h-5" />
                Contact Us
              </Link>
              <a
                href="https://wa.me/919942089120?text=I%20want%20to%20order"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 text-white font-semibold px-6 py-3 hover:bg-white/20 transition"
              >
                Start WhatsApp Order
              </a>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-10 left-10 w-36 h-36 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-52 h-52 bg-white/10 rounded-full blur-3xl" />
        </div>
      </section>

      <section className="container-custom py-20">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Catalogue highlights</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-4">Popular categories for every home</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Discover a fresh range of groceries, household supplies, snacks and beverages, all available through our catalogue.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <div key={category.title} className="rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-600 mb-6">
                <RefreshCcw className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-xl mb-3">{category.title}</h3>
              <p className="text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-custom py-20 bg-gray-50 rounded-3xl">
        <div className="flex flex-col lg:flex-row gap-12 lg:items-center lg:justify-between mb-12">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Featured products</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-4">Fresh picks for today</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/about"
              className="inline-flex items-center justify-center rounded-full border border-primary-500 px-5 py-3 text-primary-600 font-semibold transition hover:bg-primary-50"
            >
              Learn More
            </Link>
            <a
              href="https://wa.me/919942089120?text=I%20want%20to%20order"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-white font-semibold transition hover:bg-primary-700"
            >
              Order Now on WhatsApp
            </a>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredItems.map((item) => (
            <div key={item.title} className="rounded-3xl bg-white p-8 shadow-sm hover:shadow-xl transition">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.price}</p>
                </div>
              </div>
              <p className="text-gray-600">Fresh item from our catalogue, sourced and delivered with care.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-custom py-20">
        <div className="rounded-3xl bg-primary-600 px-8 py-12 text-white shadow-2xl">
          <div className="grid gap-6 lg:grid-cols-3 lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-bold">Easy ordering, fast delivery</h2>
              <p className="mt-3 text-white/80 max-w-xl">
                Browse the full catalogue, choose your favorites, and send your order in a single WhatsApp message.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Clock className="w-5 h-5" />
                </span>
                <span>Quick order confirmation</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Shield className="w-5 h-5" />
                </span>
                <span>Safe handling & fresh quality</span>
              </div>
            </div>
            <a
              href="https://wa.me/919942089120?text=I%20want%20to%20order"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-white text-primary-600 font-semibold px-6 py-4 shadow-lg hover:bg-white/90 transition"
            >
              Start WhatsApp Order
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CataloguePage;

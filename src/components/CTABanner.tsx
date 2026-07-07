import { ShoppingCart, Sparkles, ArrowRight } from 'lucide-react';

// In production, this points to a GitHub Pages-hosted product catalogue
const CATALOGUE_URL = 'https://example.com/catalogue';

const CTABanner = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-green-500" />

      {/* Animated background pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-3xl rotate-12 animate-pulse-slow" />
          <div className="absolute top-20 right-20 w-24 h-24 border-4 border-white rounded-2xl -rotate-12 animate-float" />
          <div className="absolute bottom-10 left-1/3 w-16 h-16 border-4 border-white rounded-xl rotate-45 animate-float-delayed" />
          <div className="absolute bottom-20 right-1/4 w-20 h-20 border-4 border-white rounded-2xl -rotate-6 animate-pulse-slow animation-delay-600" />
        </div>
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-400/20 rounded-full blur-3xl" />

      <div className="container-custom section-padding relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Convenience at Your Fingertips</span>
          </div>

          {/* Headline */}
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Order Kaaro Delivers
            <span className="block text-accent-300 animate-pulse-slow">Happiness to Your Doorstep</span>
          </h2>

          {/* Description */}
          <p className="text-white/90 text-lg md:text-xl lg:text-2xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Soch ke dekho, ab kabhi grocery store ki bheed mein nahi fasna padega.{' '}
            <span className="font-semibold text-white">Hum fresh sabzi se lekar household essentials tak sab kuch seedha aapke ghar tak laate hain.</span>
          </p>

          {/* Stats/Features Row */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {['45 Min Delivery', 'Fresh Produce', 'No Minimum Order'].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full"
              >
                <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
                <span className="text-white font-medium">{item}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <a
            href={CATALOGUE_URL}
            className="group inline-flex items-center justify-center gap-3 bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-accent-500/40 hover:scale-105 active:scale-95 text-lg"
          >
            <ShoppingCart className="w-6 h-6 group-hover:animate-bounce" />
            Shop Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Secondary text */}
          <p className="mt-6 text-white/70 text-sm">
            Or order directly via WhatsApp for instant support
          </p>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 50L60 45.7C120 41.3 240 33.3 360 30.7C480 28 600 30.7 720 35C840 39.3 960 45.3 1080 45.7C1200 46 1320 40.7 1380 37.7L1440 34.7V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z"
            fill="#f9fafb"
          />
        </svg>
      </div>
    </section>
  );
};

export default CTABanner;

import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Clock, Shield, ChevronRight } from 'lucide-react';

const CATALOGUE_PATH = '/catalogue';

const stats = [
  { value: '45', suffix: 'min', label: 'Delivery Time' },
  { value: '500+', suffix: '', label: 'Products' },
  { value: '100+', suffix: '', label: 'Happy Families' },
];

const features = [
  { icon: Truck, text: 'Free Delivery' },
  { icon: Shield, text: 'Quality Assured' },
  { icon: Clock, text: 'Super Fast' },
];

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-cream-50" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-accent-300/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
        <div className="absolute top-1/2 right-10 w-64 h-64 bg-primary-200/30 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent-200/30 rounded-full blur-2xl animate-float-delayed" />

        {/* Decorative circles */}
        <div className="absolute top-40 left-1/4 w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
        <div className="absolute top-60 right-1/3 w-3 h-3 bg-accent-400 rounded-full animate-pulse animation-delay-200" />
        <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-primary-500 rounded-full animate-pulse animation-delay-600" />
      </div>

      <div className="container-custom section-padding relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white shadow-lg px-4 py-2 rounded-full text-sm font-medium mb-6 animate-scale-in">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-gray-600">WhatsApp-Based Grocery Delivery</span>
              <ShoppingBag className="w-4 h-4 text-primary-500" />
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
              Get Groceries{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-gradient">Without Hassle</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C40 4 80 4 200 10" stroke="url(#paint0_linear)" strokeWidth="4" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="paint0_linear" x1="0" y1="0" x2="200" y2="0">
                      <stop stopColor="#22c55e"/>
                      <stop offset="1" stopColor="#f97316"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              Traffic, bheed-bhaad wale market aur lambi shopping list ko bolo bye.{' '}
              <span className="text-gray-800 font-medium">Bas kuch taps mein WhatsApp se apne daily essentials order karo aur ghar par aaram se relax karo.</span>
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-sm font-medium text-gray-700 hover:shadow-lg transition-shadow duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <feature.icon className="w-4 h-4 text-primary-500" />
                  {feature.text}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link
                to={CATALOGUE_PATH}
                className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-accent-500/25 hover:scale-105 active:scale-95 text-lg overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Order Now
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 animate-shimmer" />
              </Link>
              <a
                href="https://wa.me/919942089120?text=I%20want%20to%20order"
                className="group inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-green-500/25 hover:scale-105 active:scale-95"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.212 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 lg:gap-10">
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="font-display text-3xl md:text-4xl font-bold text-gray-900">
                    {stat.value}
                    <span className="text-primary-500">{stat.suffix}</span>
                  </div>
                  <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative lg:pl-8 animate-fade-in animation-delay-400">
            {/* Main Image Container */}
            <div className="relative">
              {/* Decorative shapes */}
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-accent-400/30 rounded-3xl animate-bounce-subtle" />
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary-400/30 rounded-2xl animate-float" />
              <div className="absolute top-1/2 -right-4 w-16 h-16 bg-accent-300/40 rounded-xl animate-pulse-slow" />

              {/* Image */}
              <div className="relative bg-gradient-to-br from-primary-100 to-accent-100 p-3 rounded-3xl shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/6207629/pexels-photo-6207629.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Fresh vegetables and groceries delivery"
                  className="w-full h-[400px] md:h-[500px] object-cover rounded-2xl"
                />

                {/* Floating Cards */}
                <div className="absolute -left-6 top-1/4 bg-white p-4 rounded-2xl shadow-xl animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Fresh Daily</p>
                      <p className="text-sm text-gray-500">Quality First</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-6 bottom-1/4 bg-white p-4 rounded-2xl shadow-xl animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-accent-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">45 Min</p>
                      <p className="text-sm text-gray-500">Delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-subtle">
        <span className="text-sm text-gray-500 font-medium">Scroll Down</span>
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-gray-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;

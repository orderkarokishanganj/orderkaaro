import { Leaf, Package, Clock, ArrowRight } from 'lucide-react';

const services = [
  {
    icon: Leaf,
    title: 'Fresh Produce',
    description: 'Taaza farm-fresh vegetables aur fruits ab direct local market se aapke doorstep tak. Freshness ka bharosa, bina market jaaye sirf ORDER KAARO ke saath.',
    image: 'https://images.pexels.com/photos/13009733/pexels-photo-13009733.jpeg?auto=compress&cs=tinysrgb&w=600',
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-50',
  },
  {
    icon: Package,
    title: 'Daily Essentials',
    description: 'Ab ghar ke zaroori samaan kabhi khatam nahi honge. Daily must-have items ki complete range paao, jab chaho tab ORDER KAARO se mangwao.',
    image: 'https://images.pexels.com/photos/64236/grocery-food-cleaning-clean-64236.jpeg?auto=compress&cs=tinysrgb&w=600',
    gradient: 'from-accent-500 to-orange-600',
    bgGradient: 'from-accent-50 to-orange-50',
  },
  {
    icon: Clock,
    title: 'Quick Delivery',
    description: 'Abhi order karo aur sirf 45 minutes mein groceries paao. Itna fast ki shopping list banane se pehle hi delivery ho jaaye!',
    image: 'https://images.pexels.com/photos/6965754/pexels-photo-6965754.jpeg?auto=compress&cs=tinysrgb&w=600',
    gradient: 'from-primary-500 to-green-600',
    bgGradient: 'from-primary-50 to-green-50',
  },
];

const Services = () => {
  return (
    <section className="relative bg-white section-padding overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            Order Kaaro Services
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Your Daily Needs,{' '}
            <span className="text-primary-500">Covered</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            ORDER KAARO ke saath paao lightning-fast grocery delivery.{' '}
            <span className="font-medium text-gray-800">Ab ghar se bahar jaane ki tension khatam!</span>
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Card */}
              <div className={`relative bg-gradient-to-br ${service.bgGradient} rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-3`}>
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Icon Badge */}
                  <div className={`absolute top-4 left-4 w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    <service.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Floating badge */}
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-gray-700 shadow-lg">
                    #{index + 1} Service
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-display text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {service.description}
                  </p>

                  {/* Action Link */}
                  <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-4 transition-all duration-300 cursor-pointer">
                    <span>Learn More</span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Hover overlay effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <a
            href="https://wa.me/919942089120?text=I%20want%20to%20order"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.212 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Order via WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

export default Services;

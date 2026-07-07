import { MessageCircle, Zap, Grid, Mouse, ArrowRight, Sparkles } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

const features: { icon: LucideIcon; title: string; description: string; color: string; gradient: string }[] = [
  {
    icon: MessageCircle,
    title: 'WhatsApp Magic',
    description: 'Bas kuch hi magical taps aur bina kisi stress ke apne daily essentials WhatsApp se order karo. Ghar baithe sab kuch easily aur hassle-free mil jaata hai.',
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    icon: Zap,
    title: 'Fast Delivery',
    description: "Hum sirf groceries deliver nahi karte, unhe seedha aapke doorstep par 'teleport' kar dete hai. Itna fast ki 'ORDER KAARO' bolne se pehle hi sab kuch aapke paas hoga.",
    color: 'orange',
    gradient: 'from-accent-500 to-orange-600',
  },
  {
    icon: Grid,
    title: 'Mega Product Range',
    description: "Exotic vegetables se lekar daily essentials tak, hamare paas variety itni zyada hai ki aapki dadi ki recipe book bhi sharma jaaye.",
    color: 'primary',
    gradient: 'from-primary-500 to-green-600',
  },
  {
    icon: Mouse,
    title: 'Easy Ordering',
    description: "Hamara interface itna simple aur user-friendly hai ki jo log tech se thoda door rehte hain, woh bhi easily bina kisi confusion ke groceries order kar sakte hain.",
    color: 'purple',
    gradient: 'from-violet-500 to-purple-600',
  },
];

const featureImages = [
  'https://images.pexels.com/photos/5638268/pexels-photo-5638268.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/5638732/pexels-photo-5638732.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/6421982/pexels-photo-6421982.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/5638618/pexels-photo-5638618.jpeg?auto=compress&cs=tinysrgb&w=600',
];

const Features = () => {
  return (
    <section className="relative bg-gradient-to-b from-white via-primary-50/30 to-white section-padding overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent-200/20 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent-100 text-accent-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Why Choose Us
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Your Groceries Revolution{' '}
            <span className="text-gradient">Starts Here</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            Lightning-fast WhatsApp ordering, unbeatable product variety aur delivery itni fast ki{' '}
            <span className="font-medium text-gray-800">pados wale uncle ki gossip se bhi pehle pahunch jaaye.</span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="space-y-20 lg:space-y-32">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-8 lg:gap-16 items-center`}
            >
              {/* Content */}
              <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-left' : 'lg:text-right'}`}>
                <div className={`inline-flex items-center gap-3 mb-4 ${index % 2 === 0 ? '' : 'lg:flex-row-reverse'}`}>
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider text-gray-500">
                    Feature {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {feature.description}
                </p>

                <div className={`flex items-center gap-2 ${index % 2 === 0 ? '' : 'lg:justify-end'}`}>
                  <a
                    href="https://wa.me/919942089120?text=I%20want%20to%20order"
                    className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors group"
                  >
                    Try it now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Image */}
              <div className="flex-1 relative">
                <div className="relative">
                  {/* Background decoration */}
                  <div className={`absolute -inset-4 bg-gradient-to-br ${feature.gradient} opacity-20 rounded-3xl blur-2xl`} />

                  {/* Main image container */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                    <img
                      src={featureImages[index]}
                      alt={feature.title}
                      className="w-full h-64 lg:h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Feature number badge */}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                      <span className="font-display font-bold text-gray-900">{String(index + 1).padStart(2, '0')}</span>
                    </div>

                    {/* Floating icon */}
                    <div className={`absolute top-4 right-4 w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className={`absolute -${index % 2 === 0 ? 'top' : 'bottom'}-8 -${index % 2 === 0 ? 'left' : 'right'}-8 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-30 rounded-2xl animate-pulse-slow`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

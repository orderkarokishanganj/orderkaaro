 import { Leaf, Heart, Shield, Users, Eye, Zap, Smartphone, Truck, Target, Award, Globe, CheckCircle } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Reliability',
    description: 'We understand that when you order something for your home, you need it on time, every time. Our operations are built around consistency and accountability.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Leaf,
    title: 'Freshness',
    description: 'We source our produce directly from local markets and trusted suppliers to ensure that what reaches your doorstep is as fresh as what you would pick yourself.',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    icon: Zap,
    title: 'Simplicity',
    description: 'Technology should make life easier, not harder. Our WhatsApp-based ordering system is designed to be accessible to everyone, from students to senior citizens.',
    gradient: 'from-yellow-500 to-orange-600',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'We are a local business serving local people. We take pride in supporting local vendors, reducing food waste, and contributing meaningfully to the communities we operate in.',
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    icon: Eye,
    title: 'Transparency',
    description: 'No hidden charges. No surprise fees. What you see is what you pay.',
    gradient: 'from-pink-500 to-rose-600',
  },
];

const deliverables = [
  { text: 'Farm-fresh vegetables and fruits sourced from local markets', icon: '🥬' },
  { text: 'Dairy products, eggs, and breakfast essentials', icon: '🥛' },
  { text: 'Packaged foods, snacks, and beverages', icon: '🍪' },
  { text: 'Cleaning and household supplies', icon: '🧹' },
  { text: 'Personal care and hygiene products', icon: '🧴' },
  { text: 'Specialty and exotic produce', icon: '🥑' },
];

const milestones = [
  { year: '2026', event: 'Founded in June with a mission to simplify grocery shopping' },
  { year: '2026', event: 'First 100 happy households' },
  { year: '2026', event: 'Expanded product range to 500+ items' },
  { year: '2026', event: 'Serving 100+ families daily' },
];

const founders = [
  { name: 'Prem Kumar Saha', role: 'Founder' },
  { name: 'Divyanshu Jain', role: 'Co-Founder' },
  { name: 'Prianshu Gupta', role: 'Co-Founder' },
  { name: 'Harshit Agarwal', role: 'Co-Founder' },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-cream-50" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-200/30 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
        </div>

        <div className="container-custom section-padding relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white shadow-lg px-4 py-2 rounded-full text-sm font-semibold text-gray-700 mb-6 animate-scale-in">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            Our Story
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
            About{' '}
            <span className="text-gradient">Order Kaaro</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Delivering Convenience,{' '}
            <span className="font-semibold text-gray-800">One Order at a Time</span>
          </p>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
            {[
              { value: 'Fast', label: 'Delivery' },
              { value: '500+', label: 'Products' },
              { value: '100+', label: 'Happy Families' },
              { value: '24/7', label: 'Support' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                <div className="font-display text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-5xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-accent-100 text-accent-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Target className="w-4 h-4" />
              Who We Are
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Your Neighbourhood{' '}
              <span className="text-primary-500">Grocery Partner</span>
            </h2>
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
              Order Kaaro is a fast-growing grocery and daily essentials delivery service built for the modern Indian household. Founded with a singular mission—to eliminate the friction of everyday shopping—we bring fresh produce, household staples, and daily necessities directly to your doorstep through a seamless WhatsApp-based ordering experience.
            </p>
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mt-6">
              We operate with a simple belief: <span className="font-semibold text-gray-800">your time is valuable, and spending it in crowded markets or long checkout queues should be a choice, not a necessity.</span> Order Kaaro was created to give that choice back to you.
            </p>
          </div>
        </div>
      </section>

      {/* Our Founders */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white shadow-lg px-4 py-2 rounded-full text-sm font-semibold text-gray-700 mb-4">
              <Users className="w-4 h-4" />
              The Team Behind Order Kaaro
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Meet Our{' '}
              <span className="text-primary-500">Founders</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {founders.map((person, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 text-center"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {person.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <h4 className="font-display font-bold text-gray-900 text-lg mb-1">{person.name}</h4>
                <p className="text-primary-600 text-sm font-semibold">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story - Timeline */}
      <section className="section-padding bg-gradient-to-b from-white to-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Award className="w-4 h-4" />
                Our Story
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                From Frustration to{' '}
                <span className="text-primary-500">Innovation</span>
              </h2>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  Order Kaaro was born out of a very real, very familiar frustration.
                </p>
                <p>
                  Like millions of households across India, our founders experienced firsthand the daily challenge of managing grocery runs—navigating busy markets, battling traffic, carrying heavy bags, and still somehow forgetting the one item that started the whole trip. The process was exhausting, inefficient, and frankly, long overdue for a better solution.
                </p>
                <p>
                  We asked ourselves a simple question: <span className="font-semibold text-gray-800">"What if ordering groceries was as easy as sending a WhatsApp message?"</span>
                </p>
                <p>
                  That question became <span className="font-bold text-primary-600">Order Kaaro</span>.
                </p>
                <p>
                  Starting from a small operation in our local community, we built a service around what people actually needed—speed, reliability, fair pricing, and a human touch. No complicated apps to download. No lengthy registration processes. Just a quick message and a <span className="font-semibold">fast delivery</span> to your door.
                </p>
                <p>
                  What began as a neighbourhood solution has since grown into a trusted platform serving hundreds of households, with a product range spanning fresh farm produce, daily essentials, snacks, and household supplies.
                </p>
              </div>

              {/* Timeline */}
              <div className="mt-8 space-y-4">
                {milestones.map((milestone, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-20 text-sm font-bold text-primary-500">{milestone.year}</div>
                    <div className="flex-1 relative">
                      <div className="absolute left-0 top-2 w-2 h-2 bg-primary-500 rounded-full" />
                      <div className="pl-6 pb-4 border-l-2 border-primary-200 group-hover:border-primary-500 transition-colors">
                        <p className="text-gray-700 font-medium">{milestone.event}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary-200 to-green-200 rounded-3xl opacity-50 blur-2xl" />
              <div className="relative bg-white p-4 rounded-3xl shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/39019/fruit-food-orange-hands-39019.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Fresh produce"
                  className="w-full h-80 lg:h-[500px] object-cover rounded-2xl"
                />
                {/* Floating card */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-green-500 rounded-xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Fast Delivery</p>
                      <p className="text-sm text-gray-500">Guaranteed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="group">
              <div className="relative bg-gradient-to-br from-primary-500 to-green-500 p-8 md:p-10 rounded-3xl text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Heart className="w-7 h-7" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">Our Mission</h3>
                  <p className="text-white/90 text-lg leading-relaxed">
                    To make everyday shopping effortless, accessible, and reliable for every household, regardless of location, age, or technical ability, by delivering quality products with speed, care, and consistency.
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="relative bg-gradient-to-br from-accent-500 to-orange-500 p-8 md:p-10 rounded-3xl text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Eye className="w-7 h-7" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">Our Vision</h3>
                  <p className="text-white/90 text-lg leading-relaxed">
                    To become the most trusted grocery delivery service in our region, setting the standard for convenience, product quality, and customer experience in the Indian quick-commerce space.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white shadow-lg px-4 py-2 rounded-full text-sm font-semibold text-gray-700 mb-4">
              <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
              What Drives Us
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Our{' '}
              <span className="text-primary-500">Values</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className={`w-14 h-14 bg-gradient-to-br ${value.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-display font-bold text-gray-900 text-lg mb-2">{value.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why WhatsApp */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-5xl">
          <div className="relative bg-gradient-to-br from-green-50 via-white to-green-50 rounded-3xl overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-8 h-8 border-2 border-green-600 rounded-lg"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    transform: `rotate(${Math.random() * 45}deg)`,
                  }}
                />
              ))}
            </div>

            <div className="p-8 md:p-12 lg:p-16 relative z-10">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center shadow-xl animate-bounce-subtle">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.212 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    Why WhatsApp?
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    We made a deliberate choice to build our ordering system on WhatsApp—a platform already used by <span className="font-semibold">over 500 million people in India</span>. No new app to install. No account to create. No learning curve. Just open a chat, send your list, and leave the rest to us.
                  </p>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    This approach means our service is accessible to everyone—whether you are a working professional placing a quick order between meetings, a homemaker managing a busy household, or an elderly resident who prefers a straightforward, familiar interface.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {['No new app to download', 'No account registration', 'Accessible to everyone', 'Instant communication', 'Stay in control'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Deliver */}
      <section className="section-padding bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-4 bg-accent-200 rounded-3xl opacity-30 blur-2xl" />
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/1435907/pexels-photo-1435907.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Grocery delivery products"
                  className="w-full h-80 lg:h-[450px] object-cover rounded-3xl shadow-xl"
                />
                {/* Floating badge */}
                <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-xl animate-float">
                  <p className="font-display text-3xl font-bold text-gray-900">500+</p>
                  <p className="text-sm text-gray-500">Products</p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Globe className="w-4 h-4" />
                Our Products
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                What We{' '}
                <span className="text-primary-500">Deliver</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Order Kaaro offers a comprehensive product range curated to meet the daily needs of Indian households, including:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {deliverables.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mt-6">
                Our catalogue is continuously updated based on customer feedback and seasonal availability to ensure you always find what you need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-green-500" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-3xl rotate-12" />
          <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-white rounded-2xl -rotate-12" />
        </div>

        <div className="container-custom section-padding relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Truck className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Our Promise to You
            </h2>
            <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-8">
              Every order placed with Order Kaaro carries our commitment to quality, speed, and service. We are not just a delivery platform—<span className="font-semibold">we are a neighbour you can count on.</span> If something is ever not right with your order, we will make it right. No questions asked.
            </p>
            <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-8">
              We are proud of the trust our customers place in us, and we work every single day to deserve it.
            </p>
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-lg font-medium">
              <Heart className="w-5 h-5 text-accent-300 animate-pulse" />
              <span className="text-white">Not just a delivery platform — a neighbour you can count on</span>
            </div>
          </div>
        </div>
      </section>

      {/* Get in Touch CTA */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom text-center">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Smartphone className="w-4 h-4" />
            Get in Touch
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            We'd Love to{' '}
            <span className="text-primary-500">Hear From You</span>
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
            Whether it is feedback, a partnership enquiry, or simply a question about your order—we are here to help.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="https://wa.me/919942089120?text=I%20want%20to%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.212 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp: +91 99429 89120
            </a>
            <a
              href="https://orderkaaro.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 border border-gray-200"
            >
              <Globe className="w-6 h-6" />
              Website: orderkaaro.in
            </a>
          </div>

          <p className="font-display text-xl md:text-2xl font-bold text-gray-900">
            Order Kaaro —{' '}
            <span className="text-gradient">Groceries Delivered. Happiness Guaranteed.</span>
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
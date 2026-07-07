import { Mail, MessageCircle, Phone, MapPin, Clock, Send, CheckCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email',
    subtitle: 'Write email',
    value: 'Orderkarokishanganj@gmail.com',
    link: 'mailto:Orderkarokishanganj@gmail.com',
    buttonText: 'Send an email',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: () => (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.661-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    title: 'Instagram',
    subtitle: '@order.kaaro',
    value: 'View Profile',
    link: 'https://www.instagram.com/order.kaaro',
    buttonText: 'View Profile',
    color: 'instagram',
    gradient: 'from-purple-500 via-pink-500 to-orange-500',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    subtitle: 'Primary: +91 9942089120',
    subsubtitle: 'Alternate: +91 78570 33161',
    value: 'Chat on WhatsApp',
    link: 'https://wa.me/919942089120?text=I%20want%20to%20order',
    buttonText: 'Chat on WhatsApp',
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
  },
];

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-cream-50" />

        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-200/30 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
        </div>

        <div className="container-custom section-padding relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white shadow-lg px-4 py-2 rounded-full text-sm font-semibold text-gray-700 mb-6 animate-scale-in">
            <MessageCircle className="w-4 h-4 text-primary-500" />
            Get In Touch
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Contact{' '}
            <span className="text-gradient">Us</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Reach out via any of the channels below —{' '}
            <span className="font-semibold text-gray-800">we're happy to help.</span>
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            {/* Contact Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  className="group relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden">
                    {/* Background gradient on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${method.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${method.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <method.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                      {method.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-1">{method.subtitle}</p>
                    {method.subsubtitle && (
                      <p className="text-xs text-gray-400 mb-3">{method.subsubtitle}</p>
                    )}
                    <p className="text-gray-600 font-medium mb-6">
                      {method.value}
                    </p>

                    {/* Button */}
                    <a
                      href={method.link}
                      target={method.title === 'Instagram' ? '_blank' : undefined}
                      rel={method.title === 'Instagram' ? 'noopener noreferrer' : undefined}
                      className={`inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 group-hover:scale-105 ${
                        method.color === 'green'
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : method.color === 'instagram'
                          ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {method.buttonText}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form & Info */}
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Form */}
              <div className="lg:col-span-3">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-xl border border-gray-100">
                  <h3 className="font-display text-2xl font-bold text-gray-900 mb-6">
                    Send us a Message
                  </h3>

                  {isSubmitted ? (
                    <div className="py-12 text-center animate-scale-in">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </div>
                      <h4 className="font-display font-bold text-gray-900 text-xl mb-2">
                        Message Sent Successfully!
                      </h4>
                      <p className="text-gray-600">
                        We'll get back to you within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Name
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-white"
                            placeholder="Enter your name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-white"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-white"
                          placeholder="What's this about?"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Your Message
                        </label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          rows={5}
                          className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all resize-none bg-white"
                          placeholder="How can we help you?"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Business Hours */}
                <div className="bg-gradient-to-br from-primary-500 to-green-500 rounded-3xl p-6 text-white shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h4 className="font-display text-xl font-bold">Business Hours</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-white/90">
                      <span>Monday - Saturday</span>
                      <span className="font-semibold">9:00 AM - 9:00 PM</span>
                    </div>
                    <div className="flex justify-between text-white/90">
                      <span>Sunday</span>
                      <span className="font-semibold">10:00 AM - 6:00 PM</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary-600" />
                    </div>
                    <h4 className="font-display text-xl font-bold text-gray-900">Service Area</h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    We currently serve <span className="font-semibold">Kishanganj, Bihar</span> and surrounding areas. Delivery is FREE within our service zone!
                  </p>
                </div>

                {/* Quick Support */}
                <div className="bg-green-50 rounded-3xl p-6 border border-green-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-display text-xl font-bold text-gray-900">Need Quick Help?</h4>
                      <p className="text-sm text-gray-500">Call us directly</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Primary</p>
                      <a
                        href="tel:+919942089120"
                        className="block text-center py-3 bg-white rounded-xl font-semibold text-gray-800 hover:bg-green-100 transition-colors"
                      >
                        +91 99420 89120
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Alternate</p>
                      <a
                        href="tel:+917857033161"
                        className="block text-center py-3 bg-white rounded-xl font-semibold text-gray-800 hover:bg-green-100 transition-colors"
                      >
                        +91 78570 33161
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map/Image Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/6965754/pexels-photo-6965754.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Order Kaaro delivery service"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="max-w-xl">
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
                    Serving Your Neighbourhood
                  </h3>
                  <p className="text-white/90 mb-6">
                    Order Kaaro delivers fresh groceries and daily essentials right to your doorstep. Fast, reliable, and always with a smile.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="https://wa.me/919942089120?text=I%20want%20to%20order"
                      className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.212 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Order via WhatsApp
                    </a>
                    <Link
                      to="/about"
                      className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-xl transition-all"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;

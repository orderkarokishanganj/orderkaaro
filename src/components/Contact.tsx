import { useState } from 'react';
import { MessageCircle, Mail, Headphones, Send, CheckCircle, MapPin, Clock, Phone } from 'lucide-react';

const contactMethods = [
  {
    icon: MessageCircle,
    title: 'WhatsApp Support',
    subtitle: 'Quick Chat Assistance',
    description: 'Get instant help via WhatsApp',
    link: 'https://wa.me/919942089120?text=I%20want%20to%20order',
    linkText: 'Chat Now',
    color: 'green',
  },
  {
    icon: Mail,
    title: 'Email Us',
    subtitle: 'Instant Email Response',
    description: 'orderkarokishanganj@gmail.com',
    link: 'mailto:orderkarokishanganj@gmail.com',
    linkText: 'Send Email',
    color: 'primary',
  },
  {
    icon: Headphones,
    title: 'Live Chat',
    subtitle: 'Real-time Support',
    description: 'Support during business hours',
    link: 'https://wa.me/919942089120?text=I%20want%20to%20order',
    linkText: 'Start Chat',
    color: 'accent',
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulating form submission
    setTimeout(() => {
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitting(false);
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <section className="relative bg-white section-padding overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-100/50 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <MessageCircle className="w-4 h-4" />
            Get In Touch
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Connect{' '}
            <span className="text-primary-500">With Us</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl">
            Your convenience is our mission. Multiple channels to ensure you{'\''}re never left without support.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-xl border border-gray-100">
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-100 to-transparent rounded-bl-[100px]" />

              <h3 className="font-display text-2xl font-bold text-gray-900 mb-6 relative z-10">
                Send Us a Message
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
                    We'll get back to you as soon as possible.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-white"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all bg-white"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Message
                    </label>
                    <textarea
                      id="message"
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
                    className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Your Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Methods & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Cards */}
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                className="group flex items-center gap-4 p-5 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  method.color === 'green' ? 'bg-green-100 group-hover:bg-green-500' :
                  method.color === 'accent' ? 'bg-accent-100 group-hover:bg-accent-500' :
                  'bg-primary-100 group-hover:bg-primary-500'
                }`}>
                  <method.icon className={`w-7 h-7 transition-colors duration-300 ${
                    method.color === 'green' ? 'text-green-600 group-hover:text-white' :
                    method.color === 'accent' ? 'text-accent-600 group-hover:text-white' :
                    'text-primary-600 group-hover:text-white'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-display font-bold text-gray-900">
                    {method.title}
                  </h4>
                  <p className="text-sm text-gray-500">{method.subtitle}</p>
                </div>
                <div className="text-gray-400 group-hover:text-primary-500 transition-colors">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}

            {/* Additional Info */}
            <div className="bg-gradient-to-br from-primary-50 to-green-50 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Service Area</p>
                  <p className="text-sm text-gray-600">Kishanganj & surrounding areas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Operating Hours</p>
                  <p className="text-sm text-gray-600">9:00 AM - 9:00 PM (All days)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">+91 99420 89120 (Primary)</p>
                  <p className="text-sm text-gray-600">+91 78570 33161 (Alternate)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Fix for the missing import
import { ArrowRight } from 'lucide-react';

export default Contact;

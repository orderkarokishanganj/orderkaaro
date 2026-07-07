import { Star, Check, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Working Mom',
    quote: "Order Kaaro saved my life! No more dragging tired kids through grocery stores after a long workday. Just tap, order, and done!",
    highlights: ['Quick ordering process', 'Fresh grocery items', 'Timely home delivery'],
    image: 'https://images.pexels.com/photos/7749094/pexels-photo-7749094.jpeg?auto=compress&cs=tinysrgb&w=300',
    rating: 5,
  },
  {
    name: 'Rahul Kumar',
    role: 'Student',
    quote: "Budget-friendly and super convenient! Order Kaaro helps me manage groceries without breaking my student wallet.",
    highlights: ['Affordable pricing', 'Wide product range', 'No minimum order'],
    image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=300',
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="relative bg-gray-50 section-padding overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-100/50 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white shadow-lg px-4 py-2 rounded-full text-sm font-semibold text-gray-700 mb-4">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            Customer Love
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What Our Customers{' '}
            <span className="text-primary-500">Say</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl">
            Real stories from people who've transformed their daily shopping experience
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Card */}
              <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-50" />

                {/* Quote icon */}
                <div className="absolute top-6 right-6 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                  <Quote className="w-6 h-6 text-primary-500" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Author Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center border-2 border-white">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-gray-900 text-lg">
                        {testimonial.name}
                      </h4>
                      <p className="text-primary-500 font-medium text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-gray-700 text-lg md:text-xl leading-relaxed mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Highlights */}
                  <div className="space-y-2">
                    {testimonial.highlights.map((highlight, i) => (
                      <div key={i} className="flex items-center gap-3 text-gray-600">
                        <div className="w-5 h-5 bg-gradient-to-br from-primary-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decorative corner */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary-100 to-transparent opacity-50 rounded-tl-[100px]" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Join hundreds of happy customers!</p>
          <a
            href="https://wa.me/919942089120?text=I%20want%20to%20order"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.212 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Start Shopping
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

import { Link } from 'react-router-dom';
import { Star, ExternalLink } from 'lucide-react';

// Google Business Profile review link ("Ask for reviews" in the dashboard).
const GOOGLE_REVIEW_LINK = 'https://g.page/r/Caa1t0LPjd8YEBM/review';

export default function ReviewPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-cream-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
        <img
          src="/logo.jpeg"
          alt="Order Kaaro logo"
          className="w-20 h-20 rounded-2xl object-cover mx-auto mb-6 shadow-md"
        />

        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Thank you!
        </h1>
        <p className="text-lg text-gray-700 mb-1">Order Kaaro se order karne ke liye dhanyavaad.</p>
        <p className="text-gray-600 mb-8">
          Your honest feedback helps other families in Kishanganj find us, and helps us get better.
        </p>

        <div className="flex justify-center gap-1 mb-8" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-8 h-8 text-accent-400" />
          ))}
        </div>

        <a
          href={GOOGLE_REVIEW_LINK}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-lg transition-colors"
        >
          Write a review on Google
          <ExternalLink className="w-5 h-5" aria-hidden="true" />
        </a>

        <Link
          to="/"
          className="inline-block mt-6 text-primary-700 font-medium hover:underline"
        >
          Back to shopping
        </Link>
      </div>
    </main>
  );
}

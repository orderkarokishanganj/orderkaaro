import { useState, useEffect, useRef } from 'react';
import { Star, Copy, ExternalLink, CheckCircle2 } from 'lucide-react';

// You will need to replace this link with your actual Google Maps Review link.
// You can get this from your Google Business Profile dashboard ("Ask for reviews" button).
const GOOGLE_REVIEW_LINK = "https://g.page/r/Caa1t0LPjd8YEBM/review";

const PRE_GENERATED_REVIEWS = {
  5: [
    "Absolutely fantastic service! Exceeded all my expectations.",
    "Highly recommended! The staff was incredibly friendly and professional.",
    "Great experience from start to finish. I will definitely be coming back!",
    "Exceptional quality and support. I couldn't be happier with my visit.",
    "Five stars aren't enough! Everything was handled perfectly and efficiently."
  ],
  4: [
    "Good service overall, just a few minor hiccups along the way.",
    "Solid experience. The quality is great, but slightly pricey.",
    "Very friendly staff and good environment. Mostly satisfied!",
    "Great job generally, but there is always a little room for improvement.",
    "I enjoyed my visit. Everything was up to standard."
  ],
  3: [
    "It was an okay experience. Nothing special, but not bad either.",
    "Average service. It met my basic expectations.",
    "Decent experience, but I feel like it could be a bit better.",
    "Service was acceptable. Nothing to write home about.",
    "Standard quality. I might consider returning in the future."
  ],
  2: [
    "Below average experience. I was expecting much better.",
    "Not very satisfied with the service today. Quite disappointed.",
    "Had a few frustrating issues that really need addressing.",
    "The quality was lacking compared to what was promised.",
    "Needs significant improvement in customer handling and speed."
  ],
  1: [
    "Terrible experience. I would not recommend this to anyone.",
    "Very unprofessional behavior from the staff. Completely unacceptable.",
    "Worst experience I've had in a long time. Please improve your standards.",
    "I am extremely disappointed. Will definitely not be returning.",
    "Save your time and money. The service here is awful."
  ]
};

// New Animated Mascot Component
const GlowingStarMascot = () => (
  <div className="relative flex justify-center items-center mb-4 mt-6">
    {/* Glow behind star */}
    <div className="absolute inset-0 bg-blue-500 rounded-full blur-[60px] opacity-40 animate-pulse"></div>
    
    {/* Floating container */}
    <div className="relative animate-[float_4s_ease-in-out_infinite]">
      <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" /> {/* purple-500 */}
            <stop offset="50%" stopColor="#3b82f6" /> {/* blue-500 */}
            <stop offset="100%" stopColor="#ec4899" /> {/* pink-500 */}
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Main Star Body */}
        <path d="M50 8 L62 36 L92 36 L68 54 L76 84 L50 66 L24 84 L32 54 L8 36 L38 36 Z" fill="url(#starGrad)" filter="url(#glow)"/>
        
        {/* Animated Sparkles around the star */}
        <path d="M15 20 L18 28 L26 31 L18 34 L15 42 L12 34 L4 31 L12 28 Z" fill="#fff" opacity="0.8" className="animate-[twinkle_3s_ease-in-out_infinite]"/>
        <path d="M85 70 L87 75 L92 77 L87 79 L85 84 L83 79 L78 77 L83 75 Z" fill="#fff" opacity="0.6" className="animate-[twinkle_4s_ease-in-out_infinite_1s]"/>
        <path d="M75 15 L76.5 20 L81.5 21.5 L76.5 23 L75 28 L73.5 23 L68.5 21.5 L73.5 20 Z" fill="#fff" opacity="0.9" className="animate-[twinkle_2.5s_ease-in-out_infinite_0.5s]"/>
        
        {/* Eyes */}
        <circle cx="42" cy="46" r="4.5" fill="#1e1e2f" />
        <circle cx="43" cy="45" r="1.5" fill="#ffffff" /> {/* Eye reflection */}
        
        {/* Winking Eye */}
        <path d="M56 46 Q 61 41 66 46" stroke="#1e1e2f" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        
        {/* Smile */}
        <path d="M45 56 Q 50 63 56 56" stroke="#1e1e2f" strokeWidth="3" strokeLinecap="round" fill="none" />
        
        {/* Cheeks */}
        <circle cx="36" cy="53" r="4" fill="#fda4af" opacity="0.7"/>
        <circle cx="66" cy="53" r="4" fill="#fda4af" opacity="0.7"/>
      </svg>
    </div>
  </div>
);

export default function ReviewGeneratorPage() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const textAreaRef = useRef(null);

  // When a user selects a rating, clear the text box so they can pick a new suggestion
  useEffect(() => {
    if (rating > 0 && !PRE_GENERATED_REVIEWS[rating as keyof typeof PRE_GENERATED_REVIEWS].includes(reviewText)) {
      setReviewText("");
    }
  }, [rating]);

  const handleSuggestionClick = (suggestion: string) => {
    setReviewText(suggestion);
  };

  const handleSubmit = () => {
    if (!reviewText.trim()) return;

    // Use document.execCommand('copy') as a reliable fallback for iFrames/mobile
    const hiddenTextArea = document.createElement("textarea");
    hiddenTextArea.value = reviewText;
    document.body.appendChild(hiddenTextArea);
    hiddenTextArea.select();
    
    try {
      document.execCommand('copy');
      setIsRedirecting(true);
      
      // Give the user a moment to see the success state before redirecting
      setTimeout(() => {
        window.location.href = GOOGLE_REVIEW_LINK;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
      // Proceed with redirect anyway if copy fails
      setIsRedirecting(true);
      setTimeout(() => {
        window.location.href = GOOGLE_REVIEW_LINK;
      }, 2000);
    } finally {
      document.body.removeChild(hiddenTextArea);
    }
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden">
        {/* Cosmic Success Background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[100px]"></div>
        
        <CheckCircle2 className="w-24 h-24 text-green-400 mb-6 animate-bounce relative z-10 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-4 relative z-10">
          Review Copied!
        </h2>
        
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 max-w-md relative z-10 shadow-2xl">
          <p className="text-lg text-gray-200">
            Taking you to Google Maps now. <br/><br/>
            <strong className="text-white bg-white/10 px-2 py-1 rounded border border-white/10">Just paste the text</strong> we copied for you into the Google review box!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden text-white selection:bg-indigo-500/30">
      
      {/* Custom CSS for Animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}
      </style>

      {/* Cosmic Background Nebula Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[40%] left-[20%] w-[20%] h-[20%] rounded-full bg-blue-500/10 blur-[80px] pointer-events-none"></div>

      {/* Frosted Glassmorphism Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] w-full max-w-lg overflow-hidden transition-all duration-300 relative z-10">
        
        {/* Header section with Mascot */}
        <div className="p-8 pb-4 text-center">
          <GlowingStarMascot />
          <h1 className="text-3xl font-bold mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200">
            RATE YOUR EXPERIENCE
          </h1>
          <p className="text-indigo-200/80 text-sm max-w-[250px] mx-auto leading-relaxed">
            How did we make you feel today? Your feedback helps us shine.
          </p>
        </div>

        <div className="p-6 pt-2">
          {/* Star Rating System */}
          <div className="flex justify-center space-x-2 sm:space-x-3 mb-8">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = star <= (hoveredRating || rating);
              return (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-all duration-300 transform hover:scale-110 active:scale-90 relative"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  {/* Intense glow behind active stars */}
                  {isActive && (
                    <div className="absolute inset-0 bg-yellow-400/30 blur-md rounded-full"></div>
                  )}
                  <Star
                    className={`relative z-10 w-10 h-10 sm:w-12 sm:h-12 transition-all duration-300 ${
                      isActive
                        ? 'fill-yellow-300 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]'
                        : 'text-white/20 hover:text-white/40'
                    }`}
                    strokeWidth={isActive ? 1 : 1.5}
                  />
                </button>
              );
            })}
          </div>

          {rating === 0 && (
            <p className="text-center text-white/40 text-sm animate-pulse pb-4">
              Select a star rating to begin.
            </p>
          )}

          {rating > 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out pb-2">
              
              {/* Suggestions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px bg-white/20 flex-grow"></div>
                  <p className="text-xs font-semibold text-indigo-200/70 uppercase tracking-wider">
                    Quick Select
                  </p>
                  <div className="h-px bg-white/20 flex-grow"></div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {PRE_GENERATED_REVIEWS[rating as keyof typeof PRE_GENERATED_REVIEWS].map((suggestion: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`text-left text-sm sm:text-base p-3.5 rounded-xl border transition-all duration-300 ${
                        reviewText === suggestion
                          ? 'bg-indigo-500/30 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Area */}
              <div>
                <textarea
                  ref={textAreaRef}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us more about your experience..."
                  className="w-full h-32 p-4 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-none text-white placeholder-gray-500 shadow-inner transition-all duration-300"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!reviewText.trim()}
                className={`group relative w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all duration-300 overflow-hidden ${
                  reviewText.trim()
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5'
                    : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                }`}
              >
                {/* Shine animation for active button */}
                {reviewText.trim() && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
                )}
                <span className="relative z-10">Post Review on Google</span>
                <Copy className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
                <ExternalLink className="w-4 h-4 ml-1 relative z-10 opacity-70" />
              </button>
              
              <p className="text-xs text-center text-indigo-200/50 mt-2 font-medium">
                Clicking this will copy your text and redirect you.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
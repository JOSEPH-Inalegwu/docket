'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  Gauge, 
  Bell, 
  Zap, 
  TrendingUp,
  Download,
} from 'lucide-react';
import { Button } from '../ui/button';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefit: string;
  image: string;
}

const features: Feature[] = [
  {
    icon: <Gauge className="w-6 h-6" />,
    title: 'Real-Time Unified Dashboard',
    description: 'Stop toggling between 8 different tabs. See your entire business in one place—revenue, ad spend, customer satisfaction, and operational health updating every 5 minutes.',
    benefit: 'Save 30+ minutes daily',
    image: '/images/Dashboard-metrics.jpeg'
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: 'Smart Threshold Alerts',
    description: 'Set custom alerts for what matters to your business. Get notified via Slack, email, or SMS when payment rates drop below 95%, response times exceed 2 hours, or ROAS falls under your target.',
    benefit: 'Catch issues before customers complain',
    image: '/images/Alert Screen.jpeg'
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'One-Click Integrations',
    description: 'Connect Shopify, Stripe, Facebook Ads, Google Analytics, Gorgias, and 10+ platforms in under 5 minutes. Secure OAuth authentication—no API keys, no developer needed.',
    benefit: 'Setup in minutes, not days',
    image: '/images/Connected Interface.jpeg'
  },
  {
    icon: <Download className="w-6 h-6" />,
    title: 'Automated Reports & Exports',
    description: 'Schedule daily, weekly, or monthly reports sent directly to your inbox. Export data as CSV or PDF for presentations, accounting, or deeper analysis.',
    benefit: 'Never manually compile reports again',
    image: '/images/Email Mockup.jpeg'
  }
];

function FeatureCard({ feature, index, isLeft }: { feature: Feature; index: number; isLeft: boolean }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`
        grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
      `}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Text Content */}
      <div className={`${isLeft ? 'lg:order-1' : 'lg:order-2'} space-y-6`}>
        {/* Icon Badge */}
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#6c47ff]/10 rounded-xl text-[#6c47ff] group-hover:scale-110 transition-transform">
          {feature.icon}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[1.5rem] sm:text-[1.75rem] md:text-[2rem] lg:text-[2.25rem] leading-snug md:leading-[1.2] text-[rgb(60,60,63)] mb-3 sm:mb-4">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-lg text-gray-600 leading-relaxed">
          {feature.description}
        </p>

        {/* Benefit Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-700 font-medium text-sm">
            {feature.benefit}
          </span>
        </div>
      </div>

      {/* Image/Visual */}
      <div className={`${isLeft ? 'lg:order-2' : 'lg:order-1'} relative group`}>
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-100 transform group-hover:scale-105 transition-transform duration-300">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#6c47ff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
          
          {/* Placeholder Image */}
          <img 
            src={feature.image} 
            alt={feature.title}
            className="w-full h-auto"
          />
          
          {/* Floating Badge */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg z-20">
            <span className="text-sm font-semibold text-[#6c47ff]">Live Demo</span>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#6c47ff]/5 rounded-full blur-3xl -z-10" />
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section 
      className="py-20 px-4 bg-white"
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#6c47ff]/10 text-[#6c47ff] rounded-full text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" />
           <p>POWERFUL FEATURES</p>
          </div>
          
          <h2 
            id="features-heading"
            className="font-bold text-[1.75rem] sm:text-[2.25rem] md:text-[2.75rem] lg:text-[3rem] leading-tight md:leading-[1.15] text-[rgb(19,19,22)] mb-4 sm:mb-6 px-4"
          >
            Everything You Need to{' '}
            <span className="text-[#6c47ff] relative">
              Run Smarter
              <svg
                className="absolute -bottom-2 left-0 w-full h-3"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2 9C50 3 150 3 198 9"
                  stroke="#6c47ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.3"
                />
              </svg>
            </span>
          </h2>
          
          <p className="text-xl text-gray-600">
            Built for busy ecommerce founders who need clarity, not complexity. 
            Monitor what matters, act on what's urgent, and scale with confidence.
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-32">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              feature={feature} 
              index={index}
              isLeft={index % 2 === 0}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 bg-gradient-to-r from-[#6c47ff]/5 to-purple-50 rounded-2xl border border-[#6c47ff]/20">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white" />
              ))}
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Join 500+ ecommerce brands</p>
              <p className="text-sm text-gray-600">who monitor their business with Statify</p>
            </div>

            <Button variant={'gradient'} aria-label='Start your free trial'>
              Start Free Trial
            </Button>
            
          </div>
        </div>
      </div>
    </section>
  );
}
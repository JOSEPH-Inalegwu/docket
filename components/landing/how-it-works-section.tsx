'use client';

import { useEffect, useRef, useState } from 'react';
import { Link2, BarChart3, Bell, Zap } from 'lucide-react';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Connect Your Business Stack',
    description: 'Link Shopify, Stripe, Facebook Ads, Google Analytics, and customer support tools with secure OAuth authentication. No developer needed—just click to authorize each platform.',
    icon: <Link2 className="w-6 h-6" />,
    highlight: '5-minute setup'
  },
  {
    number: '02',
    title: 'Automated Data Collection',
    description: 'Statify continuously syncs sales, ad spend, conversion rates, customer tickets, and payment metrics from all connected platforms. Data updates every 5 minutes so you always see current performance.',
    icon: <BarChart3 className="w-6 h-6" />,
    highlight: 'Real-time sync'
  },
  {
    number: '03',
    title: 'Smart Threshold Alerts',
    description: 'Set custom thresholds for key metrics like payment success rate (<95%), response time (>2hrs), or ROAS (<2.5x). Get instant Slack/email alerts when something needs attention before it becomes a crisis.',
    icon: <Bell className="w-6 h-6" />,
    highlight: 'Catch issues early'
  },
  {
    number: '04',
    title: 'Unified Business Dashboard',
    description: 'View revenue, ad performance, customer satisfaction, and operational health in one screen. Compare today vs yesterday, spot trends, and make data-driven decisions without toggling between 8+ tabs.',
    icon: <Zap className="w-6 h-6" />,
    highlight: 'One source of truth'
  }
];

function StepCard({ step, index }: { step: Step; index: number }) {
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
        relative group
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Connecting Line with Animated Tick */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-16 left-[calc(50%+2rem)] w-[calc(100%-2rem)] h-0.5">
          {/* Static Line */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#6c47ff]/30 to-transparent" />
          
          {/* Animated Blue Tick */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#6c47ff] rounded-full shadow-lg"
            style={{
              animation: `moveTick 2s ease-in-out infinite`,
              animationDelay: `${index * 0.3}s`
            }}
          />
        </div>
      )}

      <div className="relative bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-[#6c47ff]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* Number Badge */}
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#6c47ff] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
          {step.number}
        </div>

        {/* Icon Container */}
        <div className="mb-6 sm:mb-6 w-10 h-10 sm:w-12 sm:h-12 bg-[#6c47ff]/10 rounded-xl flex items-center justify-center text-[#6c47ff] group-hover:scale-110 group-hover:bg-[#6c47ff] group-hover:text-white transition-all duration-300">
          {step.icon}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {step.title}
        </h3>
        
        <p className="text-gray-600 leading-relaxed mb-4">
          {step.description}
        </p>

        {/* Highlight Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6c47ff]/5 text-[#6c47ff] rounded-full text-sm font-medium">
          <span className="w-1.5 h-1.5 bg-[#6c47ff] rounded-full animate-pulse" />
          {step.highlight}
        </div>
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section 
      className="py-20 px-2 bg-gradient-to-b from-white to-gray-50"
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 
            id="how-it-works-heading"
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
          >
            Get Started in{' '}
            <span className="text-[#6c47ff] relative">
              Minutes
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
            From signup to unified dashboard in under 5 minutes. No technical knowledge required.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
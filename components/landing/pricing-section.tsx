'use client';

import { useState } from 'react';
import { Check, X, Zap, Crown, Building2 } from 'lucide-react';

interface PricingTier {
  name: string;
  icon: React.ReactNode;
  price: {
    monthly: number;
    annual: number;
  };
  description: string;
  features: string[];
  limitations?: string[];
  cta: string;
  popular?: boolean;
  highlight?: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Freemium',
    icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />,
    price: {
      monthly: 0,
      annual: 0
    },
    description: 'Perfect for getting started and exploring Statify',
    features: [
      '2 platform integration',
      'Basic dashboard view',
      'Daily data refresh',
      '7-day data history',
      'Email support',
      'Up to 3 custom alerts'
    ],
    limitations: [
      'No team collaboration',
      'No automated reports',
      'Limited integrations'
    ],
    cta: 'Start Free',
    highlight: 'No credit card required'
  },
  {
    name: 'Pro',
    icon: <Crown className="w-5 h-5 sm:w-6 sm:h-6" />,
    price: {
      monthly: 49,
      annual: 39
    },
    description: 'For growing businesses that need real-time insights',
    features: [
      'Unlimited integrations',
      'Real-time dashboard (5min refresh)',
      '90-day data history',
      'Unlimited custom alerts',
      'Slack + Email + SMS notifications',
      'Automated daily/weekly reports',
      'Custom date range comparisons',
      'Priority support',
      'Export to CSV/PDF'
    ],
    cta: 'Start 14-Day Trial',
    popular: true,
    highlight: 'Most popular'
  },
  {
    name: 'Enterprise',
    icon: <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />,
    price: {
      monthly: 0,
      annual: 0
    },
    description: 'For large teams with advanced needs',
    features: [
      'Everything in Pro',
      'Unlimited data history',
      'Advanced role permissions',
      'Custom integrations via API',
      'Dedicated success manager',
      'SLA guarantee (99.9% uptime)',
      'Custom data retention policies',
      'Priority feature requests',
      'White-label options',
      'SOC 2 compliance support'
    ],
    cta: 'Contact Sales',
    highlight: 'Custom pricing'
  }
];

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section 
      className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-b from-gray-50 to-white"
      aria-labelledby="pricing-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 lg:mb-12">
          <h2 
            id="pricing-heading"
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
          >
            Simple, Transparent{' '}
            <span className="text-[#6c47ff] relative inline-block">
              Pricing
              <svg
                className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-3"
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
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8">
            Start free, upgrade when you're ready. No hidden fees.
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="inline-flex items-center gap-2 sm:gap-4 p-1 bg-gray-100 rounded-full">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-medium transition-all ${
                !isAnnual 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-medium transition-all ${
                isAnnual 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="ml-1 sm:ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto py-6 sm:py-8 lg:py-12">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`
                relative p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl bg-white
                ${tier.popular 
                  ? 'border-[#6c47ff] shadow-lg lg:scale-105' 
                  : 'border-gray-200 hover:border-[#6c47ff]/50'
                }
              `}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 bg-[#6c47ff] text-white px-3 sm:px-4 py-1 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap">
                  {tier.highlight}
                </div>
              )}

              {/* Icon & Name */}
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className={`
                  p-2 rounded-lg 
                  ${tier.popular ? 'bg-[#6c47ff] text-white' : 'bg-gray-100 text-gray-700'}
                `}>
                  {tier.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{tier.name}</h3>
              </div>

              {/* Price */}
              <div className="mb-4 sm:mb-6">
                {tier.price.monthly === 0 && tier.price.annual === 0 ? (
                  <div>
                    {tier.name === 'Freemium' ? (
                      <div className="text-4xl sm:text-5xl font-bold text-gray-900">$0</div>
                    ) : (
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">Custom</div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-bold text-gray-900">
                        ${isAnnual ? tier.price.annual : tier.price.monthly}
                      </span>
                      <span className="text-sm sm:text-base text-gray-600">/month</span>
                    </div>
                    {isAnnual && tier.price.monthly > 0 && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Billed ${tier.price.annual * 12}/year
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{tier.description}</p>

              {/* CTA Button */}
              <button
                className={`
                  w-full py-2 sm:py-3 lg:py-4 text-base sm:text-lg font-semibold rounded-lg transition-all mb-6 sm:mb-8
                  ${tier.popular 
                    ? 'bg-[#6c47ff] hover:bg-[#5a3de6] text-white shadow-lg' 
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }
                `}
              >
                {tier.cta}
              </button>

              {/* Highlight */}
              {tier.highlight && !tier.popular && (
                <p className="text-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                  {tier.highlight}
                </p>
              )}

              {/* Features */}
              <div className="space-y-2 sm:space-y-3">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-xs sm:text-sm">{feature}</span>
                  </div>
                ))}
                
                {/* Limitations */}
                {tier.limitations && (
                  <div className="pt-3 sm:pt-4 border-t border-gray-200 mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                    {tier.limitations.map((limitation) => (
                      <div key={limitation} className="flex items-start gap-2 sm:gap-3 opacity-50">
                        <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500 text-xs sm:text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Teaser */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-sm sm:text-base text-gray-600 mb-2">
            Have questions about our pricing?
          </p>
          <button className="text-sm sm:text-base text-[#6c47ff] font-semibold hover:underline">
            View FAQ →
          </button>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 opacity-60">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">14-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}
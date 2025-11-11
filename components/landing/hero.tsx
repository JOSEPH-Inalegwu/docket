import Link from 'next/link'
import Image from 'next/image'
import { SignUpButton } from '@clerk/nextjs'

export default function Hero() {
  return (
    <section 
      className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 text-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background gradient decoration */}
      <div 
        className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-100 via-white to-white"
        aria-hidden="true"
      ></div>
      
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
        <span className="flex h-2 w-2 rounded-full bg-purple-600" aria-hidden="true"></span>
        <span>Now in Beta - Limited Spots Available</span>
      </div>

      <h1 
        id="hero-heading"
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-4"
      >
        Your Entire Shopify Store. <br />
        <span className="text-[#6c47ff]">One Dashboard</span>
      </h1>
      
      <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
        A unified dashboard for Shopify owners tired of juggling Shopify, Stripe, Facebook Ads, and Gorgias.
      </p>
      
      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4">
        <SignUpButton mode="modal">
          <button 
            className="w-full sm:w-auto bg-[#6c47ff] text-white rounded-full font-semibold text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 hover:bg-[#5a3ad1] transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
            aria-label="Start your free trial"
          >
            Start Free Trial
          </button>
        </SignUpButton>
        
        <button 
          className="w-full sm:w-auto border-2 border-[#6c47ff] text-[#6c47ff] rounded-full font-semibold text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 hover:bg-purple-50 transition-all active:scale-95 cursor-pointer"
          aria-label="Watch product demonstration"
        >
          Watch Demo
        </button>
      </div>

      {/* Dashboard Preview */}
      <div className="max-w-5xl mx-auto px-4 mb-12 sm:mb-16">
        <div className="rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl border border-gray-200 overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50">
          <Image 
            src="/images/Hero-Dashboard.jpeg"
            alt="Unified Shopify dashboard showing analytics, integrations with Stripe, Facebook Ads, and Gorgias customer support"
            width={1200}
            height={675}
            className="object-cover w-full h-auto"
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
          />
        </div>
      </div>

      {/* Integration Logos */}
      <div className="mt-12 sm:mt-16 px-4">
        <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          Integrates with your favorite tools
        </p>
        <div 
          className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 flex-wrap opacity-60 grayscale"
          role="list"
          aria-label="Integration partners"
        >
          <span className="text-lg sm:text-xl md:text-2xl font-bold" role="listitem">Shopify</span>
          <span className="text-lg sm:text-xl md:text-2xl font-bold" role="listitem">Stripe</span>
          <span className="text-lg sm:text-xl md:text-2xl font-bold" role="listitem">Facebook</span>
          <span className="text-lg sm:text-xl md:text-2xl font-bold" role="listitem">Gorgias</span>
        </div>
      </div> 
    </section>
  )
}
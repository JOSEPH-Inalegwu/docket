import Link from 'next/link'
import Image from 'next/image'
import { SignUpButton } from '@clerk/nextjs'

export default function Hero() {
  return (
    <section className="relative container mx-auto px-4 py-20 text-center overflow-hidden">
      {/* Background gradient decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-50 via-white to-white"></div>
      
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
        <span className="flex h-2 w-2 rounded-full bg-purple-600"></span>
        Now in Beta - Limited Spots Available
      </div>

      <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
        Your Entire Shopify Store. <br />
        <span className="text-[#6c47ff]">One Dashboard</span>
      </h1>
      
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        A unified dashboard for Shopify owners tired of juggling Shopify, Stripe, Facebook Ads, and Gorgias.
      </p>
      
      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <SignUpButton mode="modal">
          <button className="bg-[#6c47ff] text-white rounded-full font-semibold text-lg h-14 px-8 hover:bg-[#5a3ad1] transition-all shadow-lg hover:shadow-xl hover:scale-105">
            Start Free Trial
          </button>
        </SignUpButton>
        
        <button className="border-2 border-[#6c47ff] text-[#6c47ff] rounded-full font-semibold text-lg h-14 px-8 hover:bg-[#6c47ff] hover:text-white transition-all">
          Watch Demo
        </button>
      </div>

      {/* Trust Badge */}
      <p className="text-sm text-gray-500 mb-16">
        ✓ 14-day free trial · No credit card required · Cancel anytime
      </p>

      {/* Dashboard Preview */}
      <div className="max-w-5xl mx-auto">
        <div className="rounded-xl shadow-2xl border border-gray-200 overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 aspect-video flex items-center justify-center">
          <Image 
            src="/images/Hero-Dashboard.jpeg"
            alt="Dashboard Preview"
            width={1200}
            height={675}
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Integration Logos */}
      <div className="mt-16">
        <p className="text-sm text-gray-500 mb-6">Integrates with your favorite tools</p>
        <div className="flex items-center justify-center gap-8 flex-wrap opacity-60 grayscale">
          <span className="text-2xl font-bold">Shopify</span>
          <span className="text-2xl font-bold">Stripe</span>
          <span className="text-2xl font-bold">Facebook</span>
          <span className="text-2xl font-bold">Gorgias</span>
        </div>
      </div>
    </section>
  )
}
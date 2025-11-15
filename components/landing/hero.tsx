import Link from 'next/link'
import Image from 'next/image'
import { SignUpButton } from '@clerk/nextjs'
import { Button } from '../ui/button'
// import BrandIntegrations from '../ui/brands'
import FooterLogoIntegration from '../ui/footer-logo-integration'

export default function Hero() {
  return (
    <section id='home'
      className="relative mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 md:py-16 lg:py-18 text-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background gradient decoration */}
      <div 
        className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-100 via-white to-white"
        aria-hidden="true"
      ></div>
      
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gray-50 shadow-sm text-purple-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
        <span className="flex h-2 w-2 rounded-full bg-purple-600" aria-hidden="true"></span>
        <span>Now in Beta - Limited Spots Available</span>
      </div>

      <h1 
        id="hero-heading"
        className="font-bold text-[2rem] sm:text-[2.75rem] md:text-[3.5rem] lg:text-[4rem] leading-tight md:leading-[1.1] text-[rgb(19,19,22)] mb-4 sm:mb-6 px-4 text-center"
      >
        All Your Business Tools. <br />
        <span className="text-[#6c47ff]">One Dashboard</span>
      </h1>
      
      <p className="text-base font-normal sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
        A unified dashboard for online businesses tired of juggling Shopify, Stripe, Meta Ads, Slack, and Gorgias.
      </p>
      
      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4">
        <SignUpButton mode="modal">

          <Button variant={'gradient'} aria-label='Start your free trial'>
            Start for Free
          </Button>
        </SignUpButton>
        
        <Button variant={'outline'} aria-label="Watch product demonstration">
          Watch Demo
        </Button>
      </div>

      {/* Dashboard Preview */}
      <div className="max-w-5xl mx-auto px-4 mb-12 sm:mb-16">
        <div className="rounded-lg sm:rounded-xl shadow-xl sm:shadow-2xl border border-gray-200 overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50">
          <Image 
            src="/images/Dashboard-img.jpeg"
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
      {/* <BrandIntegrations /> */}
      <FooterLogoIntegration showBorder={false} />
    </section>
  )
}
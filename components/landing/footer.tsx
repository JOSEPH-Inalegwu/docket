import Link from 'next/link'
import Image from 'next/image'
import { Globe, Twitter, Linkedin, Github, Mail } from 'lucide-react'
import FooterLogoIntegration from '@/components/ui/footer-logo-integration'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-white">Statify</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your unified dashboard for e-commerce. Connect all your business tools in one place and get real-time insights.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4 pt-2">
              <a 
                href="https://x.com/JosephOnTech" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#6c47ff] transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://josephjonah.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#6c47ff] transition-colors"
                aria-label="Facebook"
              >
                <Globe className="w-5 h-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/inalegwu-joseph-jonah" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#6c47ff] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/JOSEPH-Inalegwu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#6c47ff] transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#features" className="text-sm hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-sm hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-sm hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  // target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Support Us ☕
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:josephjonahinalegwu@gmail.com" 
                  className="text-sm hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <Mail className="w-4 h-4" />
                  Email Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Integration Logos */}
        <FooterLogoIntegration showBorder={true} />

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-gray-500">
              © {currentYear} Statify. All rights reserved. Built with ❤️ for e-commerce owners.
            </p>
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="/privacy" className="text-xs sm:text-sm text-gray-500 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs sm:text-sm text-gray-500 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="text-xs sm:text-sm text-gray-500 hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
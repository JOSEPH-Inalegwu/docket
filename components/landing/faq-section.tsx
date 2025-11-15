'use client';
import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { SignInButton } from "@clerk/nextjs";

export default function FaqSection() {
  const [openTab, setOpenTab] = useState<number | null>(null);

  const toggleTab = (idx: number) => {
    setOpenTab(openTab === idx ? null : idx);
  };

  const faqData = [
    {
      id: 1,
      question: "What is Statify?",
      answer:
        "Statify is a unified dashboard that connects your e-commerce platforms, payment processors, marketing tools, and customer support systems into one real-time view. Whether you're using Shopify, WooCommerce, Stripe, Meta Ads, or Gorgias, stop switching between 8+ tabs and get the insights you need instantly.",
    },
    {
      id: 2,
      question: "Is Statify really free?",
      answer:
        "Yes! Statify is completely free to use for all e-commerce businesses. I built this to solve a real problem for online store owners who were drowning in dashboards. Since maintaining API integrations and server infrastructure has ongoing costs, I'd appreciate support through Buy Me a Coffee to keep the service reliable and fast.",
    },
    {
      id: 3,
      question: "Which platforms does Statify integrate with?",
      answer:
        "Statify connects with popular e-commerce platforms (Shopify, WooCommerce, BigCommerce), payment processors (Stripe, PayPal), marketing tools (Meta Ads, Facebook Ads, Google Ads), communication platforms (Slack, Gorgias), and more. All integrations pull real-time data from your connected accounts—no manual data entry required.",
    },
    {
      id: 4,
      question: "How often is my data refreshed?",
      answer:
        "Your dashboard data refreshes automatically every 5 minutes for near real-time insights. You can also manually refresh any section at any time. Historical data is retained for up to 90 days, giving you the ability to track trends, compare performance, and make data-driven decisions for your business.",
    },
    {
      id: 5,
      question: "Can I set up custom alerts and notifications?",
      answer:
        "Absolutely! Create custom alerts for sales milestones, inventory thresholds, payment issues, ad budget limits, or customer support ticket volumes. Get notified via email when something important happens, so you can respond quickly without constantly checking multiple dashboards.",
    },
    {
      id: 6,
      question: "How secure is my data?",
      answer:
        "Data security is paramount. Statify uses industry-standard OAuth 2.0 authentication, end-to-end encrypted connections (TLS 1.3), and never stores sensitive information like payment details or customer passwords. All integrations are read-only by default, meaning Statify can view your data but cannot make changes to your accounts without explicit permission.",
    },
  ];

  return (
    <section id="faq"
    className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <div className="max-w-7xl px-4 sm:px-6 md:px-8 py-16 mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="font-bold text-[1.75rem] sm:text-[2.25rem] md:text-[2.75rem] lg:text-[3rem] leading-tight md:leading-[1.15] text-[rgb(19,19,22)] mb-4 sm:mb-6 px-4">
            Frequently Asked <span className="text-[#6c47ff] relative inline-block">
              Questions
              <svg
                className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-3 animate-in fade-in duration-1000 delay-300"
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
          <p className="text-base sm:text-lg opacity-70 max-w-2xl mx-auto">
            Everything you need to know about connecting your e-commerce tools.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid gap-6 md:gap-8 md:grid-cols-2">
          <div className="space-y-6">
            {faqData.slice(0, 3).map((item, idx) => (
              <div 
                key={item.id}
                className="animate-in fade-in slide-in-from-left-4 duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <Collapsible
                  open={openTab === item.id}
                  onOpenChange={() => toggleTab(item.id)}
                >
                  <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-xl bg-white border border-gray-200 p-5 text-left font-semibold hover:border-[#6c47ff]/30 hover:shadow-md transition-all duration-300">
                    <span className="text-[rgb(60,60,63)] group-hover:text-[#6c47ff] transition-colors">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-500 flex-shrink-0 ml-4 transition-all duration-300 ${
                        openTab === item.id ? "rotate-180 text-[#6c47ff]" : "group-hover:text-[#6c47ff]"
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-5 pt-4 pb-2 text-gray-600 leading-relaxed animate-in slide-in-from-top-2 duration-300">
                    {item.answer}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {faqData.slice(3).map((item, idx) => (
              <div 
                key={item.id}
                className="animate-in fade-in slide-in-from-right-4 duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <Collapsible
                  open={openTab === item.id}
                  onOpenChange={() => toggleTab(item.id)}
                >
                  <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-xl bg-white border border-gray-200 p-5 text-left font-semibold hover:border-[#6c47ff]/30 hover:shadow-md transition-all duration-300">
                    <span className="text-[rgb(60,60,63)] group-hover:text-[#6c47ff] transition-colors">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-500 flex-shrink-0 ml-4 transition-all duration-300 ${
                        openTab === item.id ? "rotate-180 text-[#6c47ff]" : "group-hover:text-[#6c47ff]"
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-5 pt-4 pb-2 text-gray-600 leading-relaxed animate-in slide-in-from-top-2 duration-300">
                    {item.answer}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="text-center mt-16 p-8 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 delay-500">
          <h3 className="text-2xl font-bold mb-4 text-[rgb(60,60,63)]">
            Still have questions?
          </h3>
          <p className="opacity-70 mb-6 text-base sm:text-lg">
            Can't find what you're looking for? Start using Statify for free or help keep the APIs running.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
          <SignInButton mode="modal">
              <Button variant={'gradient'} aria-label='Start for free'>
              Get Started Free
            </Button>
          </SignInButton>
           
            <Button variant="outline" aria-label="Support Statify to help keep APIs running">
              <span className="inline-block group-hover:scale-105 transition-transform">
                Help Keep APIs Running ☕
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Purple Curved Wave at the bottom */}
      <div className="w-full overflow-hidden">
        <svg
          className="w-full h-40 md:h-48"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#6c47ff"
            fillOpacity="1"
            d="M0,160L60,181.3C120,203,240,245,360,250.7C480,256,600,224,720,229.3C840,235,960,277,1080,256C1200,235,1320,149,1380,106.7L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
}
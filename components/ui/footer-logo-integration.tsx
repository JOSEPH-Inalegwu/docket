import React from "react";
import { SiShopify, SiStripe, SiMeta, SiSlack,  SiGoogleanalytics,
  SiMailchimp, } from "react-icons/si";
import { FaMoneyBillWave } from "react-icons/fa";
import { RiBankCard2Fill } from "react-icons/ri";

interface Integration {
  name: string;
  icon: React.ReactNode;
}

const integrations: Integration[] = [
  { name: "Shopify", icon: <SiShopify className="w-6 h-6 text-gray-400" /> },
  { name: "Stripe", icon: <SiStripe className="w-6 h-6 text-gray-400" /> },
  { name: "PayStack", icon: <FaMoneyBillWave className="w-6 h-6 text-gray-400" /> },
  { name: "Flutterwave", icon: <RiBankCard2Fill className="w-6 h-6 text-gray-400" /> },
  { name: "Meta", icon: <SiMeta className="w-6 h-6 text-gray-400" /> },
  { name: "Slack", icon: <SiSlack className="w-6 h-6 text-gray-400" /> },
  { name: "Google Analytics", icon: <SiGoogleanalytics className="w-6 h-6 text-gray-400" /> },
  { name: "Mailchimp", icon: <SiMailchimp className="w-6 h-6 text-gray-400" /> },
];

export default function FooterLogoIntegration() {
  return (
    <div className="py-8 border-t border-gray-800">
      <p className="text-xs text-gray-500 text-center mb-4">
        Trusted integrations with leading platforms
      </p>

      <div className="flex items-center justify-center gap-6 sm:gap-8 flex-wrap opacity-60 hover:opacity-90 transition-opacity">
        {integrations.map(({ name, icon }) => (
          <div
            key={name}
            className="flex items-center gap-2 hover:text-[#6c47ff] transition-colors"
          >
            {icon}
            <span className="text-xs">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

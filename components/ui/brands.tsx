import Image from "next/image"

interface Integration {
  name: string
  src: string
  alt: string
  withLabel?: boolean
  labelStyle?: string
}

const integrations: Integration[] = [
  {
    name: "Shopify",
    src: "/images/logos/shopify.svg",
    alt: "Shopify",
    withLabel: true,
    labelStyle: "text-gray-500 italic",
  },
  {
    name: "Stripe",
    src: "/images/logos/stripe.svg",
    alt: "Stripe",
  },
  {
    name: "Facebook",
    src: "/images/logos/facebook.svg",
    alt: "Facebook",
  },
  {
    name: "Gorgias",
    src: "/images/logos/gorgias.png",
    alt: "Gorgias",
    withLabel: true,
    labelStyle: "text-gray-500",
  },
]

export default function BrandIntegrations() {
  return (
    <section className="mt-12 sm:mt-16 px-4">
      <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 text-center font-medium">
        Integrates with your favorite tools
      </p>

      <div
        className="flex items-center justify-center gap-6 sm:gap-8 md:gap-12 flex-wrap"
        role="list"
        aria-label="Integration partners"
      >
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className={`flex items-center gap-1.5 ${integration.withLabel ? "flex-row" : ""}`}
            role="listitem"
          >
            <Image
              src={integration.src}
              alt={integration.alt}
              className="h-8 sm:h-10 md:h-12 w-auto transition-all duration-300"
              width={100}
              height={40}
            />
            {integration.withLabel && (
              <p
                className={`text-sm sm:text-xl font-bold ${integration.labelStyle || "text-gray-600"}`}
              >
                {integration.name}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

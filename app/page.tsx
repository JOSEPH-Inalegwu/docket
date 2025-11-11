import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Hero from "@/components/landing/hero";
import LandingNavbar from '@/components/navigation/landing-navbar'


export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main>
        <LandingNavbar />
        <Hero />
    </main>
  );
}

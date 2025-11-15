import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import DashboardNavbar from '@/components/navigation/dashboard-navbar'
import { ThemeProvider } from '@/components/providers/theme-provider'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
        <DashboardNavbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </ThemeProvider>
  )
}

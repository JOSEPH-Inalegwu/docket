import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import DashboardNavbar from '@/components/navigation/dashboard-navbar'
import DashboardSidebar from './dashboard/sidebar/dashboard-sidebar'
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
        
        {/* Sidebar + Main Content Layout */}
        <div className="flex">
          <DashboardSidebar />
          
          <main className="flex-1 lg:ml-64 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
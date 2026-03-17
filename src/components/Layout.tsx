import { Outlet } from 'react-router-dom'
import { AppHeader } from './layout/AppHeader'
import { AppSidebar } from './layout/AppSidebar'
import { AppFooter } from './layout/AppFooter'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col w-full min-h-screen bg-background">
        <AppHeader />
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  )
}

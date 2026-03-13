import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Calculator, Settings, Package2, FolderOpen, Table2 } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useMainStore } from '@/stores/main'

export function AppSidebar() {
  const location = useLocation()
  const { activeProjectId } = useMainStore()

  const navItems = [
    { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    { title: 'Meus Projetos', url: '/projetos', icon: FolderOpen },
    ...(activeProjectId
      ? [{ title: 'Precificação Atual', url: '/precificacao', icon: Table2 }]
      : []),
    { title: 'Simulador', url: '/simulador', icon: Calculator },
    { title: 'Configurações', url: '/configuracoes', icon: Settings },
  ]

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Package2 className="size-4" />
          </div>
          <span className="truncate">Precificação Inteligente</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

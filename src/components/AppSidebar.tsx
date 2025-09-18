import { Home, Tv, Film } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import rcclLogo from "@/assets/rccl-logo.png"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Live Channels", url: "/channels", icon: Tv },
  { title: "Video on Demand", url: "/vod", icon: Film },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/"
    }
    return currentPath.startsWith(path)
  }

  const getNavClassName = (path: string) => {
    const active = isActive(path)
    return `flex items-center w-full text-left transition-all duration-200 ${
      active 
        ? "bg-primary text-primary-foreground shadow-glow font-medium" 
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    }`
  }

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="bg-sidebar">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border bg-gradient-to-r from-sidebar-background to-sidebar-accent/50">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-professional border border-primary/20">
                <img 
                  src={rcclLogo} 
                  alt="Royal Caribbean Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                <Tv className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-xl font-bold text-sidebar-foreground bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                    IPTV Control
                  </h2>
                  <div className="w-2 h-2 bg-gradient-primary rounded-full animate-pulse"></div>
                </div>
                <p className="text-sm font-medium text-primary/80 tracking-wide">Royal Caribbean</p>
                <div className="w-full h-0.5 bg-gradient-to-r from-primary/50 via-primary to-transparent rounded-full mt-2"></div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup className="flex-1 p-4">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            {!isCollapsed && "Navigation"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                    >
                      <div className="flex items-center px-3 py-2.5 rounded-lg w-full">
                        <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">{item.title}</span>}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
              RC
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-sidebar-foreground">Admin User</p>
                <p className="text-xs text-muted-foreground">System Administrator</p>
              </div>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
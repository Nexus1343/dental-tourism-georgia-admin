'use client'

import { useState } from "react"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

export function MainLayout({ children, className }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      {/* Fixed Header */}
      <Header 
        onMenuToggle={toggleSidebar} 
        showMobileMenu={true}
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Fixed Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar}
        />
        
        {/* Scrollable Main content */}
        <main 
          className={cn(
            "flex-1 overflow-y-auto md:ml-0",
            className
          )}
        >
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 
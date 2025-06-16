'use client'

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Building2, 
  BarChart3, 
  Settings, 
  Users,
  Eye,
  Plus,
  FolderOpen,
  UserCog,
  Stethoscope,
  Package,
  HelpCircle,
  MessageSquare
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  className?: string
  isOpen?: boolean
  onClose?: () => void
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    badge: null
  },
  {
    name: 'Templates',
    href: '/admin/templates',
    icon: FileText,
    badge: null,
    children: [
      { name: 'All Templates', href: '/admin/templates', icon: FolderOpen },
      { name: 'Create New', href: '/admin/templates/create', icon: Plus },
    ]
  },
  {
    name: 'Clinics',
    href: '/admin/clinics',
    icon: Building2,
    badge: null
  },
  {
    name: 'Doctors',
    href: '/admin/doctors',
    icon: UserCog,
    badge: null,
    children: [
      { name: 'All Doctors', href: '/admin/doctors', icon: FolderOpen },
      { name: 'Create New', href: '/admin/doctors/create', icon: Plus },
    ]
  },
  {
    name: 'Treatments',
    href: '/admin/treatments',
    icon: Stethoscope,
    badge: null,
    children: [
      { name: 'All Treatments', href: '/admin/treatments', icon: FolderOpen },
      { name: 'Create New', href: '/admin/treatments/create', icon: Plus },
    ]
  },
  {
    name: 'Treatment Packages',
    href: '/admin/treatment-packages',
    icon: Package,
    badge: null,
    children: [
      { name: 'All Packages', href: '/admin/treatment-packages', icon: FolderOpen },
      { name: 'Create New', href: '/admin/treatment-packages/create', icon: Plus },
    ]
  },
  {
    name: 'FAQs',
    href: '/admin/faqs',
    icon: HelpCircle,
    badge: null,
    children: [
      { name: 'All FAQs', href: '/admin/faqs', icon: FolderOpen },
      { name: 'Create New', href: '/admin/faqs/create', icon: Plus },
    ]
  },
  {
    name: 'Patient Reviews',
    href: '/admin/patient-reviews',
    icon: MessageSquare,
    badge: null,
    children: [
      { name: 'All Reviews', href: '/admin/patient-reviews', icon: FolderOpen },
      { name: 'Add Review', href: '/admin/patient-reviews/create', icon: Plus },
    ]
  },
  {
    name: 'Preview',
    href: '/admin/preview',
    icon: Eye,
    badge: null
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    badge: 'New'
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    badge: null,
    children: [
      { name: 'All Users', href: '/admin/users', icon: FolderOpen },
      { name: 'Create User', href: '/admin/users/create', icon: Plus },
    ]
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    badge: null
  }
]

export function Sidebar({ className, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 transform border-r bg-background transition-transform duration-200 ease-in-out md:relative md:top-0 md:h-full md:translate-x-0 md:flex-shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.children && item.children.some(child => pathname === child.href))
              
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                  
                  {/* Sub-navigation */}
                  {item.children && isActive && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                            pathname === child.href
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          <child.icon className="h-3 w-3" />
                          <span>{child.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4 flex-shrink-0">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-medium">DT</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Dental Tourism</p>
                <p className="text-xs text-muted-foreground truncate">Admin Panel v1.0</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
} 
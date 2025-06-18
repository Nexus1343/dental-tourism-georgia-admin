'use client'

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Building2, 
  BarChart3, 
  Users,
  UserCog,
  Stethoscope,
  Package,
  HelpCircle,
  MessageSquare,
  BookOpen,
  ImageIcon,
  ClipboardList
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
    badge: null
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
    badge: null
  },
  {
    name: 'Treatments',
    href: '/admin/treatments',
    icon: Stethoscope,
    badge: null
  },
  {
    name: 'Treatment Packages',
    href: '/admin/treatment-packages',
    icon: Package,
    badge: null
  },
  {
    name: 'FAQs',
    href: '/admin/faqs',
    icon: HelpCircle,
    badge: null
  },
  {
    name: 'Patient Reviews',
    href: '/admin/patient-reviews',
    icon: MessageSquare,
    badge: null
  },
  {
    name: 'Submissions',
    href: '/admin/questionnaire-submissions',
    icon: ClipboardList,
    badge: null
  },
  {
    name: 'Blog Posts',
    href: '/admin/blog-posts',
    icon: BookOpen,
    badge: null
  },
  {
    name: 'Before & After Cases',
    href: '/admin/before-after-cases',
    icon: ImageIcon,
    badge: null
  },

  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
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
              const isActive = pathname === item.href
              
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
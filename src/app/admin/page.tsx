'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { 
  FileText, 
  Building2, 
  BarChart3, 
  Plus, 
  Eye, 
  Shield,
  UserCog,
  Stethoscope,
  Package,
  HelpCircle,
  MessageSquare,
  BookOpen,
  ImageIcon,
  Users,
  Clock,
  Star,
  TrendingUp,
  Activity,
  Settings
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

interface DashboardStats {
  totalSubmissions: number
  completedSubmissions: number
  completionRate: number
  entities: {
    templates: { total: number; active: number; inactive: number }
    clinics: { total: number; active: number; inactive: number; pending: number }
    doctors: { total: number; active: number; inactive: number }
    treatments: { total: number; active: number; inactive: number }
    treatmentPackages: { total: number; active: number; inactive: number }
    faqs: { total: number; active: number; inactive: number }
    reviews: { total: number; active: number; inactive: number; averageRating: number }
    blogPosts: { total: number; published: number; draft: number }
    beforeAfterCases: { total: number; active: number; inactive: number }
    users: { total: number; active: number; inactive: number; superAdmins: number; clinicAdmins: number }
  }
  recentActivity: Array<{
    id: string
    type: string
    title: string
    timestamp: string
  }>
  growth: {
    submissions: string
    templates: string
    clinics: string
  }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/dashboard/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard statistics')
        }
        const result = await response.json()
        setStats(result.data)
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError('Failed to load dashboard statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" message="Loading dashboard statistics..." />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">{error || 'Failed to load dashboard'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-lg font-semibold text-primary">
              Welcome, {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'Super Administrator'}!
            </h2>
            <p className="text-sm text-muted-foreground">
              You are logged in as a Super Administrator with full system access.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center space-x-3">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Primary Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.growth.submissions} from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Templates
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.entities.templates.active}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.entities.templates.total} total templates
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Clinics
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.entities.clinics.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.growth.clinics} from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedSubmissions} of {stats.totalSubmissions} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entity Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Templates
            </CardTitle>
            <CardDescription>
              Questionnaire templates management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">{stats.entities.templates.total}</span>
              <div className="flex gap-2">
                <Badge variant="outline">{stats.entities.templates.active} Active</Badge>
                {stats.entities.templates.inactive > 0 && (
                  <Badge variant="secondary">{stats.entities.templates.inactive} Inactive</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <Link href="/admin/templates/create">
                  <Plus className="h-4 w-4 mr-1" />
                  Create
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin/templates">View All</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clinics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Clinics
            </CardTitle>
            <CardDescription>
              Clinic management and assignments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">{stats.entities.clinics.total}</span>
              <div className="flex gap-2">
                <Badge variant="outline">{stats.entities.clinics.active} Active</Badge>
                {stats.entities.clinics.pending > 0 && (
                  <Badge variant="secondary">{stats.entities.clinics.pending} Pending</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin/clinics">
                  <Settings className="h-4 w-4 mr-1" />
                  Manage
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Doctors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Doctors
            </CardTitle>
            <CardDescription>
              Doctor profiles and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">{stats.entities.doctors.total}</span>
              <Badge variant="outline">{stats.entities.doctors.active} Active</Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <Link href="/admin/doctors/create">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Doctor
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin/doctors">View All</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Treatments & Packages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Treatments & Packages
            </CardTitle>
            <CardDescription>
              Treatment options and packages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Treatments</span>
                <span className="font-semibold">{stats.entities.treatments.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Packages</span>
                <span className="font-semibold">{stats.entities.treatmentPackages.total}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <Link href="/admin/treatments/create">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Treatment
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin/treatments">View All</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Content
            </CardTitle>
            <CardDescription>
              FAQs, Blog Posts, Before & After cases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">FAQs</span>
                <span className="font-semibold">{stats.entities.faqs.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Blog Posts</span>
                <span className="font-semibold">{stats.entities.blogPosts.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Before & After</span>
                <span className="font-semibold">{stats.entities.beforeAfterCases.total}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <Link href="/admin/faqs/create">
                  <Plus className="h-4 w-4 mr-1" />
                  Add FAQ
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin/blog-posts">Blog</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reviews & Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Reviews & Submissions
            </CardTitle>
            <CardDescription>
              Patient feedback and questionnaire data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Reviews</span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{stats.entities.reviews.total}</span>
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs">{stats.entities.reviews.averageRating}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Submissions</span>
                <span className="font-semibold">{stats.totalSubmissions}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <Link href="/admin/patient-reviews/create">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Review
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin/questionnaire-submissions">Submissions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Users */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest system activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground">
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              System users and administrators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Users</span>
                <span className="font-semibold">{stats.entities.users.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Super Admins</span>
                <span className="font-semibold">{stats.entities.users.superAdmins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Clinic Admins</span>
                <span className="font-semibold">{stats.entities.users.clinicAdmins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active</span>
                <Badge variant="outline">{stats.entities.users.active}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <Link href="/admin/users/create">
                  <Plus className="h-4 w-4 mr-1" />
                  Add User
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

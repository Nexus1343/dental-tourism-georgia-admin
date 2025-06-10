'use client'

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Send,
  History,
  Bell,
  Settings,
  Filter,
  Search,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye
} from "lucide-react"

interface QuestionnaireTemplate {
  id: string
  name: string
  description: string
  version: string
  total_pages: number
  total_questions: number
  estimated_time: number
  language: string
  status: 'active' | 'draft' | 'inactive'
  created_at: string
  updated_at: string
}

interface TemplateAssignment {
  id: string
  template_id: string
  template: QuestionnaireTemplate
  clinic_id: string
  effective_from: string
  effective_until: string | null
  is_default: boolean
  status: 'active' | 'pending' | 'expired' | 'cancelled'
  assigned_by: string
  assigned_at: string
  activated_at: string | null
  total_responses: number
  completion_rate: number
  customizations: {
    custom_intro: string | null
    custom_completion: string | null
    modified_questions: number
    custom_branding: boolean
  }
}

interface AssignmentHistory {
  id: string
  action: 'assigned' | 'activated' | 'deactivated' | 'modified' | 'removed'
  template_id: string
  template_name: string
  performed_by: string
  performed_at: string
  details: string
  status: 'success' | 'failed' | 'pending'
}

// Mock data
const mockTemplates: QuestionnaireTemplate[] = [
  {
    id: "1",
    name: "Basic Dental Consultation",
    description: "Standard questionnaire for initial dental assessment",
    version: "2.1",
    total_pages: 5,
    total_questions: 24,
    estimated_time: 10,
    language: "English",
    status: "active",
    created_at: "2024-01-15T09:00:00Z",
    updated_at: "2024-11-20T14:30:00Z"
  },
  {
    id: "2", 
    name: "Orthodontic Evaluation",
    description: "Comprehensive questionnaire for orthodontic treatment planning",
    version: "1.5",
    total_pages: 8,
    total_questions: 35,
    estimated_time: 15,
    language: "English",
    status: "active",
    created_at: "2024-02-10T11:30:00Z",
    updated_at: "2024-12-01T16:45:00Z"
  },
  {
    id: "3",
    name: "Cosmetic Consultation",
    description: "Specialized questionnaire for cosmetic dental procedures",
    version: "3.0",
    total_pages: 6,
    total_questions: 28,
    estimated_time: 12,
    language: "English",
    status: "active",
    created_at: "2024-03-05T13:45:00Z",
    updated_at: "2024-12-10T09:15:00Z"
  }
]

const mockAssignments: TemplateAssignment[] = [
  {
    id: "1",
    template_id: "1",
    template: mockTemplates[0],
    clinic_id: "1",
    effective_from: "2024-01-20T00:00:00Z",
    effective_until: null,
    is_default: true,
    status: "active",
    assigned_by: "Admin User",
    assigned_at: "2024-01-20T10:30:00Z",
    activated_at: "2024-01-20T10:30:00Z",
    total_responses: 147,
    completion_rate: 89,
    customizations: {
      custom_intro: "Welcome to Smile Perfect Dental Clinic",
      custom_completion: null,
      modified_questions: 3,
      custom_branding: true
    }
  },
  {
    id: "2",
    template_id: "2", 
    template: mockTemplates[1],
    clinic_id: "1",
    effective_from: "2024-03-01T00:00:00Z",
    effective_until: "2024-12-31T23:59:59Z",
    is_default: false,
    status: "active",
    assigned_by: "Admin User",
    assigned_at: "2024-02-28T15:20:00Z",
    activated_at: "2024-03-01T00:00:00Z",
    total_responses: 56,
    completion_rate: 92,
    customizations: {
      custom_intro: null,
      custom_completion: "Thank you for choosing our orthodontic services",
      modified_questions: 1,
      custom_branding: false
    }
  },
  {
    id: "3",
    template_id: "3",
    template: mockTemplates[2],
    clinic_id: "1", 
    effective_from: "2024-12-20T00:00:00Z",
    effective_until: null,
    is_default: false,
    status: "pending",
    assigned_by: "Admin User",
    assigned_at: "2024-12-15T11:45:00Z",
    activated_at: null,
    total_responses: 0,
    completion_rate: 0,
    customizations: {
      custom_intro: null,
      custom_completion: null,
      modified_questions: 0,
      custom_branding: false
    }
  }
]

const mockHistory: AssignmentHistory[] = [
  {
    id: "1",
    action: "assigned",
    template_id: "3",
    template_name: "Cosmetic Consultation",
    performed_by: "Admin User",
    performed_at: "2024-12-15T11:45:00Z",
    details: "Template assigned with activation date 2024-12-20",
    status: "success"
  },
  {
    id: "2",
    action: "modified",
    template_id: "2",
    template_name: "Orthodontic Evaluation",
    performed_by: "Clinic Manager",
    performed_at: "2024-12-10T14:20:00Z",
    details: "Updated completion message and branding settings",
    status: "success"
  },
  {
    id: "3",
    action: "activated",
    template_id: "2", 
    template_name: "Orthodontic Evaluation",
    performed_by: "Admin User",
    performed_at: "2024-03-01T00:00:00Z",
    details: "Template automatically activated on scheduled date",
    status: "success"
  }
]

export default function ClinicAssignmentsPage() {
  const params = useParams()
  const router = useRouter()
  const clinicId = params.id as string

  const [assignments, setAssignments] = useState<TemplateAssignment[]>(mockAssignments)
  const [templates, setTemplates] = useState<QuestionnaireTemplate[]>(mockTemplates)
  const [history, setHistory] = useState<AssignmentHistory[]>(mockHistory)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Mock clinic data
  const clinicName = "Smile Perfect Dental Clinic"

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'expired': return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />
      case 'pending': return <Clock className="h-3 w-3" />
      case 'expired': return <XCircle className="h-3 w-3" />
      case 'cancelled': return <XCircle className="h-3 w-3" />
      default: return null
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'assigned': return 'text-blue-600'
      case 'activated': return 'text-green-600'
      case 'deactivated': return 'text-red-600'
      case 'modified': return 'text-purple-600'
      case 'removed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const availableTemplates = templates.filter(template => 
    !assignments.some(assignment => assignment.template_id === template.id && assignment.status !== 'cancelled')
  )

  const handleAssignTemplate = (templateId: string, effectiveFrom: string, effectiveUntil: string | null, isDefault: boolean) => {
    // TODO: Implement actual assignment logic
    console.log('Assigning template:', { templateId, effectiveFrom, effectiveUntil, isDefault })
    setShowAssignDialog(false)
  }

  const handleBulkAssign = () => {
    // TODO: Implement bulk assignment logic
    console.log('Bulk assigning templates:', selectedTemplates)
    setShowBulkDialog(false)
    setSelectedTemplates([])
  }

  const handleDeactivateAssignment = (assignmentId: string) => {
    // TODO: Implement deactivation logic
    console.log('Deactivating assignment:', assignmentId)
  }

  const handleCustomizeAssignment = (assignmentId: string) => {
    // TODO: Navigate to customization page
            router.push(`/admin/clinics/${clinicId}/assignments/${assignmentId}/customize`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Template Assignments</h1>
            <p className="text-gray-600 mt-1">
              Manage questionnaire templates for {clinicName}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowBulkDialog(true)}>
            <Users className="mr-2 h-4 w-4" />
            Bulk Assign
          </Button>
          <Button onClick={() => setShowAssignDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Assign Template
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{assignments.length}</div>
                <div className="text-sm text-gray-600">Total Assignments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {assignments.filter(a => a.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Active Templates</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">
                  {assignments.filter(a => a.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending Activation</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {assignments.reduce((sum, a) => sum + a.total_responses, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Responses</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assignments">Current Assignments</TabsTrigger>
          <TabsTrigger value="history">Assignment History</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Templates</CardTitle>
              <CardDescription>
                Currently assigned questionnaire templates and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Effective Period</TableHead>
                    <TableHead>Responses</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>Customizations</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{assignment.template.name}</div>
                          <div className="text-sm text-gray-600">
                            v{assignment.template.version} • {assignment.template.total_questions} questions
                            {assignment.is_default && (
                              <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                                Default
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(assignment.status)}`}>
                          {getStatusIcon(assignment.status)}
                          <span className="ml-1 capitalize">{assignment.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>From: {new Date(assignment.effective_from).toLocaleDateString()}</div>
                          <div>
                            Until: {assignment.effective_until 
                              ? new Date(assignment.effective_until).toLocaleDateString()
                              : 'Indefinite'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{assignment.total_responses}</div>
                          <div className="text-xs text-gray-600">responses</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{assignment.completion_rate}%</div>
                          <div className="text-xs text-gray-600">completion</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {assignment.customizations.modified_questions > 0 && (
                            <div>{assignment.customizations.modified_questions} questions modified</div>
                          )}
                          {assignment.customizations.custom_intro && (
                            <div>Custom intro message</div>
                          )}
                          {assignment.customizations.custom_branding && (
                            <div>Custom branding</div>
                          )}
                          {assignment.customizations.modified_questions === 0 && 
                           !assignment.customizations.custom_intro && 
                           !assignment.customizations.custom_branding && (
                            <span className="text-gray-400">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCustomizeAssignment(assignment.id)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeactivateAssignment(assignment.id)}
                            disabled={assignment.status !== 'active'}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment History</CardTitle>
              <CardDescription>
                Complete history of template assignment actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-lg ${getActionColor(item.action)} bg-opacity-10`}>
                      <History className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium capitalize ${getActionColor(item.action)}`}>
                          {item.action}
                        </span>
                        <span className="text-gray-900">{item.template_name}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {item.details}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        By {item.performed_by} on {new Date(item.performed_at).toLocaleString()}
                      </div>
                    </div>
                    <Badge className={
                      item.status === 'success' ? 'bg-green-100 text-green-800 border-green-200' :
                      item.status === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                      'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Notifications</CardTitle>
              <CardDescription>
                Configure notifications for assignment status changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">New Assignment Notifications</div>
                    <div className="text-sm text-gray-600">
                      Notify when new templates are assigned
                    </div>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Activation Reminders</div>
                    <div className="text-sm text-gray-600">
                      Remind before template activation dates
                    </div>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Expiration Alerts</div>
                    <div className="text-sm text-gray-600">
                      Alert when templates are about to expire
                    </div>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Single Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Template</DialogTitle>
            <DialogDescription>
              Assign a questionnaire template to this clinic
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Template</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {availableTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} (v{template.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Effective From</Label>
                <Input type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label>Effective Until (Optional)</Label>
                <Input type="datetime-local" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="is_default" className="rounded" />
              <Label htmlFor="is_default">Set as default template for this clinic</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Assign Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Assignment Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bulk Template Assignment</DialogTitle>
            <DialogDescription>
              Assign multiple templates at once with the same settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Templates</Label>
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {availableTemplates.map((template) => (
                  <div key={template.id} className="flex items-center space-x-2 p-2 border rounded">
                    <input
                      type="checkbox"
                      id={`bulk-${template.id}`}
                      checked={selectedTemplates.includes(template.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTemplates([...selectedTemplates, template.id])
                        } else {
                          setSelectedTemplates(selectedTemplates.filter(id => id !== template.id))
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={`bulk-${template.id}`} className="flex-1">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-600">
                        v{template.version} • {template.total_questions} questions
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Effective From</Label>
                <Input type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label>Effective Until (Optional)</Label>
                <Input type="datetime-local" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAssign} disabled={selectedTemplates.length === 0}>
              <Users className="mr-2 h-4 w-4" />
              Assign {selectedTemplates.length} Templates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
# Frontend-Database Integration Implementation Plan

## Overview
The admin panel questionnaire template system is currently using mock data in the frontend. This document outlines the plan to connect the frontend to the Supabase database for real data operations including displaying, creating, updating, and deleting questionnaire templates.

## Current State Analysis

### Frontend Implementation
- **Framework**: Next.js 15 with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: Local state with useState hooks
- **Data**: Currently using mock data arrays
- **Database Client**: Supabase client configured but not actively used

### Database Schema
The database has a comprehensive schema with these key tables:
- `questionnaire_templates` - Main template data
- `questionnaire_pages` - Template pages structure
- `questionnaire_questions` - Individual questions within templates
- `clinic_questionnaire_templates` - Template assignments to clinics
- `questionnaire_submissions` - Patient submissions (future use)

### Key Pages Analysis
1. **Templates List** (`/admin/templates`) - Shows all templates with filtering
2. **Template Detail** (`/admin/templates/[id]`) - Template overview with stats and management
3. **Template Editor** (`/admin/templates/[id]/edit`) - Comprehensive template builder
4. **Create Template** (`/admin/templates/create`) - New template creation

## Implementation Plan

### Phase 1: Core Data Integration (Templates CRUD)

#### 1.1 Update Templates List Page
- **File**: `src/app/admin/templates/page.tsx`
- **Changes**:
  - Replace mock data with real API calls using `QuestionnaireTemplateService.getAll()`
  - Implement real search, filtering, and pagination
  - Add proper loading states and error handling
  - Connect delete and duplicate operations to database

#### 1.2 Update Template Detail Page
- **File**: `src/app/admin/templates/[id]/page.tsx`
- **Changes**:
  - Replace mock data with `QuestionnaireTemplateService.getById()`
  - Implement real statistics calculation from database
  - Connect status toggle to database
  - Add real template deletion functionality

#### 1.3 Create API Route Handlers
- **New Files**:
  - `src/app/api/templates/route.ts` - GET all templates, POST new template
  - `src/app/api/templates/[id]/route.ts` - GET, PUT, DELETE specific template
  - `src/app/api/templates/[id]/stats/route.ts` - GET template statistics

#### 1.4 Update Create Template Page
- **File**: `src/app/admin/templates/create/page.tsx`
- **Changes**:
  - Connect form submission to database using `QuestionnaireTemplateService.create()`
  - Add proper form validation and error handling
  - Redirect to edit page after successful creation

### Phase 2: Template Builder Integration

#### 2.1 Update Template Editor
- **File**: `src/app/admin/templates/[id]/edit/page.tsx`
- **Changes**:
  - Load real template data with pages and questions
  - Implement save operations for all template components
  - Add real-time saving functionality
  - Connect page and question CRUD operations

#### 2.2 Pages Management
- **Services**: Use `QuestionnairePageService` methods
- **Operations**:
  - Create new pages
  - Update page properties
  - Delete pages
  - Reorder pages

#### 2.3 Questions Management
- **Services**: Use `QuestionnaireQuestionService` methods
- **Operations**:
  - Create new questions
  - Update question properties
  - Delete questions
  - Reorder questions within pages

### Phase 3: Advanced Features

#### 3.1 Template Statistics
- **Implementation**:
  - Real submission counts and completion rates
  - Performance analytics from actual data
  - Drop-off analysis from submission data

#### 3.2 Clinic Assignment
- **Files**: Template detail and management pages
- **Features**:
  - Assign templates to clinics
  - Manage template customizations per clinic
  - View clinic-specific template usage

#### 3.3 Template Versioning
- **Implementation**:
  - Handle template versioning
  - Compare versions
  - Rollback functionality

### Phase 4: Data Validation and Error Handling

#### 4.1 Form Validation
- **Tools**: Zod schemas for validation
- **Implementation**:
  - Client-side validation
  - Server-side validation
  - User-friendly error messages

#### 4.2 Error Handling
- **Features**:
  - Global error boundaries
  - Toast notifications for operations
  - Retry mechanisms for failed operations

#### 4.3 Loading States
- **Implementation**:
  - Skeleton loaders for data fetching
  - Progress indicators for operations
  - Optimistic updates where appropriate

## Technical Implementation Details

### API Routes Structure
```
/api/templates/
├── GET     - List templates with filtering/pagination
├── POST    - Create new template
├── [id]/
│   ├── GET     - Get template by ID
│   ├── PUT     - Update template
│   ├── DELETE  - Delete template
│   ├── duplicate/
│   │   └── POST - Duplicate template
│   ├── stats/
│   │   └── GET  - Get template statistics
│   ├── pages/
│   │   ├── GET     - Get template pages
│   │   ├── POST    - Create new page
│   │   └── [pageId]/
│   │       ├── PUT     - Update page
│   │       ├── DELETE  - Delete page
│   │       └── questions/
│   │           ├── GET     - Get page questions
│   │           ├── POST    - Create question
│   │           └── [questionId]/
│   │               ├── PUT     - Update question
│   │               └── DELETE  - Delete question
│   └── clinics/
│       ├── GET  - Get assigned clinics
│       └── POST - Assign to clinic
```

### Database Service Usage
```typescript
// Templates
QuestionnaireTemplateService.getAll(options)
QuestionnaireTemplateService.getById(id)
QuestionnaireTemplateService.create(data)
QuestionnaireTemplateService.update(id, data)
QuestionnaireTemplateService.delete(id)
QuestionnaireTemplateService.duplicate(id, newName)

// Pages
QuestionnairePageService.getByTemplateId(templateId)
QuestionnairePageService.create(data)
QuestionnairePageService.update(id, data)
QuestionnairePageService.delete(id)

// Questions
QuestionnaireQuestionService.getByTemplateId(templateId)
QuestionnaireQuestionService.create(data)
QuestionnaireQuestionService.update(id, data)
QuestionnaireQuestionService.delete(id)
```

### State Management Strategy
- Use React Query for server state management
- Implement optimistic updates for better UX
- Cache frequently accessed data
- Implement real-time updates where needed

### Error Handling Strategy
```typescript
// API Response wrapper
type ApiResponse<T> = {
  data?: T
  error?: string
  message?: string
}

// Error handling in components
const handleApiError = (error: Error) => {
  toast.error(error.message || "An unexpected error occurred")
  console.error("API Error:", error)
}
```

## Implementation Steps

### Step 1: Environment Setup
1. Verify Supabase environment variables
2. Test database connectivity
3. Verify existing service methods

### Step 2: Templates List Integration
1. Replace mock data in templates list page
2. Implement real filtering and search
3. Add proper error handling and loading states
4. Test CRUD operations

### Step 3: Template Detail Integration
1. Connect template detail page to database
2. Implement real statistics
3. Connect management operations
4. Add proper navigation

### Step 4: Template Editor Integration
1. Load real template structure
2. Implement page management
3. Implement question management
4. Add auto-save functionality

### Step 5: API Routes Implementation
1. Create all necessary API routes
2. Implement proper error handling
3. Add input validation
4. Test all endpoints

### Step 6: Advanced Features
1. Implement template statistics
2. Add clinic assignment features
3. Implement template versioning
4. Add export/import functionality

### Step 7: Testing and Optimization
1. Test all CRUD operations
2. Performance optimization
3. User experience improvements
4. Bug fixes and refinements

## Success Criteria

### Functional Requirements
- ✅ All template CRUD operations work with database
- ✅ Page and question management functional
- ✅ Filtering and search work with real data
- ✅ Template statistics display real data
- ✅ Error handling provides user feedback
- ✅ Loading states improve user experience
- ✅ Real template statistics from database data
- ✅ Clinic assignment management
- ✅ Template versioning system

### Performance Requirements
- ✅ Page load times under 2 seconds
- ✅ CRUD operations respond within 1 second
- ✅ Search results appear within 500ms
- ✅ Optimistic updates for better UX

### User Experience Requirements
- ✅ Intuitive error messages
- ✅ Smooth loading transitions
- ✅ Data persistence across sessions
- ✅ Real-time updates where appropriate

## Risk Mitigation

### Data Loss Prevention
- Implement data validation
- Add confirmation dialogs for destructive actions
- Implement backup mechanisms
- Add audit logging

### Performance Issues
- Implement pagination for large datasets
- Use database indexing for search operations
- Implement client-side caching
- Optimize query patterns

### User Experience Issues
- Add comprehensive loading states
- Implement error recovery mechanisms
- Provide clear user feedback
- Add undo functionality where possible

## Next Steps

1. **Immediate**: Start with Phase 1 - Core Data Integration
2. **Week 1**: Complete templates list and detail pages
3. **Week 2**: Implement template editor integration
4. **Week 3**: Add advanced features and optimization
5. **Week 4**: Testing, refinement, and deployment

This plan provides a comprehensive roadmap for connecting the frontend admin panel to the database while maintaining a good user experience and ensuring data integrity. 
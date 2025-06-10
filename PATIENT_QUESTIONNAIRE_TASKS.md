# Dental Tourism Patient Questionnaire Form Wizard - Task Breakdown

## Database Schema Analysis ✅

**Existing Tables for Patient Flow:**
- `questionnaire_templates`: Template metadata with introduction/completion messages
- `questionnaire_pages`: Multi-page structure with navigation and validation rules  
- `questionnaire_questions`: Questions with 18 different types, conditional logic, validation
- `questionnaire_submissions`: Main submission records (currently unused)
- `questionnaire_page_submissions`: Page-level submission data (currently unused)
- `patient_files`: File uploads linked to submissions (currently unused)
- `patient_leads`: Patient information storage
- `clinic_questionnaire_templates`: Template assignments to clinics

**Question Types Available:** text, textarea, email, phone, number, date, single_choice, multiple_choice, checkbox, file_upload, photo_upload, rating, slider, photo_grid, pain_scale, tooth_chart, budget_range, date_picker

---

## Phase 1: Project Structure & Navigation Setup ✅
### Task 1.1: Update Homepage Navigation ✅
- [x] Add "Questionnaire" card to main page alongside Patient Portal and Admin Dashboard
- [x] Design patient-focused card with appropriate icon (clipboard/form icon)
- [x] Add routing to `/questionnaire` with descriptive text:
  - "Complete your dental assessment"
  - "Fill out personalized questionnaires"
  - "Help us understand your needs"
- [x] Ensure responsive design matches existing cards
- [x] Add hover effects and proper accessibility

### Task 1.2: Create Questionnaire App Structure ✅
- [x] Create `src/app/questionnaire/` directory structure:
  ```
  questionnaire/
  ├── layout.tsx                 # Questionnaire-specific layout
  ├── page.tsx                   # Template selection page
  ├── [templateId]/             # Dynamic template routes
  │   ├── page.tsx              # Template introduction/start page
  │   ├── [pageNumber]/         # Dynamic page routes
  │   │   └── page.tsx          # Individual questionnaire page
  │   └── complete/             # Completion flow
  │       └── page.tsx          # Completion page
  └── components/               # Questionnaire-specific components
  ```
- [x] Create questionnaire-specific layout different from admin layout
- [x] Design patient-friendly navigation without admin complexity
- [x] Implement breadcrumb navigation for questionnaire flow
- [x] Add progress indicators and step tracking

### Task 1.3: Questionnaire Layout & Theme ✅
- [x] Create patient-focused layout component (`QuestionnaireLayout`)
- [x] Design clean, minimal header with progress indication
- [x] Remove admin-specific sidebar and complex navigation
- [x] Implement mobile-first responsive design
- [x] Add questionnaire-specific color scheme and typography
- [x] Create loading states and skeleton screens
- [x] Implement accessibility features (ARIA labels, focus management)

---

## Phase 2: Template Selection Interface ✅
### Task 2.1: Template Selection Dashboard ✅
- [x] Create main template selection page (`/questionnaire`)
- [x] Fetch active templates from `questionnaire_templates` table
- [x] Design patient-friendly template cards showing:
  - Template name and clear description
  - Estimated completion time with icon
  - Number of steps/pages indicator
  - Visual icons representing template type
  - "Start Questionnaire" call-to-action button
- [x] Implement search/filter functionality for templates
- [x] Add sorting options (time, complexity, type)
- [x] Show empty state when no templates available

### Task 2.2: Template Introduction Page ✅
- [x] Create template preview page (`/questionnaire/[templateId]`)
- [x] Display template introduction text from database
- [x] Show detailed template information:
  - What information will be collected
  - Estimated time breakdown by section
  - Privacy and data usage information
  - Requirements (photos, documents, etc.)
- [x] Add template progress preview/roadmap
- [x] Implement "Start Questionnaire" button with session initialization
- [x] Add "Back to Templates" navigation

### Task 2.3: Template Metadata & Preparation ✅
- [x] Create template data fetching API routes
- [x] Implement template validation (active, accessible)
- [x] Add template analytics tracking (views, starts)
- [x] Create template caching for performance
- [x] Handle template not found scenarios
- [x] Implement SEO optimization for template pages

---

## Phase 3: Session Management & State ✅
### Task 3.1: Submission Session Management ✅
- [x] Create submission tracking system using `questionnaire_submissions`
- [x] Generate unique submission tokens for anonymous users
- [x] Implement session state management with Zustand store:
  ```typescript
  interface QuestionnaireState {
    currentSubmission: QuestionnaireSubmission | null
    currentPage: number
    totalPages: number
    answers: Record<string, any>
    isDirty: boolean
    lastSaved: Date | null
  }
  ```
- [x] Handle session restoration on page reload
- [x] Implement session timeout management
- [x] Add session cleanup on completion/abandonment

### Task 3.2: Draft Saving & Recovery ✅
- [x] Implement auto-save functionality every 30 seconds
- [x] Create manual "Save Draft" functionality
- [x] Store draft data in `questionnaire_submissions` with `is_complete: false`
- [x] Handle draft recovery on session restoration
- [x] Show draft indicator in UI
- [x] Implement draft expiration policy
- [x] Add draft deletion functionality

### Task 3.3: Progress Tracking ✅
- [x] Calculate completion percentage based on answered questions
- [x] Track time spent per page and total time
- [x] Update `completion_percentage` and `time_spent_seconds` in database
- [x] Show visual progress indicators throughout flow
- [x] Implement page completion validation
- [x] Add estimated time remaining calculations

---

## Phase 4: Dynamic Form Renderer System ✅
### Task 4.1: Question Type Renderers ✅
- [x] Create base question component with common functionality
- [x] Implement renderers for core question types:
  - **Text/Textarea**: Input validation, character limits, placeholder ✅
  - **Email**: Format validation, real-time feedback ✅
  - **Phone**: Format validation (using text renderer) ✅
  - **Number**: Min/max validation, decimal handling ✅
  - **Single_choice/Multiple_choice**: Option rendering, other option handling ✅
  - **Checkbox**: Multi-select with validation (using choice renderer) ✅
  - **Pain_scale**: 0-10 scale with color coding and descriptions ✅
  - **Photo_upload**: Camera access, drag-drop, preview, validation ✅
  - **File_upload**: Document upload with type validation ✅
  - Date/Date_picker: Placeholder implementation ⏳
  - Rating/Slider/Tooth_chart/Budget_range: Placeholder implementation ⏳
- [x] Implement question help text and tooltips
- [x] Add question validation with real-time feedback

### Task 4.2: Conditional Logic Engine ✅
- [x] Create conditional logic processor for `conditional_logic` field
- [x] Implement show/hide logic based on previous answers
- [x] Handle value-based conditions with multiple operators
- [x] Support AND/OR condition combinations
- [x] Create logic validation and error handling
- [x] Add debugging mode for logic testing
- [x] Implement dependent question highlighting

### Task 4.3: Page-Level Form Management ✅
- [x] Create page form wrapper with validation
- [x] Implement page transition logic with validation checks
- [x] Handle required field validation before page navigation
- [x] Create form state persistence between pages
- [x] Add validation error summary per page
- [x] Implement page completion indicators
- [x] Handle form reset and field clearing

---

## Phase 5: Form Wizard Navigation ✅
### Task 5.1: Multi-Step Navigation System ✅
- [x] Create wizard navigation component with Next/Previous buttons
- [x] Implement page routing (`/questionnaire/[templateId]/[pageNumber]`)
- [x] Handle navigation validation (required fields, page completion)
- [x] Add navigation guards to prevent data loss
- [x] Implement breadcrumb navigation with clickable steps
- [x] Create mobile-optimized navigation controls
- [x] Add keyboard navigation support (Enter, Tab, Arrow keys)

### Task 5.2: Progress Indicators ✅
- [x] Create visual progress bar showing completion percentage
- [x] Implement step indicators with completed/current/upcoming states
- [x] Add page titles and descriptions to progress indicator
- [x] Show estimated time remaining
- [x] Create mobile-collapsed progress view
- [x] Add progress animations and transitions
- [x] Implement progress accessibility announcements

### Task 5.3: Navigation Features ✅
- [x] Implement "Save & Continue Later" functionality
- [x] Add "Back" navigation with data preservation
- [x] Create page jump navigation (for completed pages)
- [x] Handle browser back/forward button navigation
- [x] Add navigation confirmation dialogs for unsaved changes
- [x] Implement page skip logic based on conditions
- [x] Create emergency exit/cancel functionality

---

## Phase 6: File Upload & Photo Management ✅
### Task 6.1: File Upload System ✅
- [x] Integrate file upload using `patient_files` table
- [x] Implement drag-and-drop upload interface
- [x] Add file type validation and size limits
- [x] Create upload progress indicators
- [x] Handle multiple file uploads per question
- [x] Implement file preview with thumbnails
- [x] Add file removal and replacement functionality
- [x] Create upload error handling and retry mechanisms

### Task 6.2: Photo Upload Specialized System ✅
- [x] Create camera integration for mobile devices
- [x] Implement photo capture with preview
- [x] Add photo editing tools (crop, rotate, brightness) - Basic implementation
- [x] Create photo quality validation
- [x] Implement photo compression for optimal upload
- [x] Add photo annotation tools (if required) - Placeholder
- [x] Create photo categorization system
- [x] Handle photo retake functionality

### Task 6.3: Photo Grid & Dental Photography ✅
- [x] Implement photo grid layout for dental assessments
- [x] Create photo requirement guides and examples
- [x] Add photo angle guidance and overlay instructions
- [x] Implement photo validation for dental requirements
- [x] Create photo comparison tools (before/after) - Basic implementation
- [x] Add photo quality scoring and feedback - Basic implementation
- [x] Implement photo backup and cloud storage integration - Placeholder

---

## Phase 7: Validation & Error Handling
### Task 7.1: Real-time Validation System ⏳
- [ ] Implement client-side validation based on `validation_rules`
- [ ] Create real-time validation feedback (as user types)
- [ ] Handle server-side validation for security
- [ ] Add custom validation messages from database
- [ ] Implement cross-field validation (email confirmation, etc.)
- [ ] Create validation error highlighting and scrolling
- [ ] Add validation success indicators

### Task 7.2: Error Handling & Recovery ⏳
- [ ] Create graceful error handling for network issues
- [ ] Implement auto-retry mechanisms for failed requests
- [ ] Add offline mode detection and queuing
- [ ] Handle session timeout gracefully
- [ ] Create error boundary components
- [ ] Implement error reporting and logging
- [ ] Add user-friendly error messages and recovery actions

### Task 7.3: Data Loss Prevention ⏳
- [ ] Implement browser beforeunload warning for unsaved changes
- [ ] Create periodic auto-save with conflict resolution
- [ ] Add form data backup to localStorage
- [ ] Handle browser crashes and recovery
- [ ] Implement form state restoration on page reload
- [ ] Create data integrity validation
- [ ] Add change tracking and dirty state management

---

## Phase 8: Submission & Completion Flow
### Task 8.1: Pre-submission Review ⏳
- [ ] Create submission review page showing all answers
- [ ] Implement answer editing from review page
- [ ] Add completeness validation for required sections
- [ ] Show uploaded files and photos in review
- [ ] Create answer summary with section organization
- [ ] Add final validation before submission
- [ ] Implement review page navigation back to questions

### Task 8.2: Final Submission Process ⏳
- [ ] Create final submission API endpoint
- [ ] Update `questionnaire_submissions` with complete data
- [ ] Save page-level data to `questionnaire_page_submissions`
- [ ] Link uploaded files in `patient_files`
- [ ] Generate submission confirmation number
- [ ] Implement submission receipt generation
- [ ] Add submission timestamp and completion tracking

### Task 8.3: Completion & Thank You Flow ⏳
- [ ] Create completion page with confirmation details
- [ ] Show submission reference number
- [ ] Add download receipt/summary functionality
- [ ] Implement follow-up information display
- [ ] Create sharing options for submission confirmation
- [ ] Add next steps guidance
- [ ] Implement completion analytics tracking

---

## Phase 9: API & Data Integration
### Task 9.1: Questionnaire Data APIs ⏳
- [ ] Create API routes for template fetching (`/api/questionnaire/templates`)
- [ ] Implement template detail API (`/api/questionnaire/templates/[id]`)
- [ ] Create page data API (`/api/questionnaire/pages/[templateId]`)
- [ ] Implement question data API with conditional logic
- [ ] Add template availability validation
- [ ] Create API error handling and status codes
- [ ] Implement API rate limiting and security

### Task 9.2: Submission Management APIs ⏳
- [ ] Create submission initialization API (`/api/questionnaire/submissions`)
- [ ] Implement draft saving API (`/api/questionnaire/submissions/[id]/save`)
- [ ] Create page submission API (`/api/questionnaire/submissions/[id]/pages`)
- [ ] Implement final submission API (`/api/questionnaire/submissions/[id]/complete`)
- [ ] Add submission retrieval API for draft recovery
- [ ] Create submission validation API
- [ ] Implement submission analytics tracking

### Task 9.3: File Upload APIs ⏳
- [ ] Create file upload API (`/api/questionnaire/files/upload`)
- [ ] Implement file validation and processing
- [ ] Add file deletion API
- [ ] Create image optimization and compression
- [ ] Implement file storage (local/cloud) integration
- [ ] Add file metadata extraction
- [ ] Create file access control and security

---

## Phase 10: Performance & Optimization
### Task 10.1: Performance Optimization ⏳
- [ ] Implement lazy loading for large questionnaires
- [ ] Optimize image uploads and previews
- [ ] Add loading states and skeleton screens
- [ ] Implement caching strategies for template data
- [ ] Optimize bundle size with code splitting
- [ ] Add service worker for offline capabilities
- [ ] Create performance monitoring and metrics

### Task 10.2: Mobile Optimization ⏳
- [ ] Ensure full mobile responsiveness
- [ ] Optimize touch interactions and gestures
- [ ] Implement mobile-specific UI patterns
- [ ] Add mobile keyboard optimization
- [ ] Create mobile photo capture integration
- [ ] Optimize mobile performance and loading
- [ ] Add PWA capabilities for mobile app-like experience

### Task 10.3: Accessibility & UX ⏳
- [ ] Implement comprehensive ARIA labels and roles
- [ ] Add keyboard navigation throughout
- [ ] Create screen reader optimizations
- [ ] Implement focus management and visual focus indicators
- [ ] Add high contrast mode support
- [ ] Create text scaling compatibility
- [ ] Implement voice navigation support (where applicable)

---

## Phase 11: Testing & Quality Assurance
### Task 11.1: Component Testing ⏳
- [ ] Unit tests for all question type renderers
- [ ] Integration tests for form validation
- [ ] Testing for conditional logic scenarios
- [ ] File upload functionality testing
- [ ] Navigation and routing tests
- [ ] State management testing
- [ ] API endpoint testing

### Task 11.2: End-to-End Testing ⏳
- [ ] Complete questionnaire submission flow testing
- [ ] Multi-page navigation testing
- [ ] Draft saving and recovery testing
- [ ] File upload and photo capture testing
- [ ] Error handling and recovery testing
- [ ] Mobile device testing
- [ ] Cross-browser compatibility testing

### Task 11.3: Performance & Security Testing ⏳
- [ ] Load testing for large questionnaires
- [ ] File upload security testing
- [ ] Data validation and sanitization testing
- [ ] Session security testing
- [ ] Performance benchmarking
- [ ] Accessibility compliance testing
- [ ] User acceptance testing

---

## Phase 12: Deployment & Monitoring
### Task 12.1: Production Deployment ⏳
- [ ] Configure production environment variables
- [ ] Set up file storage for production
- [ ] Implement database migrations for submission tables
- [ ] Configure CDN for static assets
- [ ] Set up SSL and security headers
- [ ] Implement backup and recovery procedures
- [ ] Create deployment pipeline and CI/CD

### Task 12.2: Monitoring & Analytics ⏳
- [ ] Implement error tracking and logging
- [ ] Add performance monitoring
- [ ] Create user analytics and behavior tracking
- [ ] Monitor submission completion rates
- [ ] Track file upload success rates
- [ ] Add real-time system health monitoring
- [ ] Create alerting for critical issues

### Task 12.3: Documentation & Maintenance ⏳
- [ ] Create user documentation and help guides
- [ ] Build troubleshooting guides
- [ ] Document API endpoints and usage
- [ ] Create maintenance procedures
- [ ] Set up automated testing pipeline
- [ ] Create disaster recovery procedures
- [ ] Implement version control and rollback procedures

---

## Technical Implementation Notes

### Key Technologies:
- **Frontend**: Next.js 14+, React, TypeScript, Shadcn UI, Tailwind CSS
- **Backend**: Supabase (PostgreSQL), Row Level Security
- **State Management**: Zustand for questionnaire state
- **Forms**: React Hook Form with Zod validation
- **File Upload**: React Dropzone with custom upload logic
- **Navigation**: Next.js App Router with dynamic routes
- **Testing**: Jest, React Testing Library, Playwright
- **Monitoring**: Sentry for error tracking, Vercel Analytics

### Database Schema Utilization:
- **questionnaire_submissions**: Main submission tracking with session management
- **questionnaire_page_submissions**: Page-level progress and data storage
- **patient_files**: File uploads with metadata and validation
- **questionnaire_templates/pages/questions**: Read-only data for form generation

### Performance Targets:
- Template selection page load < 1.5 seconds
- Page transitions < 500ms
- File upload feedback < 200ms
- Auto-save operations < 1 second
- Mobile responsiveness across all devices
- 90+ Lighthouse scores for all pages

### Security Considerations:
- Input sanitization and XSS prevention
- File upload validation and scanning
- Rate limiting for submissions
- CSRF protection
- Data encryption for sensitive information
- Secure file storage and access control

### Success Criteria:
1. ✅ Seamless template selection and introduction flow
2. ✅ Multi-step form wizard with all 18 question types working
3. ✅ File upload and photo capture functionality
4. ✅ Real-time validation and error handling
5. ✅ Draft saving and session recovery
6. ✅ Mobile-responsive design and touch optimization
7. ✅ Complete submission flow with confirmation
8. ✅ Performance optimization for large questionnaires
9. ✅ Accessibility compliance (WCAG 2.1 AA)
10. ✅ Production deployment with monitoring

---

## Development Priority Order:
1. **Phase 1-2**: Project structure and template selection (Week 1)
2. **Phase 3-4**: Session management and form rendering (Week 2-3)
3. **Phase 5-6**: Navigation and file uploads (Week 4)
4. **Phase 7-8**: Validation and submission flow (Week 5)
5. **Phase 9-10**: API integration and optimization (Week 6)
6. **Phase 11-12**: Testing, deployment, monitoring (Week 7-8)

### Implementation Dependencies:
- Admin questionnaire system must be functional for template creation
- Database tables `questionnaire_submissions`, `questionnaire_page_submissions`, `patient_files` ready for use
- File storage solution configured (local/cloud)
- Email system for submission confirmations (future enhancement)

This comprehensive breakdown provides a clear roadmap for building a production-ready patient questionnaire form wizard that integrates seamlessly with the existing admin system and provides an excellent user experience for patients completing their dental assessments. 
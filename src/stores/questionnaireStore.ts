import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types for questionnaire state
export interface QuestionnaireSubmission {
  id: string;
  template_id: string;
  submission_data: Record<string, any>;
  is_complete: boolean;
  completion_percentage: number;
  time_spent_seconds: number;
  submission_token: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireAnswer {
  question_id: string;
  value: any;
  page_id?: string;
  answered_at: string;
}

export interface QuestionnaireState {
  // Current session data
  currentSubmission: QuestionnaireSubmission | null;
  currentTemplateId: string | null;
  currentPage: number;
  totalPages: number;
  
  // Form data
  answers: Record<string, QuestionnaireAnswer>;
  isDirty: boolean;
  lastSaved: Date | null;
  
  // Navigation and flow
  canNavigateBack: boolean;
  canNavigateForward: boolean;
  visitedPages: Set<number>;
  
  // Auto-save and session
  autoSaveEnabled: boolean;
  sessionStartTime: Date | null;
  
  // Actions
  initializeSession: (templateId: string, submissionData?: Partial<QuestionnaireSubmission>) => Promise<void>;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  updateAnswer: (questionId: string, value: any, pageId?: string) => void;
  removeAnswer: (questionId: string) => void;
  markDirty: () => void;
  markClean: () => void;
  saveProgress: () => Promise<void>;
  completeSubmission: () => Promise<void>;
  resetSession: () => void;
  
  // Navigation helpers
  canNavigateToPage: (page: number) => boolean;
  getCompletionPercentage: () => number;
  getTimeSpentMinutes: () => number;
}

// Generate unique submission token
const generateSubmissionToken = (): string => {
  return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

export const useQuestionnaireStore = create<QuestionnaireState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSubmission: null,
      currentTemplateId: null,
      currentPage: 1,
      totalPages: 0,
      answers: {},
      isDirty: false,
      lastSaved: null,
      canNavigateBack: true,
      canNavigateForward: false,
      visitedPages: new Set([1]),
      autoSaveEnabled: true,
      sessionStartTime: null,

      // Initialize new questionnaire session
      initializeSession: async (templateId: string, submissionData?: Partial<QuestionnaireSubmission>) => {
        const token = generateSubmissionToken();
        const now = new Date();
        
        const submission: QuestionnaireSubmission = {
          id: submissionData?.id || `temp_${Date.now()}`,
          template_id: templateId,
          submission_data: submissionData?.submission_data || {},
          is_complete: false,
          completion_percentage: 0,
          time_spent_seconds: 0,
          submission_token: token,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          ...submissionData
        };

        set({
          currentSubmission: submission,
          currentTemplateId: templateId,
          currentPage: 1,
          answers: {},
          isDirty: false,
          lastSaved: null,
          visitedPages: new Set([1]),
          sessionStartTime: now,
        });

        // Create initial submission in database
        try {
          const response = await fetch('/api/questionnaire/submissions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              template_id: templateId,
              submission_token: token,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            set((state) => ({
              currentSubmission: {
                ...state.currentSubmission!,
                id: data.submission.id,
              }
            }));
          }
        } catch (error) {
          console.error('Failed to create submission:', error);
        }
      },

      // Set current page
      setCurrentPage: (page: number) => {
        set((state) => ({
          currentPage: page,
          visitedPages: new Set([...state.visitedPages, page]),
          canNavigateBack: page > 1,
          canNavigateForward: page < state.totalPages,
        }));
      },

      // Set total pages
      setTotalPages: (total: number) => {
        set((state) => ({
          totalPages: total,
          canNavigateForward: state.currentPage < total,
        }));
      },

      // Update answer
      updateAnswer: (questionId: string, value: any, pageId?: string) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              question_id: questionId,
              value,
              page_id: pageId,
              answered_at: new Date().toISOString(),
            }
          },
          isDirty: true,
        }));
      },

      // Remove answer
      removeAnswer: (questionId: string) => {
        set((state) => {
          const newAnswers = { ...state.answers };
          delete newAnswers[questionId];
          return {
            answers: newAnswers,
            isDirty: true,
          };
        });
      },

      // Mark as dirty
      markDirty: () => set({ isDirty: true }),

      // Mark as clean
      markClean: () => set({ isDirty: false }),

      // Save progress
      saveProgress: async () => {
        const state = get();
        if (!state.currentSubmission || !state.isDirty) return;

        try {
          const timeSpent = state.sessionStartTime 
            ? Math.floor((Date.now() - state.sessionStartTime.getTime()) / 1000)
            : 0;

          const completionPercentage = state.getCompletionPercentage();

          const response = await fetch(`/api/questionnaire/submissions/${state.currentSubmission.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              submission_data: state.answers,
              completion_percentage: completionPercentage,
              time_spent_seconds: timeSpent,
            }),
          });

          if (response.ok) {
            set({
              isDirty: false,
              lastSaved: new Date(),
            });
          }
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      },

      // Complete submission
      completeSubmission: async () => {
        const state = get();
        if (!state.currentSubmission) return;

        try {
          const timeSpent = state.sessionStartTime 
            ? Math.floor((Date.now() - state.sessionStartTime.getTime()) / 1000)
            : 0;

          const response = await fetch(`/api/questionnaire/submissions/${state.currentSubmission.id}/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              submission_data: state.answers,
              time_spent_seconds: timeSpent,
            }),
          });

          if (response.ok) {
            set((state) => ({
              currentSubmission: {
                ...state.currentSubmission!,
                is_complete: true,
                completion_percentage: 100,
              },
              isDirty: false,
              lastSaved: new Date(),
            }));
          }
        } catch (error) {
          console.error('Failed to complete submission:', error);
          throw error;
        }
      },

      // Reset session
      resetSession: () => {
        set({
          currentSubmission: null,
          currentTemplateId: null,
          currentPage: 1,
          totalPages: 0,
          answers: {},
          isDirty: false,
          lastSaved: null,
          canNavigateBack: true,
          canNavigateForward: false,
          visitedPages: new Set([1]),
          sessionStartTime: null,
        });
      },

      // Check if user can navigate to a specific page
      canNavigateToPage: (page: number) => {
        const state = get();
        return state.visitedPages.has(page) || page === state.currentPage + 1;
      },

      // Calculate completion percentage
      getCompletionPercentage: () => {
        const state = get();
        if (state.totalPages === 0) return 0;
        
        // Simple calculation based on visited pages
        const visitedCount = state.visitedPages.size;
        return Math.round((visitedCount / state.totalPages) * 100);
      },

      // Get time spent in minutes
      getTimeSpentMinutes: () => {
        const state = get();
        if (!state.sessionStartTime) return 0;
        
        return Math.floor((Date.now() - state.sessionStartTime.getTime()) / (1000 * 60));
      },
    }),
    {
      name: 'questionnaire-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // Only persist essential data for session recovery
        currentSubmission: state.currentSubmission,
        currentTemplateId: state.currentTemplateId,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        answers: state.answers,
        isDirty: state.isDirty,
        lastSaved: state.lastSaved,
        visitedPages: Array.from(state.visitedPages), // Convert Set to Array for JSON
        sessionStartTime: state.sessionStartTime,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert visitedPages array back to Set
          state.visitedPages = new Set(state.visitedPages || [1]);
          
          // Restore session start time as Date object
          if (state.sessionStartTime) {
            state.sessionStartTime = new Date(state.sessionStartTime);
          }
        }
      },
    }
  )
); 
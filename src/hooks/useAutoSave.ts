import { useEffect, useRef } from 'react';
import { useQuestionnaireStore } from '@/stores/questionnaireStore';

interface UseAutoSaveOptions {
  interval?: number; // milliseconds
  enabled?: boolean;
  onSave?: () => void;
  onError?: (error: Error) => void;
}

export function useAutoSave({
  interval = 30000, // 30 seconds default
  enabled = true,
  onSave,
  onError
}: UseAutoSaveOptions = {}) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isDirty = useQuestionnaireStore((state) => state.isDirty);
  const saveProgress = useQuestionnaireStore((state) => state.saveProgress);
  const autoSaveEnabled = useQuestionnaireStore((state) => state.autoSaveEnabled);
  const currentSubmission = useQuestionnaireStore((state) => state.currentSubmission);

  const performAutoSave = async () => {
    if (!isDirty || !currentSubmission || !autoSaveEnabled || !enabled) {
      return;
    }

    try {
      await saveProgress();
      onSave?.();
    } catch (error) {
      onError?.(error as Error);
      console.error('Auto-save failed:', error);
    }
  };

  useEffect(() => {
    if (!enabled || !autoSaveEnabled) {
      return;
    }

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(performAutoSave, interval);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, enabled, autoSaveEnabled, isDirty]);

  // Save when leaving the page
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (isDirty && currentSubmission && autoSaveEnabled) {
        event.preventDefault();
        event.returnValue = '';
        
        // Attempt to save before leaving
        try {
          await saveProgress();
        } catch (error) {
          console.error('Failed to save before page unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, currentSubmission, autoSaveEnabled, saveProgress]);

  // Manual save function
  const manualSave = async () => {
    try {
      await saveProgress();
      onSave?.();
      return true;
    } catch (error) {
      onError?.(error as Error);
      return false;
    }
  };

  return {
    manualSave,
    isAutoSaveEnabled: enabled && autoSaveEnabled,
    performAutoSave
  };
} 
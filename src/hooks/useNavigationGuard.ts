'use client'

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseNavigationGuardProps {
  hasUnsavedChanges: boolean;
  message?: string;
  onBeforeNavigate?: () => Promise<boolean> | boolean;
}

export function useNavigationGuard({
  hasUnsavedChanges,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  onBeforeNavigate
}: UseNavigationGuardProps) {
  const router = useRouter();

  // Handle browser beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, message]);

  // Create a guarded navigation function
  const guardedNavigate = useCallback(async (href: string) => {
    if (!hasUnsavedChanges) {
      router.push(href);
      return;
    }

    let canNavigate = true;
    
    // If there's a custom handler, use it
    if (onBeforeNavigate) {
      canNavigate = await onBeforeNavigate();
    } else {
      // Otherwise, show a confirm dialog
      canNavigate = window.confirm(message);
    }

    if (canNavigate) {
      router.push(href);
    }
  }, [hasUnsavedChanges, message, onBeforeNavigate, router]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (!hasUnsavedChanges) return;
      
      e.preventDefault();
      const canNavigate = window.confirm(message);
      
      if (!canNavigate) {
        // Push the current state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
      }
    };

    if (hasUnsavedChanges) {
      // Push a dummy state to capture back navigation
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, message]);

  return {
    guardedNavigate,
    hasUnsavedChanges
  };
} 
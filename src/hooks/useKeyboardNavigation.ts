'use client'

import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  isEnabled?: boolean;
}

export function useKeyboardNavigation({
  onNext,
  onPrevious,
  onSave,
  canGoNext = false,
  canGoPrevious = false,
  isEnabled = true
}: UseKeyboardNavigationProps) {

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    // Don't trigger if user is typing in an input field
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || 
                         target.tagName === 'TEXTAREA' || 
                         target.tagName === 'SELECT' ||
                         target.contentEditable === 'true';

    // For input fields, only handle specific combinations
    if (isInputField) {
      // Ctrl/Cmd + Enter = Next
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (canGoNext && onNext) {
          onNext();
        }
        return;
      }

      // Ctrl/Cmd + S = Save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (onSave) {
          onSave();
        }
        return;
      }

      // Don't handle other keys when in input fields
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
      case 'Enter':
        if (canGoNext && onNext) {
          event.preventDefault();
          onNext();
        }
        break;
        
      case 'ArrowLeft':
        if (canGoPrevious && onPrevious) {
          event.preventDefault();
          onPrevious();
        }
        break;

      case 'PageDown':
        if (canGoNext && onNext) {
          event.preventDefault();
          onNext();
        }
        break;
        
      case 'PageUp':
        if (canGoPrevious && onPrevious) {
          event.preventDefault();
          onPrevious();
        }
        break;

      // Ctrl/Cmd + S for save
      case 's':
        if ((event.ctrlKey || event.metaKey) && onSave) {
          event.preventDefault();
          onSave();
        }
        break;

      // ESC to blur current element (helps with validation)
      case 'Escape':
        if (document.activeElement && 'blur' in document.activeElement) {
          (document.activeElement as HTMLElement).blur();
        }
        break;

      default:
        break;
    }
  }, [isEnabled, onNext, onPrevious, onSave, canGoNext, canGoPrevious]);

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isEnabled, handleKeyDown]);

  // Function to scroll to first error if any
  const scrollToFirstError = useCallback(() => {
    const firstErrorElement = document.querySelector('[data-error="true"]') || 
                              document.querySelector('.border-red-500') ||
                              document.querySelector('[aria-invalid="true"]');
    
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Try to focus if it's focusable
      if ('focus' in firstErrorElement) {
        (firstErrorElement as HTMLElement).focus();
      }
    }
  }, []);

  // Function to announce navigation state for screen readers
  const announceNavigation = useCallback((message: string) => {
    // Create a temporary element for screen reader announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return {
    scrollToFirstError,
    announceNavigation
  };
} 
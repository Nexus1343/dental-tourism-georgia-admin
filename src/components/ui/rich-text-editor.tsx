'use client'

import React, { useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Type
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  const executeCommand = useCallback((command: string, value?: string) => {
    // Save selection before executing command
    const selection = window.getSelection()
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null
    
    document.execCommand(command, false, value)
    
    // Restore focus to editor
    if (editorRef.current) {
      editorRef.current.focus()
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle common keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault()
          executeCommand('bold')
          break
        case 'i':
          e.preventDefault()
          executeCommand('italic')
          break
        case 'u':
          e.preventDefault()
          executeCommand('underline')
          break
      }
    }
  }, [executeCommand])

  const formatBlock = useCallback((tag: string) => {
    if (tag) {
      executeCommand('formatBlock', `<${tag}>`)
    }
  }, [executeCommand])

  // Set initial content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  // Initialize editor on mount
  useEffect(() => {
    if (editorRef.current) {
      // Enable rich text editing
      document.execCommand('defaultParagraphSeparator', false, 'p')
      document.execCommand('styleWithCSS', false, 'false')
    }
  }, [])

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:')
    if (url) {
      executeCommand('createLink', url)
    }
  }, [executeCommand])

  const toolbar = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
  ]

  return (
    <div className={`border rounded-md ${className}`}>
      {/* Styles for proper list display */}
      <style>{`
        .rich-editor ul {
          list-style-type: disc !important;
          margin-left: 1.5rem !important;
          padding-left: 0.5rem !important;
        }
        .rich-editor ol {
          list-style-type: decimal !important;
          margin-left: 1.5rem !important;
          padding-left: 0.5rem !important;
        }
        .rich-editor li {
          display: list-item !important;
          margin-bottom: 0.25rem !important;
        }
        .rich-editor h1 {
          font-size: 1.5rem !important;
          font-weight: bold !important;
          margin-bottom: 1rem !important;
        }
        .rich-editor h2 {
          font-size: 1.25rem !important;
          font-weight: bold !important;
          margin-bottom: 0.75rem !important;
        }
        .rich-editor h3 {
          font-size: 1.125rem !important;
          font-weight: bold !important;
          margin-bottom: 0.5rem !important;
        }
        .rich-editor h4 {
          font-size: 1rem !important;
          font-weight: bold !important;
          margin-bottom: 0.5rem !important;
        }
        .rich-editor h5 {
          font-size: 0.875rem !important;
          font-weight: bold !important;
          margin-bottom: 0.25rem !important;
        }
        .rich-editor h6 {
          font-size: 0.75rem !important;
          font-weight: bold !important;
          margin-bottom: 0.25rem !important;
        }
        .rich-editor p {
          margin-bottom: 0.5rem !important;
        }
        .rich-editor strong {
          font-weight: bold !important;
        }
        .rich-editor em {
          font-style: italic !important;
        }
        .rich-editor u {
          text-decoration: underline !important;
        }
      `}</style>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
        <select
          onChange={(e) => {
            formatBlock(e.target.value)
            e.target.value = "" // Reset to show "Normal"
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="px-2 py-1 text-sm border rounded bg-background"
          defaultValue=""
        >
          <option value="">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
          <option value="p">Paragraph</option>
        </select>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {toolbar.map(({ icon: Icon, command, title }, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault() // Prevent losing focus
              executeCommand(command)
            }}
            title={title}
            className="h-8 w-8 p-0"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => {
            e.preventDefault() // Prevent losing focus
            insertLink()
          }}
          title="Insert Link"
          className="h-8 w-8 p-0"
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="rich-editor min-h-[300px] p-4 outline-none relative"
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
        suppressContentEditableWarning={true}
      />
      {(!value || value === '') && (
        <div 
          className="absolute top-[3.5rem] left-8 text-muted-foreground pointer-events-none"
          style={{ marginTop: '1rem' }}
        >
          {placeholder}
        </div>
      )}
    </div>
  )
} 
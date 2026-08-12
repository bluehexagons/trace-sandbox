import { useMemo, useRef } from 'react'
import type { ChangeEvent, KeyboardEvent, UIEvent } from 'react'
import { highlightTrace } from './traceSyntax'

interface TraceCodeEditorProps {
  value: string
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void
  rows: number
  placeholder: string
  ariaLabel: string
}


export default function TraceCodeEditor({
  value,
  onChange,
  onKeyDown,
  rows,
  placeholder,
  ariaLabel,
}: TraceCodeEditorProps) {
  const highlightRef = useRef<HTMLPreElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const highlightedCode = useMemo(() => highlightTrace(value), [value])
  const lineCount = Math.max(1, value.split('\n').length)
  const lineNumbers = Array.from({ length: lineCount }, (_, index) => index + 1)

  const handleScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = event.currentTarget
    if (highlightRef.current !== null) {
      highlightRef.current.scrollTop = scrollTop
      highlightRef.current.scrollLeft = scrollLeft
    }
    if (gutterRef.current !== null) gutterRef.current.scrollTop = scrollTop
  }

  return (
    <div
      className="editor-shell"
      style={{ height: `${Math.max(220, rows * 24 + 32)}px` }}
    >
      <div className="editor-gutter" ref={gutterRef} aria-hidden="true">
        {lineNumbers.map(line => <span key={line}>{line}</span>)}
      </div>
      <div className="editor-code">
        <pre className="editor-highlight" ref={highlightRef} aria-hidden="true">
          <code dangerouslySetInnerHTML={{ __html: highlightedCode || ' ' }} />
        </pre>
        <textarea
          className="editor-input"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={placeholder}
          aria-label={ariaLabel}
          wrap="off"
          rows={rows}
        />
      </div>
    </div>
  )
}

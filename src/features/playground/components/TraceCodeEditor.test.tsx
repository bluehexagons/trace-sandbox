import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import TraceCodeEditor from './TraceCodeEditor'
import { highlightTrace } from './traceSyntax'

describe('TraceCodeEditor', () => {
  it('renders line numbers and escaped syntax highlighting behind the editor', () => {
    const code = 'setup() => {\n  # comment\n  @=value@;\n  value = 42\n}'
    const markup = renderToStaticMarkup(
      <TraceCodeEditor
        value={code}
        onChange={vi.fn()}
        onKeyDown={vi.fn()}
        rows={9}
        placeholder="Enter trace code here…"
        ariaLabel="trace script editor"
      />,
    )

    expect(markup).toContain('class="editor-gutter"')
    expect(markup).toContain('>5</span>')
    expect(markup).toContain('class="syntax-comment"')
    expect(markup).toContain('class="syntax-echo"')
    expect(markup).toContain('class="syntax-number"')
    expect(markup).toContain('<textarea class="editor-input"')
    expect(markup).toContain('>setup() =&gt; {\n  # comment')
  })

  it('escapes user-authored code before highlighting it', () => {
    expect(highlightTrace('value = "<unsafe>"')).toContain('&lt;unsafe&gt;')
    expect(highlightTrace('value = "<unsafe>"')).not.toContain('<unsafe>')
  })
})

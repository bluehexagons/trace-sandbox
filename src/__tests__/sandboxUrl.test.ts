import { describe, expect, it } from 'vitest'
import { buildExampleHref, buildSandboxHref, parseSandboxUrl } from '../sandboxUrl'

const baseUrl = 'https://example.test/trace-sandbox/?old=value#output'

describe('sandbox URLs', () => {
  it('builds stable example links without carrying unrelated URL state', () => {
    expect(buildExampleHref('lorenz-attractor', baseUrl)).toBe(
      '/trace-sandbox/?example=lorenz-attractor',
    )
  })

  it('round-trips multiline Unicode code and arguments', () => {
    const href = buildSandboxHref({
      exampleId: 'logistic-map',
      code: '# λ population\nvalue = 3.8;\nvalue',
      args: '3.8 0.2',
    }, baseUrl)

    expect(parseSandboxUrl(new URL(href, baseUrl).search)).toEqual({
      exampleId: 'logistic-map',
      code: '# λ population\nvalue = 3.8;\nvalue',
      args: '3.8 0.2',
    })
  })

  it('distinguishes an explicitly empty custom script from an absent script', () => {
    expect(parseSandboxUrl('?code=')).toEqual({
      exampleId: null,
      code: '',
      args: null,
    })
    expect(parseSandboxUrl('')).toEqual({
      exampleId: null,
      code: null,
      args: null,
    })
  })

  it('preserves an explicitly empty argument list', () => {
    const href = buildSandboxHref({ exampleId: 'logistic-map', args: '' }, baseUrl)

    expect(href).toBe('/trace-sandbox/?example=logistic-map&args=')
    expect(parseSandboxUrl(new URL(href, baseUrl).search).args).toBe('')
  })
})

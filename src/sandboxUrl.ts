export interface ParsedSandboxUrl {
  exampleId: string | null
  code: string | null
  args: string | null
}

export interface SandboxLinkState {
  exampleId?: string
  code?: string
  args?: string
}

export function parseSandboxUrl(search: string): ParsedSandboxUrl {
  const params = new URLSearchParams(search)
  return {
    exampleId: params.get('example'),
    code: params.has('code') ? params.get('code') ?? '' : null,
    args: params.has('args') ? params.get('args') ?? '' : null,
  }
}

const cleanUrl = (baseUrl: string) => {
  const url = new URL(baseUrl)
  url.search = ''
  url.hash = ''
  return url
}

const relativeHref = (url: URL) => `${url.pathname}${url.search}${url.hash}`

export function buildExampleHref(exampleId: string, baseUrl: string): string {
  const url = cleanUrl(baseUrl)
  url.searchParams.set('example', exampleId)
  return relativeHref(url)
}

export function buildSandboxHref(state: SandboxLinkState, baseUrl: string): string {
  const url = cleanUrl(baseUrl)
  if (state.exampleId !== undefined) {
    url.searchParams.set('example', state.exampleId)
  }
  if (state.code !== undefined) {
    url.searchParams.set('code', state.code)
  }
  if (state.args !== undefined) {
    url.searchParams.set('args', state.args)
  }
  return relativeHref(url)
}

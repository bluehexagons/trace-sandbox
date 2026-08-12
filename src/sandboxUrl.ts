export type SandboxRunMode = 'once' | 'persistent' | 'functions'

export interface ParsedSandboxUrl {
  exampleId: string | null
  code: string | null
  args: string | null
  runMode: SandboxRunMode | null
  framesPerSecond: number | null
  yMin: number | null
  yMax: number | null
  setupFunction: string | null
  tickFunction: string | null
}

export interface SandboxLinkState {
  exampleId?: string
  code?: string
  args?: string
  runMode?: SandboxRunMode
  framesPerSecond?: number
  yMin?: number
  yMax?: number
  setupFunction?: string
  tickFunction?: string
}

const finiteParam = (params: URLSearchParams, name: string) => {
  const raw = params.get(name)
  if (raw === null || raw.trim() === '') return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

export function parseSandboxUrl(search: string): ParsedSandboxUrl {
  const params = new URLSearchParams(search)
  const runMode = params.get('run')
  return {
    exampleId: params.get('example'),
    code: params.has('code') ? params.get('code') ?? '' : null,
    args: params.has('args') ? params.get('args') ?? '' : null,
    runMode: runMode === 'once' || runMode === 'persistent' || runMode === 'functions'
      ? runMode
      : null,
    framesPerSecond: finiteParam(params, 'fps'),
    yMin: finiteParam(params, 'ymin'),
    yMax: finiteParam(params, 'ymax'),
    setupFunction: params.get('setup'),
    tickFunction: params.get('tick'),
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

export function buildEmptySandboxHref(baseUrl: string): string {
  return buildSandboxHref({ code: '' }, baseUrl)
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
  if (state.runMode !== undefined) {
    url.searchParams.set('run', state.runMode)
  }
  if (state.framesPerSecond !== undefined) {
    url.searchParams.set('fps', String(state.framesPerSecond))
  }
  if (state.yMin !== undefined) {
    url.searchParams.set('ymin', String(state.yMin))
  }
  if (state.yMax !== undefined) {
    url.searchParams.set('ymax', String(state.yMax))
  }
  if (state.setupFunction !== undefined) {
    url.searchParams.set('setup', state.setupFunction)
  }
  if (state.tickFunction !== undefined) {
    url.searchParams.set('tick', state.tickFunction)
  }
  return relativeHref(url)
}

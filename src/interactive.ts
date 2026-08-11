export interface InteractiveControl {
  id: string
  label: string
  description: string
  argumentIndex: number
  kind: 'range' | 'number'
  defaultValue: number
  min: number
  max: number
  step: number
}

export interface InteractiveControls {
  description: string
  autoRun: boolean
  items: InteractiveControl[]
}

const tokensFrom = (input: string) => {
  const trimmed = input.trim()
  return trimmed === '' ? [] : trimmed.split(/\s+/)
}

export function readArgumentValue(
  input: string,
  argumentIndex: number,
  fallback: number,
): number {
  const value = Number(tokensFrom(input)[argumentIndex])
  return Number.isFinite(value) ? value : fallback
}

export function writeArgumentValue(
  input: string,
  control: InteractiveControl,
  value: number,
  controls: InteractiveControl[],
): string {
  if (!Number.isFinite(value)) {
    return input.trim()
  }

  const tokens = tokensFrom(input)
  const normalized = Math.min(control.max, Math.max(control.min, value))

  while (tokens.length <= control.argumentIndex) {
    const argumentIndex = tokens.length
    const configured = controls.find(item => item.argumentIndex === argumentIndex)
    tokens.push(String(configured?.defaultValue ?? 0))
  }

  tokens[control.argumentIndex] = String(Number(normalized.toFixed(12)))
  return tokens.join(' ')
}

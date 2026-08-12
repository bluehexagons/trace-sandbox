interface InteractiveControlBase {
  id: string
  label: string
  description: string
}

export interface InteractiveArgumentControl extends InteractiveControlBase {
  argumentIndex: number
  kind: 'range' | 'number'
  defaultValue: number
  min: number
  max: number
  step: number
  /** Variable to mutate in a running live Trace session instead of restarting it. */
  liveVariable?: string
}

export interface InteractiveTriggerControl extends InteractiveControlBase {
  kind: 'trigger'
  variable: string
  amount: number
  buttonLabel: string
}

export type InteractiveControl = InteractiveArgumentControl | InteractiveTriggerControl

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
  control: InteractiveArgumentControl,
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
    const configured = controls.find(
      (item): item is InteractiveArgumentControl =>
        item.kind !== 'trigger' && item.argumentIndex === argumentIndex,
    )
    tokens.push(String(configured?.defaultValue ?? 0))
  }

  tokens[control.argumentIndex] = String(Number(normalized.toFixed(12)))
  return tokens.join(' ')
}

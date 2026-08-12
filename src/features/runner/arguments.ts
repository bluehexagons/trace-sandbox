export function parseArguments(input: string): number[] {
  const trimmed = input.trim()
  if (trimmed === '') return []

  const args = trimmed.split(/\s+/).map(Number)
  if (args.some(arg => !Number.isFinite(arg))) {
    throw new Error('Arguments must be finite numbers separated by spaces.')
  }

  return args
}

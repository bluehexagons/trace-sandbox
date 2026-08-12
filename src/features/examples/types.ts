import type { AnimationSpec } from '../animation/types'
import type { InteractiveControls } from '../playground/interactive'
import type { ExampleSectionId } from './sections'

export interface Example {
  id: string
  section: ExampleSectionId
  name: string
  description: string
  concepts: string[]
  expected: string
  challenge: string
  code: string
  args?: string
  expectedValue?: number
  expectsError?: boolean
  animation?: AnimationSpec
  controls?: InteractiveControls
}

export type { ExampleSectionId }

import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz')
  })

  it('should handle undefined and null values', () => {
    expect(cn('foo', undefined, 'bar', null)).toBe('foo bar')
  })

  it('should handle Tailwind CSS conflicts', () => {
    expect(cn('px-2 py-1 px-3')).toBe('py-1 px-3')
    expect(cn('text-sm text-lg')).toBe('text-lg')
  })

  it('should handle objects with conditional classes', () => {
    expect(cn({
      'text-red-500': true,
      'text-blue-500': false,
      'font-bold': true
    })).toBe('text-red-500 font-bold')
  })

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
    expect(cn([])).toBe('')
  })
})
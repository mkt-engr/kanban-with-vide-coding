import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('クラス名が正しくマージされること', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('条件付きクラスを処理できること', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz')
  })

  it('undefinedとnull値を処理できること', () => {
    expect(cn('foo', undefined, 'bar', null)).toBe('foo bar')
  })

  it('Tailwind CSSの競合を処理できること', () => {
    expect(cn('px-2 py-1 px-3')).toBe('py-1 px-3')
    expect(cn('text-sm text-lg')).toBe('text-lg')
  })

  it('条件付きクラスを持つオブジェクトを処理できること', () => {
    expect(cn({
      'text-red-500': true,
      'text-blue-500': false,
      'font-bold': true
    })).toBe('text-red-500 font-bold')
  })

  it('配列を処理できること', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('空の入力を処理できること', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
    expect(cn([])).toBe('')
  })
})
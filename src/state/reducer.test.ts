import { describe, expect, it } from 'vitest'
import { ReducerFunction, type MenuState } from './reducer'

const initialState: MenuState = { showMenu: false, menu: '' }

describe('ReducerFunction', () => {
  it('opens the grill menu', () => {
    const state = ReducerFunction(initialState, { type: 'showGrill' })
    expect(state.showMenu).toBe(true)
    expect(state.menu).toMatch(/^showGrill Menu/)
  })

  it('opens the salad menu', () => {
    const state = ReducerFunction(initialState, { type: 'showSalad' })
    expect(state).toEqual({ showMenu: true, menu: 'showSalad Menu to add prices and menu' })
  })

  it('opens the seafood menu', () => {
    const state = ReducerFunction(initialState, { type: 'showSeaFood' })
    expect(state).toEqual({ showMenu: true, menu: 'showSeaFood Menu' })
  })

  it('closes the menu but keeps the last menu text', () => {
    const open = ReducerFunction(initialState, { type: 'showSalad' })
    const closed = ReducerFunction(open, { type: 'closeMenu' })
    expect(closed.showMenu).toBe(false)
    expect(closed.menu).toBe(open.menu)
  })

  it('does not mutate the previous state', () => {
    ReducerFunction(initialState, { type: 'showGrill' })
    expect(initialState).toEqual({ showMenu: false, menu: '' })
  })

  it('throws on an unknown action', () => {
    // @ts-expect-error - deliberately invalid action
    expect(() => ReducerFunction(initialState, { type: 'nope' })).toThrow('Unknown action.')
  })
})

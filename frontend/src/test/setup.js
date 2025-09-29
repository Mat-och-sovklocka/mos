import '@testing-library/jest-dom'

// Mock fetch globally
global.fetch = vi.fn()

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
})

// Mock window.alert
global.alert = vi.fn()

// Mock window.confirm
global.confirm = vi.fn(() => true)

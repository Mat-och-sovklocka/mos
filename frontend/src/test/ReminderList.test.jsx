import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ReminderList from '../Reminderlist'

// Mock the AuthContext
const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  email: 'admin@mos.test',
  displayName: 'Admin User',
  userType: 'ADMIN'
}

const mockGetAuthHeaders = vi.fn(() => ({
  'Authorization': 'Bearer mock-token',
  'Content-Type': 'application/json'
}))

const mockAuthContext = {
  user: mockUser,
  getAuthHeaders: mockGetAuthHeaders,
}

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('ReminderList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        {
          id: '1',
          type: 'once',
          category: 'MEAL',
          note: 'Test reminder',
          dateTime: '2024-01-25T12:00:00Z',
          createdAt: '2024-01-25T10:00:00Z'
        }
      ])
    })
  })

  it('renders reminder list with Swedish title', () => {
    renderWithRouter(<ReminderList />)
    
    expect(screen.getByText('Påminnelselista')).toBeInTheDocument()
  })

  it('fetches reminders on mount', async () => {
    renderWithRouter(<ReminderList />)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/users/${mockUser.id}/reminders`,
        {
          headers: mockGetAuthHeaders()
        }
      )
    })
  })

  it('displays reminders when loaded', async () => {
    renderWithRouter(<ReminderList />)
    
    await waitFor(() => {
      expect(screen.getByText('Test reminder')).toBeInTheDocument()
    })
  })

  it('shows delete confirmation when delete button is clicked', async () => {
    global.confirm = vi.fn(() => true)
    
    renderWithRouter(<ReminderList />)
    
    await waitFor(() => {
      expect(screen.getByText('Test reminder')).toBeInTheDocument()
    })
    
    const deleteButton = screen.getByRole('button', { name: /ta bort/i })
    fireEvent.click(deleteButton)
    
    expect(global.confirm).toHaveBeenCalled()
  })

  it('calls delete API when confirmation is accepted', async () => {
    global.confirm = vi.fn(() => true)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    })
    
    renderWithRouter(<ReminderList />)
    
    await waitFor(() => {
      expect(screen.getByText('Test reminder')).toBeInTheDocument()
    })
    
    const deleteButton = screen.getByRole('button', { name: /ta bort/i })
    fireEvent.click(deleteButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/users/${mockUser.id}/reminders/1`,
        {
          method: 'DELETE',
          headers: mockGetAuthHeaders()
        }
      )
    })
  })
})

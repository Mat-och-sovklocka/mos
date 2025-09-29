import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Login from '../components/Login'

// Mock the AuthContext
const mockLogin = vi.fn()
const mockAuthContext = {
  login: mockLogin,
  user: null,
  loading: false,
}

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form with Swedish labels', () => {
    renderWithRouter(<Login />)
    
    expect(screen.getByText('MOS')).toBeInTheDocument()
    expect(screen.getByText('Mat och sovklocka')).toBeInTheDocument()
    expect(screen.getByLabelText('E-post')).toBeInTheDocument()
    expect(screen.getByLabelText('Lösenord')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Logga in' })).toBeInTheDocument()
  })

  it('shows demo credentials', () => {
    renderWithRouter(<Login />)
    
    expect(screen.getByText('Demo-uppgifter:')).toBeInTheDocument()
    expect(screen.getByText(/Admin:.*admin@mos\.test.*password123/)).toBeInTheDocument()
    expect(screen.getByText(/Beware:.*resident1@mos\.test.*password123/)).toBeInTheDocument()
  })

  it('calls login function when form is submitted', async () => {
    mockLogin.mockResolvedValue({ success: true })
    
    renderWithRouter(<Login />)
    
    const emailInput = screen.getByLabelText('E-post')
    const passwordInput = screen.getByLabelText('Lösenord')
    const submitButton = screen.getByRole('button', { name: 'Logga in' })
    
    fireEvent.change(emailInput, { target: { value: 'admin@mos.test' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@mos.test', 'password123')
    })
  })

  it('shows error message when login fails', async () => {
    mockLogin.mockResolvedValue({ 
      success: false, 
      error: 'Invalid credentials' 
    })
    
    renderWithRouter(<Login />)
    
    const emailInput = screen.getByLabelText('E-post')
    const passwordInput = screen.getByLabelText('Lösenord')
    const submitButton = screen.getByRole('button', { name: 'Logga in' })
    
    fireEvent.change(emailInput, { target: { value: 'wrong@email.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('shows loading state during login', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({ success: true }), 100)
    ))
    
    renderWithRouter(<Login />)
    
    const submitButton = screen.getByRole('button', { name: 'Logga in' })
    fireEvent.click(submitButton)
    
    expect(screen.getByText(/Loggar in/)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
})

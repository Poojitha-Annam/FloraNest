import { useState } from 'react'
import Button from '../components/Button'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setIsSuccess(false)

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setMessage('Password must contain at least 6 characters.')
      return
    }

    setIsRegistering(true)

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Registration failed.')
      }

      setIsSuccess(true)
      setMessage('Account created successfully! Welcome to FloraNest 🌱')

      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      setMessage(
        error.message === 'Failed to fetch'
          ? 'Unable to connect to the server. Please try again.'
          : error.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Create Your Account 🌱</h1>
        <p>Join the FloraNest family!</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />

          <label htmlFor="register-email">Email Address</label>
          <input
            id="register-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />

          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />

          <Button
            type="submit"
            className="cart-button"
            disabled={isRegistering}
          >
            {isRegistering ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {message && (
          <p
            className="login-message"
            role="status"
            style={{ color: isSuccess ? 'green' : undefined }}
          >
            {message}
          </p>
        )}

        <p className="register-link">
          Already have an account? <a href="#login">Login</a>
        </p>
      </section>
    </main>
  )
}

export default Register
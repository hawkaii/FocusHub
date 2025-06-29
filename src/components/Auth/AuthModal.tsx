import { useState } from 'react'
import { IoCloseSharp } from 'react-icons/io5'
import { FaGoogle } from 'react-icons/fa'
import { useAuth } from '@App/hooks/useAuth'
import { Button } from '@Components/Common/Button'
import { successToast, failureToast } from '@Utils/toast'

interface AuthModalProps {
  isVisible: boolean
  onClose: () => void
}

export const AuthModal = ({ isVisible, onClose }: AuthModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password)
        if (error) throw error
        successToast('Account created successfully!', false)
        onClose()
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        successToast('Signed in successfully!', false)
        onClose()
      }
    } catch (error: any) {
      failureToast(error.message || 'Authentication failed', false)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
      successToast('Signed in with Google successfully!', false)
      onClose()
    } catch (error: any) {
      failureToast(error.message || 'Google sign-in failed', false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 text-gray-800 shadow-md dark:bg-gray-800 dark:text-gray-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <IoCloseSharp
            className="cursor-pointer text-red-500 hover:bg-red-200"
            onClick={onClose}
          />
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            variant="primary"
            className="w-full flex items-center justify-center space-x-2"
          >
            <FaGoogle />
            <span>Continue with Google</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                or
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:border-gray-600"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-violet-600 hover:text-violet-800 dark:text-violet-400"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
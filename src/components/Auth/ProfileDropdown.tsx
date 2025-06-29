import { useState, useRef, useEffect } from 'react'
import { FaUser, FaSignOutAlt, FaCloud, FaDownload, FaUpload, FaGoogle } from 'react-icons/fa'
import { IoCloseSharp } from 'react-icons/io5'
import { useAuth } from '@App/hooks/useAuth'
import { useCloudTasks } from '@App/hooks/useCloudTasks'
import { useTask } from '@Store'
import { Button } from '@Components/Common/Button'
import { successToast, failureToast } from '@Utils/toast'
import { AuthModal } from './AuthModal'

export const ProfileDropdown = () => {
  const { user, signInWithGoogle, signOut } = useAuth()
  const { tasks, removeAllTasks, addTask } = useTask()
  const { cloudTasks, syncToCloud, loadFromCloud, syncing } = useCloudTasks()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
      successToast('Signed in with Google successfully!', false)
      setIsDropdownOpen(false)
    } catch (error: any) {
      failureToast(error.message || 'Google sign-in failed', false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setIsDropdownOpen(false)
    successToast('Signed out successfully', false)
  }

  const handleSyncToCloud = async () => {
    await syncToCloud(tasks)
    setIsDropdownOpen(false)
  }

  const handleLoadFromCloud = async () => {
    setLoading(true)
    try {
      const cloudTasksData = await loadFromCloud()
      
      // Clear local tasks and load cloud tasks
      removeAllTasks()
      
      cloudTasksData.forEach(task => {
        addTask(task.description, task.pomodoro, false)
      })
      
      successToast('Tasks loaded from cloud successfully', false)
      setIsDropdownOpen(false)
    } catch (error) {
      console.error('Error loading from cloud:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  const getUserAvatar = () => {
    if (user?.photoURL) return user.photoURL
    return null
  }

  if (!user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 rounded-lg bg-background-primary px-4 py-2 text-sm font-medium text-text-primary shadow-card border border-border-light hover:shadow-card-hover hover:bg-background-secondary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-orange"
        >
          <FaUser className="h-4 w-4" />
          <span>Sign In</span>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg bg-background-primary shadow-card-hover ring-1 ring-border-light border border-border-light">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Welcome to FocusStation
              </h3>
              
              <div className="space-y-3">
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
                    <div className="w-full border-t border-border-medium" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-background-primary px-2 text-text-secondary">
                      or
                    </span>
                  </div>
                </div>
                
                <Button
                  onClick={() => {
                    setIsAuthModalOpen(true)
                    setIsDropdownOpen(false)
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  Sign in with Email
                </Button>
              </div>
              
              <p className="mt-4 text-xs text-text-secondary">
                Sign in to save your tasks to the cloud and sync across devices.
              </p>
            </div>
          </div>
        )}

        <AuthModal isVisible={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 rounded-lg bg-background-primary px-4 py-2 text-sm font-medium text-text-primary shadow-card border border-border-light hover:shadow-card-hover hover:bg-background-secondary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-orange"
      >
        {getUserAvatar() ? (
          <img
            src={getUserAvatar()!}
            alt="Profile"
            className="h-6 w-6 rounded-full"
          />
        ) : (
          <FaUser className="h-4 w-4" />
        )}
        <span className="max-w-32 truncate">{getUserDisplayName()}</span>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-lg bg-background-primary shadow-card-hover ring-1 ring-border-light border border-border-light">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              {getUserAvatar() ? (
                <img
                  src={getUserAvatar()!}
                  alt="Profile"
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-background-tertiary flex items-center justify-center">
                  <FaUser className="h-5 w-5 text-text-secondary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-sm text-text-secondary truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="border-t border-border-light pt-4">
              <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center">
                <FaCloud className="mr-2 text-accent-orange" />
                Cloud Sync
              </h4>
              <p className="text-xs text-text-secondary mb-3">
                Local: {tasks.length} tasks | Cloud: {cloudTasks.length} tasks
              </p>
              
              <div className="space-y-2">
                <Button
                  onClick={handleSyncToCloud}
                  variant="primary"
                  size="small"
                  className="w-full flex items-center justify-center text-sm"
                  disabled={syncing}
                >
                  <FaUpload className="mr-2 h-3 w-3" />
                  {syncing ? 'Syncing...' : 'Sync to Cloud'}
                </Button>
                
                <Button
                  onClick={handleLoadFromCloud}
                  variant="secondary"
                  size="small"
                  className="w-full flex items-center justify-center text-sm"
                  disabled={loading}
                >
                  <FaDownload className="mr-2 h-3 w-3" />
                  {loading ? 'Loading...' : 'Load from Cloud'}
                </Button>
              </div>
            </div>

            <div className="border-t border-border-light pt-4 mt-4">
              <Button
                onClick={handleSignOut}
                variant="danger"
                size="small"
                className="w-full flex items-center justify-center text-sm"
              >
                <FaSignOutAlt className="mr-2 h-3 w-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
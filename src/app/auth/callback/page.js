"use client"

import { useState } from 'react'
import { useRouter } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }

    setLoading(true)
    const supabase = createClientComponentClient()
    
    try {
      const { error: resetError } = await supabase.auth.updateUser({
        password
      })

      if (resetError) throw resetError
      
      setSuccess(true)
      setMessage('Password updated successfully! Redirecting...')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      setError(err.message)
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#1a0f23] to-[#2c0e37] p-4">
    <div className={`backdrop-blur-lg bg-opacity-20 bg-gray-800 border border-gray-700 border-opacity-30 rounded-2xl shadow-xl overflow-hidden w-full max-w-md transition-all duration-500 ${success ? 'ring-2 ring-emerald-500 ring-opacity-50' : ''}`}>
        <div className="p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-black bg-opacity-30 backdrop-blur-sm mb-4 border border-gray-600 border-opacity-50">
              {success ? (
                <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>
            <h2 className="text-3xl font-bold text-white">
              {success ? 'Success!' : 'Reset Password'}
            </h2>
            <p className="mt-2 text-gray-300">
              {success ? 'Your password has been updated securely.' : 'Create a new secure password'}
            </p>
          </div>

          {!success && (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full px-4 py-3 bg-black bg-opacity-30 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full px-4 py-3 bg-black bg-opacity-30 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-900 bg-opacity-30 backdrop-blur-sm p-4 border border-red-700 border-opacity-50">
                  <div className="flex items-center text-sm text-red-200">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 shadow-lg ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Securing...
                    </>
                  ) : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          {message && (
            <div className="mt-6 rounded-lg bg-emerald-900 bg-opacity-30 backdrop-blur-sm p-4 border border-emerald-700 border-opacity-50">
              <div className="flex items-center text-sm text-emerald-200">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {message}
                <div className="ml-auto">
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
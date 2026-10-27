'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Recycle, Mail, Lock, User, Phone, Globe, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function GreenRewardsAuthPage() {
  const supabase = createClient()
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form inputs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [language, setLanguage] = useState<'en' | 'kn'>('en')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        if (!fullName || !email || !password || !phone) {
          toast.error(language === 'en' ? 'Please fill in all required fields' : 'ದಯವಿಟ್ಟು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ')
          setLoading(false)
          return
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              language_preference: language
            }
          }
        })

        if (error) {
          toast.error(error.message)
        } else {
          toast.success(
            language === 'en' 
              ? 'Account created successfully! Logging you in...' 
              : 'ಖಾತೆ ಯಶಸ್ವಿಯಾಗಿ ರಚನೆಯಾಗಿದೆ!'
          )
          router.push('/green-rewards')
          router.refresh()
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          toast.error(error.message)
        } else {
          toast.success(language === 'en' ? 'Welcome back!' : 'ಸಾಸ್ವಾಗತ!')
          router.push('/green-rewards')
          router.refresh()
        }
      }
    } catch (err: any) {
      toast.error('Authentication error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-[#FFB300]/10 border border-[#FFB300]/30 rounded-2xl flex items-center justify-center text-[#FFB300]">
            <Recycle className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white">
          {isSignUp 
            ? (language === 'en' ? 'Join Sampige Green Rewards' : 'ಸಂಪಿಗೆ ಗ್ರೀನ್ ರಿವಾರ್ಡ್ಸ್‌ಗೆ ಸೇರಿ')
            : (language === 'en' ? 'Member Portal Sign In' : 'ಸದಸ್ಯರ ಲಾಗಿನ್')}
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          {language === 'en'
            ? 'Earn points for dry waste & pooja items. Redeem for cash or trees.'
            : 'ಒಣ ತ್ಯಾಜ್ಯ ಮತ್ತು ಪೂಜಾ ತ್ಯಾಜ್ಯಕ್ಕೆ ನಗದು ಮತ್ತು ಬಹುಮಾನಗಳನ್ನು ಪಡೆಯಿರಿ.'}
        </p>

        {/* Language selector toggle */}
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 text-xs rounded-full font-medium transition ${
              language === 'en'
                ? 'bg-[#FFB300] text-black font-bold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('kn')}
            className={`px-3 py-1 text-xs rounded-full font-medium transition ${
              language === 'kn'
                ? 'bg-[#FFB300] text-black font-bold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            ಕನ್ನಡ
          </button>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-300">
                    {language === 'en' ? 'Full Name' : 'ಪೂರ್ಣ ಹೆಸರು'}
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="block w-full pl-10 bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300">
                    {language === 'en' ? 'Phone Number (WhatsApp)' : 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ'}
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98860 00000"
                      className="block w-full pl-10 bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300">
                {language === 'en' ? 'Email Address' : 'ಇಮೇಲ್ ವಿಳಾಸ'}
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFB300]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">
                {language === 'en' ? 'Password' : 'ಪಾಸ್‌ವರ್ಡ್'}
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFB300]"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-black bg-[#FFB300] hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB300] transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isSignUp 
                      ? (language === 'en' ? 'Create Account' : 'ಖಾತೆ ರಚಿಸಿ') 
                      : (language === 'en' ? 'Sign In to Dashboard' : 'ಲಾಗಿನ್ ಮಾಡಿ')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-[#FFB300] hover:underline"
            >
              {isSignUp
                ? (language === 'en' ? 'Already have an account? Sign In' : 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಲಾಗಿನ್ ಮಾಡಿ')
                : (language === 'en' ? 'New to Green Rewards? Register here' : 'ಹೊಸ ಸದಸ್ಯರೇ? ಇಲ್ಲಿ ನೋಂದಾಯಿಸಿ')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
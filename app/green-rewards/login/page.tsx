'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Recycle, Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

function normalizePhoneForStorage(input: string): string {
  const digits = String(input || '').replace(/\D/g, '')
  if (digits.length >= 10) {
    const last10 = digits.slice(-10)
    return `+91${last10}`
  }
  return String(input || '').trim()
}

function isPhoneIdentifier(value: string): boolean {
  const v = value.trim()
  if (v.includes('@')) return false
  const digits = v.replace(/\D/g, '')
  return digits.length >= 10
}

export default function GreenRewardsAuthPage() {
  const supabase = createClient()
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  // Login: email OR phone
  const [loginId, setLoginId] = useState('')
  const [language, setLanguage] = useState<'en' | 'kn'>('en')

  async function upsertProfile(userId: string, payload: {
    full_name: string
    phone: string
    email: string
    language_preference: 'en' | 'kn'
  }) {
    const { error } = await supabase.from('gr_profiles').upsert(
      {
        id: userId,
        full_name: payload.full_name,
        phone: payload.phone,
        email: payload.email.toLowerCase(),
        language_preference: payload.language_preference,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    )
    if (error) console.error('gr_profiles upsert error:', error)
  }

  async function resolveEmail(identifier: string): Promise<string | null> {
    const id = identifier.trim()
    if (!id) return null
    if (id.includes('@')) return id.toLowerCase()

    const res = await fetch('/api/green-rewards/auth/resolve-identifier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: id })
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Could not resolve phone number')
    }
    return data.email as string
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const normalizedPhone = normalizePhoneForStorage(phone)

        if (!fullName.trim() || !email.trim() || !password || !phone.trim()) {
          toast.error(
            language === 'en'
              ? 'Please fill in all required fields (Name, Phone, Email, Password)'
              : 'ದಯವಿಟ್ಟು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ (ಹೆಸರು, ಫೋನ್, ಇಮೇಲ್, ಪಾಸ್‌ವರ್ಡ್)'
          )
          setLoading(false)
          return
        }

        const phoneDigits = phone.replace(/\D/g, '')
        if (phoneDigits.length < 10) {
          toast.error(
            language === 'en'
              ? 'Please enter a valid 10-digit mobile number'
              : 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ'
          )
          setLoading(false)
          return
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: normalizedPhone,
              language_preference: language
            }
          }
        })

        if (error) {
          toast.error(error.message)
          setLoading(false)
          return
        }

        if (data.user) {
          await upsertProfile(data.user.id, {
            full_name: fullName.trim(),
            phone: normalizedPhone,
            email: email.trim().toLowerCase(),
            language_preference: language
          })
        }

        toast.success(
          language === 'en'
            ? 'Account created successfully! Logging you in...'
            : 'ಖಾತೆ ಯಶಸ್ವಿಯಾಗಿ ರಚನೆಯಾಗಿದೆ!'
        )
        router.push('/green-rewards')
        router.refresh()
      } else {
        // Sign in with Email OR Phone + password
        if (!loginId.trim() || !password) {
          toast.error(
            language === 'en'
              ? 'Enter your email/phone and password'
              : 'ಇಮೇಲ್/ಫೋನ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ'
          )
          setLoading(false)
          return
        }

        let resolvedEmail = loginId.trim()
        if (isPhoneIdentifier(loginId)) {
          resolvedEmail = (await resolveEmail(loginId)) || ''
        } else {
          resolvedEmail = loginId.trim().toLowerCase()
        }

        if (!resolvedEmail) {
          toast.error(
            language === 'en'
              ? 'No account found for this phone number'
              : 'ಈ ಫೋನ್ ಸಂಖ್ಯೆಗೆ ಖಾತೆ ಕಂಡುಬಂದಿಲ್ಲ'
          )
          setLoading(false)
          return
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: resolvedEmail,
          password
        })

        if (error) {
          toast.error(error.message)
        } else {
          // Keep phone fresh on profile when user logs in with phone visible in session metadata
          const { data: { user: authUser } } = await supabase.auth.getUser()
          if (authUser) {
            const metaPhone = authUser.user_metadata?.phone
            if (metaPhone) {
              await supabase
                .from('gr_profiles')
                .update({ phone: metaPhone, email: authUser.email || resolvedEmail })
                .eq('id', authUser.id)
            }
          }

          toast.success(language === 'en' ? 'Welcome back!' : 'ಸ್ವಾಗತ!')
          router.push('/green-rewards')
          router.refresh()
        }
      }
    } catch (err: any) {
      toast.error('Authentication error: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-2xl flex items-center justify-center text-black shadow-[0_0_25px_rgba(16,185,129,0.35)]">
            <Recycle className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white">
          {isSignUp
            ? language === 'en'
              ? 'Join Sampige Green Rewards'
              : 'ಸಂಪಿಗೆ ಗ್ರೀನ್ ರಿವಾರ್ಡ್ಸ್‌ಗೆ ಸೇರಿ'
            : language === 'en'
              ? 'Member Portal Sign In'
              : 'ಸದಸ್ಯರ ಲಾಗಿನ್'}
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          {language === 'en'
            ? 'Earn points for dry waste & pooja items. Redeem for cash or trees.'
            : 'ಒಣ ತ್ಯಾಜ್ಯ ಮತ್ತು ಪೂಜಾ ತ್ಯಾಜ್ಯಕ್ಕೆ ನಗದು ಮತ್ತು ಬಹುಮಾನಗಳನ್ನು ಪಡೆಯಿರಿ.'}
        </p>

        {/* Language toggle */}
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 text-xs rounded-full font-medium transition ${
              language === 'en'
                ? 'bg-emerald-500 text-black font-bold'
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
                ? 'bg-emerald-500 text-black font-bold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            ಕನ್ನಡ
          </button>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-300">
                    {language === 'en' ? 'Full Name' : 'ಪೂರ್ಣ ಹೆಸರು'}{' '}
                    <span className="text-red-400">*</span>
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
                      className="block w-full pl-10 bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300">
                    {language === 'en' ? 'Phone Number (WhatsApp)' : 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (WhatsApp)'}{' '}
                    <span className="text-red-400">*</span>
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
                      className="block w-full pl-10 bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-zinc-500">
                    {language === 'en'
                      ? 'Mandatory — used for Admin contact & WhatsApp updates'
                      : 'ಕಡ್ಡಾಯ — ಅಡ್ಮಿನ್ ಸಂಪರ್ಕ ಮತ್ತು WhatsAppಗಾಗಿ'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300">
                    {language === 'en' ? 'Email Address' : 'ಇಮೇಲ್ ವಿಳಾಸ'}{' '}
                    <span className="text-red-400">*</span>
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
                      className="block w-full pl-10 bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* LOGIN: Email or Phone */}
            {!isSignUp && (
              <div>
                <label className="block text-xs font-medium text-zinc-300">
                  {language === 'en' ? 'Email or Phone Number' : 'ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ'}{' '}
                  <span className="text-red-400">*</span>
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    {isPhoneIdentifier(loginId) ? (
                      <Phone className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder={
                      language === 'en'
                        ? 'name@example.com or 9886000000'
                        : 'ಇಮೇಲ್ ಅಥವಾ 9886000000'
                    }
                    className="block w-full pl-10 bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="mt-1 text-[10px] text-zinc-500">
                  {language === 'en'
                    ? 'You can sign in with either your registered email or mobile number'
                    : 'ನೋಂದಾಯಿತ ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯಿಂದ ಲಾಗಿನ್ ಮಾಡಿ'}
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300">
                {language === 'en' ? 'Password' : 'ಪಾಸ್‌ವರ್ಡ್'}{' '}
                <span className="text-red-400">*</span>
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
                  className="block w-full pl-10 bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] text-sm font-bold text-black bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isSignUp
                      ? language === 'en'
                        ? 'Create Account'
                        : 'ಖಾತೆ ರಚಿಸಿ'
                      : language === 'en'
                        ? 'Sign In to Dashboard'
                        : 'ಲಾಗಿನ್ ಮಾಡಿ'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setPassword('')
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
            >
              {isSignUp
                ? language === 'en'
                  ? 'Already have an account? Sign In'
                  : 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಲಾಗಿನ್ ಮಾಡಿ'
                : language === 'en'
                  ? 'New to Green Rewards? Register here'
                  : 'ಹೊಸ ಸದಸ್ಯರೇ? ಇಲ್ಲಿ ನೋಂದಾಯಿಸಿ'}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-zinc-600">
          {language === 'en'
            ? 'Phone number is mandatory for reward payouts & collection coordination.'
            : 'ಬಹುಮಾನ ಪಾವತಿ ಮತ್ತು ಸಂಗ್ರಹಣೆಗಾಗಿ ಫೋನ್ ಸಂಖ್ಯೆ ಕಡ್ಡಾಯ.'}
        </p>
      </div>
    </div>
  )
}
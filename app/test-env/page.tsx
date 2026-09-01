export default function TestEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl mb-4">Environment Variables Test</h1>
      <div className="space-y-2">
        <p>URL: {url ? '✅ Set' : '❌ Not Set'}</p>
        <p>Key: {key ? '✅ Set' : '❌ Not Set'}</p>
        {url && <p className="text-green-500">{url}</p>}
        {key && <p className="text-green-500">{key.substring(0, 30)}...</p>}
      </div>
    </div>
  )
}
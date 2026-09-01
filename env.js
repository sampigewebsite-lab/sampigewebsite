const dotenv = require('dotenv')
dotenv.config({ path: '.env.local' })

console.log('Loading environment variables...')
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
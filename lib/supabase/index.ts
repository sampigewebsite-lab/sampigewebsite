@'
export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient } from './server'
export { supabaseAdmin } from './admin'
'@ | Out-File -Encoding utf8 lib\supabase\index.ts
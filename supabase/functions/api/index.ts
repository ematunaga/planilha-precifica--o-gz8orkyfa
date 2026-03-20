import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized. Bearer token required.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const token = authHeader.replace('Bearer ', '')

    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('token', token)
      .single()

    if (apiKeyError || !apiKeyData) {
      return new Response(JSON.stringify({ error: 'Invalid API Key' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Update last used at in background
    supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyData.id)
      .then()

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const resource = pathParts[pathParts.length - 1]

    if (req.method === 'GET') {
      switch (resource) {
        case 'products': {
          const { data, error } = await supabase.from('products').select('*')
          if (error) throw error
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        case 'pricing-sheets': {
          const { data, error } = await supabase.from('projects').select('*, pricing_items(*)')
          if (error) throw error
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        case 'proposals': {
          const { data, error } = await supabase.from('proposals').select('*')
          if (error) throw error
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        case 'users': {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, name, role, status, created_at, email_encrypted')
          if (error) throw error
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        default:
          return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
      }
    }

    if (req.method === 'POST') {
      if (resource === 'sync') {
        const body = await req.json()
        const usersToSync = body.users || []
        const results = []

        for (const u of usersToSync) {
          const email = u.email
          const password = u.password || 'TempPass123!'
          const name = u.name || 'User Sync'
          const role = u.role || 'Visualizador'

          const hashedPassword = await sha256(password)

          const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle()

          if (existingUser) {
            results.push({ email, status: 'skipped', message: 'User already exists' })
            continue
          }

          const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { name, role, status: 'Authorized' },
          })

          if (userError) {
            results.push({ email, status: 'error', message: userError.message })
          } else {
            // Trigger handles profile creation and email encryption. We append the password hash.
            await supabase
              .from('profiles')
              .update({
                password_hash: hashedPassword,
              })
              .eq('id', userData.user.id)

            results.push({ email, status: 'success', id: userData.user.id })
          }
        }

        return new Response(JSON.stringify({ synced: results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

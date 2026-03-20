import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, role, token, origin } = await req.json()

    if (!email || !token) {
      throw new Error('Email and token are required')
    }

    // Here you would integrate with an email provider like Resend, SendGrid, AWS SES, etc.
    // For demonstration and development purposes, we simulate sending the email
    // and log the invite link which you can find in the Edge Function logs.
    const inviteLink = `${origin}/register?token=${token}`
    console.log(`[Email Simulation] Sending invite to: ${email}`)
    console.log(`[Email Simulation] Role: ${role}`)
    console.log(`[Email Simulation] Link: ${inviteLink}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Convite enviado com sucesso.' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 to handle gracefully on client side
    })
  }
})

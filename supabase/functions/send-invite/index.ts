import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, role, token, origin } = await req.json()

    const platformUrl =
      origin || req.headers.get('origin') || 'https://leapit-precificacao.goskip.app'

    // In a real app, integrate an email provider like Resend or SendGrid here
    console.log(`[SIMULATED EMAIL] To: ${email}`)
    console.log(`[SIMULATED EMAIL] Subject: Convite para o Sistema de Precificação`)
    console.log(
      `[SIMULATED EMAIL] Body: Você foi convidado para participar como ${role}. Acesse para registrar sua conta: ${platformUrl}/register?token=${token}`,
    )

    return new Response(
      JSON.stringify({ success: true, message: `Convite enviado para ${email}` }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 400,
    })
  }
})

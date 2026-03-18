import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async () => {
  return new Response(JSON.stringify({ message: 'Dummy function to satisfy Supabase CLI' }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

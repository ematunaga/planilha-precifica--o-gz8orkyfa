import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import * as XLSX from 'npm:xlsx@0.18.5'
import { Buffer } from 'node:buffer'
import pdf from 'npm:pdf-parse@1.1.1'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) throw new Error('Nenhum arquivo enviado')

    const arrayBuffer = await file.arrayBuffer()
    const fileName = file.name.toLowerCase()

    let headers: string[] = []
    let rows: any[][] = []

    if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][]

      if (json.length > 0) {
        headers = (json[0] || []).map((h: any) => String(h).trim())
        rows = json
          .slice(1)
          .map((row: any) => {
            const normalizedRow = new Array(headers.length).fill('')
            row.forEach((cell: any, i: number) => {
              if (i < headers.length) normalizedRow[i] = String(cell).trim()
            })
            return normalizedRow
          })
          .filter((row: any) => row.some((cell: any) => cell !== ''))
      }
    } else if (fileName.endsWith('.pdf')) {
      const pdfData = await pdf(Buffer.from(arrayBuffer))
      const lines = pdfData.text
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0)

      if (lines.length > 0) {
        const splitLine = (line: string) =>
          line
            .split(/\s{2,}|\t/)
            .map((c: string) => c.trim())
            .filter((c: string) => c)
        headers = splitLine(lines[0])
        rows = lines
          .slice(1)
          .map((l: string) => {
            const cols = splitLine(l)
            const normalized = new Array(headers.length).fill('')
            cols.forEach((c: string, i: number) => {
              if (i < headers.length) normalized[i] = c
            })
            return normalized
          })
          .filter((row: string[]) => row.some((cell: string) => cell !== ''))
      }
    } else {
      const text = new TextDecoder().decode(arrayBuffer)
      if (text.includes('\x00'))
        throw new Error('Arquivo binário inválido. Utilize .xlsx, .xls, .csv ou .pdf.')
      const lines = text.split(/\r?\n/).filter((l) => l.trim())
      if (lines.length > 0) {
        const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ','
        headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''))
        rows = lines
          .slice(1)
          .map((l) => l.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, '')))
      }
    }

    if (!headers.length && !rows.length) {
      throw new Error('Não foi possível extrair dados tabulares do arquivo.')
    }

    return new Response(JSON.stringify({ headers, rows }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

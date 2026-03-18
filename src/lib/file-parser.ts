import { supabase } from '@/lib/supabase/client'

export async function parseFile(file: File) {
  const isCsvOrTxt =
    file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.txt')

  if (isCsvOrTxt) {
    const text = await file.text()
    if (text.includes('\x00')) throw new Error('Arquivo binário inválido. Utilize .csv ou texto.')
    const lines = text.split(/\r?\n/).filter((l) => l.trim())
    if (lines.length < 1) throw new Error('Arquivo vazio ou sem dados tabulares.')
    const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ','
    const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''))
    const rows = lines
      .slice(1)
      .map((l) => l.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, '')))
    return { headers, rows }
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token

  const formData = new FormData()
  formData.append('file', file)

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-file`
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (res.status === 404) {
    throw new Error(
      'O serviço de extração de Excel/PDF não está disponível no momento. Por favor, salve o arquivo como CSV e tente novamente.',
    )
  }

  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'Erro ao processar arquivo')
  if (!result.headers || !result.rows || result.rows.length === 0) {
    throw new Error('Nenhum dado válido encontrado no arquivo.')
  }

  return { headers: result.headers, rows: result.rows }
}

export const parseNumber = (val: string | number | undefined, defaultVal = 0): number => {
  if (val === undefined || val === null || val === '') return defaultVal
  if (typeof val === 'number') return val
  let clean = val.toString().replace(/[R$%\s]/g, '')
  if (clean.includes(',') && clean.includes('.')) {
    clean = clean.replace(/\./g, '').replace(',', '.')
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.')
  }
  const parsed = parseFloat(clean)
  return isNaN(parsed) ? defaultVal : parsed
}

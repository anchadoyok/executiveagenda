const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const MAX_PDF_BYTES = 12 * 1024 * 1024

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    date: { type: 'string', description: 'ISO date yyyy-mm-dd' },
    startTime: { type: 'string', description: 'HH:mm 24-hour' },
    endTime: { type: 'string', description: 'HH:mm 24-hour or empty' },
    location: { type: 'string' },
    accessDetails: {
      type: 'string',
      description: 'Link video conference + meeting ID/password if any',
    },
    meetingType: {
      type: 'string',
      enum: ['Luring', 'Daring', 'Hybrid'],
    },
    description: { type: 'string' },
  },
  required: ['title'],
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file PDF.'))
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Format file tidak dikenali.'))
        return
      }
      const base64 = result.split(',')[1] ?? ''
      resolve(base64)
    }
    reader.readAsDataURL(file)
  })
}

function sanitizeTime(value) {
  if (typeof value !== 'string') return ''
  const match = value.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return ''
  const hh = String(Math.min(23, Math.max(0, Number(match[1])))).padStart(2, '0')
  const mm = String(Math.min(59, Math.max(0, Number(match[2])))).padStart(2, '0')
  return `${hh}:${mm}`
}

function sanitizeDate(value) {
  if (typeof value !== 'string') return ''
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : ''
}

function sanitizeMeetingType(value) {
  if (value === 'Luring' || value === 'Daring' || value === 'Hybrid') {
    return value
  }
  return ''
}

function buildPrompt(profile) {
  const timezone = profile?.settings?.defaultTimezone ?? 'Asia/Jakarta'
  return [
    'Anda adalah asisten yang mengekstrak agenda/undangan dari dokumen PDF.',
    'Keluarkan SATU agenda utama dalam bentuk JSON dengan schema yang diberikan.',
    'Aturan:',
    '- Bahasa Indonesia.',
    `- Zona waktu default untuk jam: ${timezone}. Tidak perlu tuliskan offset.`,
    '- "date" format yyyy-mm-dd. Kalau dokumen cuma bilang "besok"/"hari ini", biarkan kosong.',
    '- "startTime"/"endTime" format HH:mm 24-jam. Kosongkan kalau tidak jelas.',
    '- "meetingType": "Daring" kalau hanya link vicon, "Luring" kalau cuma alamat fisik, "Hybrid" kalau dua-duanya.',
    '- "accessDetails": gabungan link Zoom/Meet/Teams + meeting ID + password kalau ada.',
    '- "location": alamat fisik lengkap (termasuk nama ruangan/gedung).',
    '- "description": ringkasan singkat maksud acara, termasuk penyelenggara & dress code kalau disebut.',
    '- "title": nama resmi kegiatan.',
    'Kalau suatu field tidak ada di PDF, isi string kosong.',
  ].join('\n')
}

export async function parseAgendaFromPdf({ file, apiKey, profile }) {
  if (!apiKey) {
    throw new Error('Gemini API key belum diisi di Settings profil.')
  }
  if (!file) {
    throw new Error('File PDF belum dipilih.')
  }
  if (file.type && file.type !== 'application/pdf') {
    throw new Error('File harus PDF.')
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error('Ukuran PDF melebihi 12 MB.')
  }

  const base64 = await fileToBase64(file)

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: base64 } },
          { text: buildPrompt(profile) },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.2,
    },
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    let message = `Gemini API error (${response.status}).`
    try {
      const errorPayload = await response.json()
      if (errorPayload?.error?.message) {
        message = `Gemini: ${errorPayload.error.message}`
      }
    } catch (err) {
      console.warn('Failed to parse Gemini error response', err)
    }
    throw new Error(message)
  }

  const payload = await response.json()
  const text =
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('') ?? ''

  if (!text) {
    throw new Error('Gemini tidak mengembalikan data. Coba PDF lain.')
  }

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch (err) {
    console.warn('Gemini JSON parse failed', err, text)
    throw new Error('Format respons Gemini tidak valid.')
  }

  return {
    title: typeof parsed.title === 'string' ? parsed.title.trim() : '',
    date: sanitizeDate(parsed.date),
    startTime: sanitizeTime(parsed.startTime),
    endTime: sanitizeTime(parsed.endTime),
    location: typeof parsed.location === 'string' ? parsed.location.trim() : '',
    accessDetails:
      typeof parsed.accessDetails === 'string' ? parsed.accessDetails.trim() : '',
    meetingType: sanitizeMeetingType(parsed.meetingType),
    description:
      typeof parsed.description === 'string' ? parsed.description.trim() : '',
  }
}

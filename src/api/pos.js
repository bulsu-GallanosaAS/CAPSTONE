// Lightweight POS API client. Configure base URL via Vite env: VITE_POS_BASE_URL

const baseUrl = import.meta?.env?.VITE_POS_BASE_URL || ''

function getHeaders(apiKey) {
  const headers = { 'Content-Type': 'application/json' }
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`
  return headers
}

export async function createRefillRequest(payload, options = {}) {
  if (!baseUrl) {
    return { ok: false, skipped: true, error: 'POS base URL not configured' }
  }
  const apiKey = options.apiKey || import.meta?.env?.VITE_POS_API_KEY
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/refill-requests`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => null)
    return { ok: res.ok, status: res.status, data }
  } catch (error) {
    return { ok: false, error: error?.message || 'Network error' }
  }
}

export async function getTableTimer(tableCode, options = {}) {
  if (!baseUrl) return { ok: false, skipped: true, error: 'POS base URL not configured' }
  const apiKey = options.apiKey || import.meta?.env?.VITE_POS_API_KEY
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/tables/${encodeURIComponent(tableCode)}/timer`, {
      headers: getHeaders(apiKey),
    })
    const data = await res.json().catch(() => null)
    return { ok: res.ok, status: res.status, data }
  } catch (error) {
    return { ok: false, error: error?.message || 'Network error' }
  }
}

export function isPosConfigured() {
  return Boolean(baseUrl)
}


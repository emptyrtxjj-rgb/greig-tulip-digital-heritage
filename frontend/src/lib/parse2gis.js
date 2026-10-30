const GIS_HOST = /(^|\.)2gis\.(kz|com|ru)$/i

const CITY_LABELS = {
  shymkent: { kz: 'Шымкент', ru: 'Шымкент', en: 'Shymkent' },
  turkestan: { kz: 'Түркістан', ru: 'Туркестан', en: 'Turkistan' },
  turkistan: { kz: 'Түркістан', ru: 'Туркестан', en: 'Turkistan' },
  taraz: { kz: 'Тараз', ru: 'Тараз', en: 'Taraz' },
  almaty: { kz: 'Алматы', ru: 'Алматы', en: 'Almaty' },
  astana: { kz: 'Астана', ru: 'Астана', en: 'Astana' },
  kyzylorda: { kz: 'Қызылорда', ru: 'Кызылорда', en: 'Kyzylorda' },
  shyymkent: { kz: 'Шымкент', ru: 'Шымкент', en: 'Shymkent' },
}

function validCoord(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

function pairFromText(text) {
  const match = String(text || '').match(/(-?\d+(?:\.\d+)?)[,/_%2C]+(-?\d+(?:\.\d+)?)/i)
  if (!match) return null
  return [Number(match[1]), Number(match[2])]
}

export function cityLabel(city, lang = 'kz') {
  const key = String(city || '').toLowerCase()
  if (CITY_LABELS[key]) return CITY_LABELS[key][lang] || CITY_LABELS[key].kz
  if (!key) return { kz: 'Қосылған мекен', ru: 'Добавленное место', en: 'Added place' }[lang]
  return key.charAt(0).toUpperCase() + key.slice(1)
}

export function parse2gisUrl(input) {
  let trimmed = String(input || '').trim()
  if (!trimmed) return { error: 'empty' }
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) trimmed = `https://${trimmed}`

  let url
  try {
    url = new URL(trimmed)
  } catch {
    return { error: 'invalid' }
  }

  const host = url.hostname.replace(/^www\./i, '')
  if (host === 'go.2gis.com') return { error: 'short' }
  if (!GIS_HOST.test(host)) return { error: 'not_2gis' }

  const path = decodeURIComponent(url.pathname)
  const city = path.split('/').filter(Boolean)[0] && !/^(firm|geo)$/i.test(path.split('/').filter(Boolean)[0])
    ? path.split('/').filter(Boolean)[0]
    : ''

  const pathPair = path.match(/\/(?:firm|geo)\/[^/]+\/(-?\d+(?:\.\d+)?)[,/](-?\d+(?:\.\d+)?)/i)
    || path.match(/\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\/?$/)

  let lng
  let lat
  if (pathPair) {
    lng = Number(pathPair[1])
    lat = Number(pathPair[2])
  }

  if (!validCoord(lat, lng)) {
    const fromMap = pairFromText(url.searchParams.get('m'))
    if (fromMap) {
      lng = fromMap[0]
      lat = fromMap[1]
    }
  }

  if (validCoord(lat, lng) && Math.abs(lng) < 50 && Math.abs(lat) > 50) {
    const swapped = [lng, lat]
    lng = swapped[1]
    lat = swapped[0]
  }

  if (!validCoord(lat, lng)) return { error: 'coords' }

  return { lat, lng, city, url: url.toString() }
}

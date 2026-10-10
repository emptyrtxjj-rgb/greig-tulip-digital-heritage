/**
 * Localization consistency check.
 *
 * Loads the locale dictionary and every localized data module through Vite, then verifies that:
 *  - kz / ru / en dictionaries expose the same key structure (no missing translations);
 *  - every localized record ({ kz, ru, en }) provides all three languages;
 *  - English strings contain no Cyrillic, Russian strings contain no Kazakh-specific letters
 *    and no Latin words outside an allow-list of proper names / scientific terms,
 *    and Kazakh strings contain no Latin words outside the same allow-list.
 *
 * Usage: npm run check:i18n
 */
import { createServer } from 'vite'

// Proper names, scientific names, licences, codes and brands that are legitimately written in Latin script.
const latinAllowList = [
  'Tulipa', 'greigii', 'Regel', 'L', 'Liliaceae', 'Gartenflora', 'CC', 'BY', 'SA', 'BY-SA', 'WebP', 'IPNI', 'POWO', 'Kew', 'IUCN',
  'Public', 'Domain', 'Mark', 'OpenStreetMap', 'OSM', 'Wikimedia', 'Commons', 'BHL', 'UNESCO', 'Greentours', 'Naturetrek',
  'Flora', 'of', 'the', 'Silk', 'Road', 'Basak', 'Chris', 'Gardner', 'Turczaninowia', 'PubMed', 'Central', 'Frontiers', 'Plant',
  'Science', 'P', 'N', 'E', 'API', 'Laravel', 'kosaraju', 'gov', 'kz', 'MNHN', 'PMC', 'TV', 'D', 'A', 'S', 'greigii×', 'GBIF',
  'iNaturalist', 'Plantarium', 'kaufmanniana', 'fosteriana', 'albertii', 'kolpakowskiana', 'ostrowskiana', 'regelii', 'tarda',
  'sp', 'subsp', 'var', 'cv', 'et', 'al', 'ex', 'nom', 'nud', 'syn', 'Herb', 'LE', 'K', 'Botanic', 'Garden', 'Royal', 'Gardens',
  'karatavica', 'altaica', 'typica', 'krauseana', 'aurea', 'Tubergen', 'Boroldai', 'Turkestan', 'Samuel', 'Greig', 'XIX', 'Least', 'Concern', 'in', 'Unsplash',
]
const allowed = new Set(latinAllowList.map(word => word.toLowerCase()))
const kazakhLetters = /[ӘәҒғҚқҢңӨөҰұҮүҺһІі]/
const cyrillic = /[\u0400-\u04FF]/
const latinWords = text => (text.replace(/https?:\/\/\S+/g, '').match(/[A-Za-z][A-Za-z’'.-]*/g) ?? [])
  .map(word => word.replace(/[’'.-]+$/g, ''))
  .filter(word => word.length > 0 && !allowed.has(word.toLowerCase()))

const problems = []
const report = (path, message, text) => problems.push(`${path}: ${message}${text ? `\n    «${String(text).slice(0, 160)}»` : ''}`)

const checkString = (path, lang, text) => {
  if (typeof text !== 'string') return
  if (lang === 'en' && cyrillic.test(text)) report(path, 'Cyrillic text in English string', text)
  if (lang === 'ru' && kazakhLetters.test(text)) report(path, 'Kazakh letters in Russian string', text)
  if (lang === 'ru' || lang === 'kz') {
    const words = latinWords(text)
    if (words.length) report(path, `Latin words in ${lang} string: ${[...new Set(words)].join(', ')}`, text)
  }
}

const walkLocalized = (value, path) => {
  if (Array.isArray(value)) return value.forEach((item, index) => walkLocalized(item, `${path}[${index}]`))
  if (!value || typeof value !== 'object') return
  const keys = Object.keys(value)
  if (keys.includes('kz') || keys.includes('ru') || keys.includes('en')) {
    for (const lang of ['kz', 'ru', 'en']) {
      if (!(lang in value)) report(path, `missing "${lang}" translation`)
      else if (typeof value[lang] === 'string') {
        if (!value[lang].trim()) report(path, `empty "${lang}" translation`)
        checkString(`${path}.${lang}`, lang, value[lang])
      } else walkInLanguage(value[lang], `${path}.${lang}`, lang)
    }
    return
  }
  for (const key of keys) walkLocalized(value[key], `${path}.${key}`)
}

const walkInLanguage = (value, path, lang) => {
  if (typeof value === 'string') return checkString(path, lang, value)
  if (Array.isArray(value)) return value.forEach((item, index) => walkInLanguage(item, `${path}[${index}]`, lang))
  if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) walkInLanguage(item, `${path}.${key}`, lang)
}

const shape = (value, prefix = '') => {
  if (Array.isArray(value)) return [`${prefix}[${value.length}]`, ...value.flatMap((item, index) => shape(item, `${prefix}[${index}]`))]
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, item]) => shape(item, prefix ? `${prefix}.${key}` : key))
  return [prefix]
}

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { locales, localeOrder } = await server.ssrLoadModule('/src/locales/index.js')
  const shapes = Object.fromEntries(localeOrder.map(lang => [lang, new Set(shape(locales[lang]))]))
  for (const lang of localeOrder) {
    for (const key of shapes.kz) if (!shapes[lang].has(key)) report(`locales.${lang}`, `missing key ${key}`)
    for (const key of shapes[lang]) if (!shapes.kz.has(key)) report(`locales.kz`, `missing key ${key} (present in ${lang})`)
    const { html, label, short, ...rest } = locales[lang]
    walkInLanguage(rest, `locales.${lang}`, lang)
  }

  const modules = {
    collections: '/src/data/collections.js', exhibitNarratives: '/src/data/exhibitNarratives.js',
    reviews: '/src/data/reviews.js', media: '/src/data/media.js', facts: '/src/data/facts.js', timeline: '/src/data/timeline.js',
  }
  for (const [name, path] of Object.entries(modules)) {
    const module = await server.ssrLoadModule(path)
    for (const [exportName, value] of Object.entries(module)) {
      if (typeof value === 'function') continue
      walkLocalized(value, `${name}.${exportName}`)
    }
  }
  const { sourceRecords, sourceTitle, sourceAuthor } = await server.ssrLoadModule('/src/data/collections.js')
  for (const record of sourceRecords) {
    for (const lang of localeOrder) {
      checkString(`sourceTitle(${record.id}).${lang}`, lang, sourceTitle(record, lang))
      checkString(`sourceAuthor(${record.id}).${lang}`, lang, sourceAuthor(record, lang))
    }
  }
} finally {
  await server.close()
}

if (problems.length) {
  console.log(`Localization check found ${problems.length} issue(s):\n`)
  console.log(problems.join('\n'))
  process.exitCode = 1
} else {
  console.log('Localization check passed: all locales are complete and free of mixed-language strings.')
}

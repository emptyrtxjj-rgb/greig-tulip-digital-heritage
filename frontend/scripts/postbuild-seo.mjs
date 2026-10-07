import { rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const outputDirectory = resolve('dist')
const configuredSite = (process.env.VITE_SITE_URL || '').trim()
const publicRoutes = [
  '/', '/malimetter', '/history', '/timeline', '/map', '/science', '/heritage',
  '/ecology', '/media', '/shymkent', '/silk-road', '/sources', '/about',
]

await writeFile(resolve(outputDirectory, 'robots.txt'), 'User-agent: *\nAllow: /\n', 'utf8')

if (!configuredSite) {
  await rm(resolve(outputDirectory, 'sitemap.xml'), { force: true })
  process.stdout.write('VITE_SITE_URL is empty; no sitemap was emitted for an unknown domain.\n')
  process.exit(0)
}

let site
try { site = new URL(configuredSite) } catch { throw new Error('VITE_SITE_URL must be a valid absolute URL.') }
if (!['http:', 'https:'].includes(site.protocol)) throw new Error('VITE_SITE_URL must use HTTP or HTTPS.')
const origin = site.origin.replace(/\/$/, '')
const entries = publicRoutes.map(path => `  <url><loc>${origin}${path}</loc></url>`).join('\n')
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
await writeFile(resolve(outputDirectory, 'sitemap.xml'), xml, 'utf8')
await writeFile(resolve(outputDirectory, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`, 'utf8')

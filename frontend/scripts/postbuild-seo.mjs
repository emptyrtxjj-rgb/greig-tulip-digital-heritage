import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const outputDirectory = resolve('dist')
const configuredSite = (process.env.VITE_SITE_URL || '').trim()

const routeMeta = {
  '/places': {
    title: 'Оңтүстік Қазақстанның табиғи мекендері — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Грейг және Кауфман қызғалдақтарының жабайы популяциялары сақталған табиғи қорықтар мен тарихи шатқалдар.',
  },
  '/places/kazygurt': {
    title: 'Қазығұрт — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Киелі тау етегіндегі көктемгі жабайы қызғалдақтар жайқалатын табиғи аймақ.',
  },
  '/places/aqsu-zhabagly': {
    title: 'Ақсу-Жабағылы — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Қазақстанның тұңғыш биосфералық қорығы — Грейг қызғалдағының аса бай табиғи мекені.',
  },
  '/places/berkara': {
    title: 'Берікқара шатқалы — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Қаратаудың шығыс сілемдеріндегі сирек өсімдіктер мен Грейг қызғалдағы сақталған мемлекеттік қорықша.',
  },
  '/places/karatau': {
    title: 'Қаратау жотасы — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Грейг қызғалдағының негізгі табиғи отаны және эндемиктер орталығы.',
  },
  '/places/shubaykyzyl': {
    title: 'Шұбайқызыл (Қызыл төбе) — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Көктемде миллиондаған жабайы Грейг қызғалдағы алаулап гүлдейтін аңызға айналған орын.',
  },
  '/places/tulkibas': {
    title: 'Түлкібас аңғары — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Тау етегі мен құнарлы аңғарлары қызғалдақ кілеміне бөленетін көктемгі өлкенің жүрегі.',
  },
  '/places/turkistan': {
    title: 'Түркістан — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Ұлы Жібек жолы бойындағы рухани және тарихи орталық.',
  },
  '/places/shymkent': {
    title: 'Шымкент — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Оңтүстіктің ірі қаласы — қызғалдақты қалалық символы ретінде ардақтайтын орталық.',
  },
  '/malimetter': {
    title: 'Ғылыми анықтама — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Өсімдіктің атауы, таралуы, ерекшелігі мен қорғалуы жөніндегі деректерге шолу жасаңыз.',
  },
  '/history': {
    title: 'Қызғалдақтың тарихи шежіресі — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Грейг қызғалдағы туралы белгілі деректерді ретімен қарастырамыз.',
  },
  '/tarikh': {
    title: 'Қызғалдақтың тарихи шежіресі — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Грейг қызғалдағы туралы белгілі деректерді ретімен қарастырамыз.',
  },
  '/timeline': {
    title: 'Жылнама — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Өңір тарихы мен қызғалдақ туралы ғылыми жазбалар жылдар ретімен берілген.',
  },
  '/map': {
    title: 'Карта — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Оңтүстік Қазақстанның табиғи және мәдени нүктелерін бір картадан зерттеңіз.',
  },
  '/science': {
    title: 'Ғылыми зерттеу — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Өсімдіктің атауы, таралуы мен тіршілік ерекшелігі сенімді ботаникалық деректерге сүйеніп түсіндіріледі.',
  },
  '/heritage': {
    title: 'Мұраны қорғау — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Грейг қызғалдағы Қазақстанның Қызыл кітабына енгізілген.',
  },
  '/ecology': {
    title: 'Мұраны қорғау — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Грейг қызғалдағы Қазақстанның Қызыл кітабына енгізілген.',
  },
  '/media': {
    title: 'Галерея — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Галереядан Грейг қызғалдағының, Ақсу-Жабағылы мен Қаратау тауларының суреттерін көріңіз.',
  },
  '/gallery': {
    title: 'Галерея — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Галереядан Грейг қызғалдағының, Ақсу-Жабағылы мен Қаратау тауларының суреттерін көріңіз.',
  },
  '/silk-road': {
    title: 'Ұлы Жібек жолы — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Жібек жолы Оңтүстік Қазақстанның тарихын танытады.',
  },
  '/reviews': {
    title: 'Пікірлер — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Сапар жазбалары мен ботаникалық еңбектерден Оңтүстік Қазақстан табиғаты туралы деректер.',
  },
  '/sources': {
    title: 'Дереккөздер — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Ғылыми, ресми немесе архивтік дереккөздер жинағы.',
  },
  '/about': {
    title: 'Жоба туралы — Грейг қызғалдағы цифрлық шежіресі',
    desc: 'Грейг қызғалдағы арқылы туған өлкенің тарихы мен табиғатын танытатын сандық көрме.',
  },
}

const publicRoutes = ['/', ...Object.keys(routeMeta)]

// Generate static HTML files for every route so any direct navigation never hits 404
const baseHtmlPath = resolve(outputDirectory, 'index.html')
try {
  const baseHtml = await readFile(baseHtmlPath, 'utf8')
  for (const [routePath, meta] of Object.entries(routeMeta)) {
    const cleanPath = routePath.replace(/^\//, '')
    const targetDir = resolve(outputDirectory, cleanPath)
    await mkdir(targetDir, { recursive: true })

    let routeHtml = baseHtml
    if (meta.title) {
      routeHtml = routeHtml.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`)
      routeHtml = routeHtml.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${meta.title}" />`)
      routeHtml = routeHtml.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${meta.title}" />`)
    }
    if (meta.desc) {
      routeHtml = routeHtml.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${meta.desc}" />`)
      routeHtml = routeHtml.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${meta.desc}" />`)
      routeHtml = routeHtml.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${meta.desc}" />`)
    }

    // Write both dist/<route>/index.html and dist/<route>.html for maximum host compatibility
    await writeFile(resolve(targetDir, 'index.html'), routeHtml, 'utf8')
    await writeFile(resolve(outputDirectory, `${cleanPath}.html`), routeHtml, 'utf8')
  }
} catch (err) {
  process.stderr.write(`Warning during static route generation: ${err.message}\n`)
}

// Ensure vercel.json is present in dist
const vercelConfig = JSON.stringify({
  version: 2,
  cleanUrls: true,
  trailingSlash: false,
  rewrites: [{ source: '/(.*)', destination: '/index.html' }],
}, null, 2)
await writeFile(resolve(outputDirectory, 'vercel.json'), vercelConfig, 'utf8')

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

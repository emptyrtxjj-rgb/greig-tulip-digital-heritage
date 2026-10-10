import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Menu, X, Flower2, Leaf, BookOpen, MapPinned, Sparkles } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './reviews.css'
import { locales, localeOrder } from './locales/index.js'
import { LocaleContext, useLocale } from './locales/context.js'
import { navItems, places, sourceRecords, sourceTitle, sourceAuthor, timeline, mediaItems } from './data/collections.js'
import { facts } from './data/facts.js'
import { exhibitNarratives } from './data/exhibitNarratives.js'
import { reviews, curatorNote } from './data/reviews.js'
import { mediaItems as photoAssets } from './data/media.js'
import { MapTeaser, TimelineStrip, TimelineExplorer, SourceCards, ImageMosaic } from './components/MuseumModules.jsx'
import { FactExplorer } from './components/FactExplorer.jsx'
import { RouteBreadcrumbs, SiteUtilities } from './components/SiteUtilities.jsx'

const MuseumMapView = lazy(() => import('./components/MapExperience.jsx').then(module => ({ default: module.MuseumMap })))

gsap.registerPlugin(ScrollTrigger)
function LanguagePicker({ small = false }) {
  const { lang, setLang } = useLocale()
  return <div className={`language-picker ${small ? 'language-picker-small' : ''}`} role="group" aria-label={lang === 'kz' ? 'Тіл' : lang === 'ru' ? 'Язык' : 'Language'}>
    {localeOrder.map(code => <button key={code} type="button" onClick={() => setLang(code)} aria-pressed={lang === code}>{lang === 'kz' ? ({ kz: 'ҚАЗ', ru: 'ОРЫС', en: 'АҒЫЛШЫН' })[code] : locales[code].short}</button>)}
  </div>
}

function Header() {
  const { lang, t } = useLocale()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32)
    update(); window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  useEffect(() => setMobileOpen(false), [location.pathname])
  const primary = navItems.slice(0, 6)
  const extra = navItems.slice(6)
  return <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="header-inner">
      <Link className="brand" to="/" aria-label={lang === 'kz' ? 'Грейг қызғалдағы цифрлық шежіресі · басты бет' : lang === 'ru' ? 'Цифровая летопись тюльпана Грейга · главная' : 'Greig tulip digital chronicle home'}>
        <span className="brand-symbol"><Flower2 size={25} strokeWidth={1.55}/></span>
        <span className="brand-copy"><strong>{lang === 'kz' ? 'ГРЕЙГ' : lang === 'ru' ? 'ГРЕЙГ' : 'GREIG'}</strong><small>{lang === 'kz' ? 'ӨЛКЕНІҢ ЦИФРЛЫҚ ШЕЖІРЕСІ' : lang === 'ru' ? 'ЦИФРОВАЯ ЛЕТОПИСЬ КРАЯ' : 'DIGITAL REGIONAL CHRONICLE'}</small></span>
      </Link>
      <nav className="desktop-nav" aria-label={lang === 'kz' ? 'Негізгі навигация' : lang === 'ru' ? 'Основная навигация' : 'Main navigation'}>
        <NavLink to="/" end className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t.nav.home}</NavLink>
        {primary.map(item => <NavLink key={item.id} to={item.to} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t.nav[item.id]}</NavLink>)}
        <details className="nav-more"><summary>{t.nav.more}<span aria-hidden="true">⌄</span></summary><div className="nav-dropdown">{extra.map(item => <NavLink key={item.id} to={item.to}>{t.nav[item.id]}</NavLink>)}<NavLink to="/places">{lang === 'kz' ? 'Мекендер' : lang === 'ru' ? 'Места' : 'Habitats'}</NavLink><NavLink to="/silk-road">{lang === 'kz' ? 'Ұлы Жібек жолы' : lang === 'ru' ? 'Шёлковый путь' : 'Silk Roads'}</NavLink><NavLink to="/about">{lang === 'kz' ? 'Жоба туралы' : lang === 'ru' ? 'О проекте' : 'About'}</NavLink></div></details>
      </nav>
      <div className="header-tools"><LanguagePicker/><button className="mobile-menu-button" onClick={() => setMobileOpen(v => !v)} aria-label={mobileOpen ? t.common.close : t.common.menu} aria-expanded={mobileOpen}>{mobileOpen ? <X/> : <Menu/>}</button></div>
    </div>
    {mobileOpen && <nav className="mobile-nav" aria-label={lang === 'kz' ? 'Мобильді навигация' : lang === 'ru' ? 'Мобильная навигация' : 'Mobile navigation'}>
      <NavLink to="/" end>{t.nav.home}</NavLink>{navItems.map(item => <NavLink key={item.id} to={item.to}>{t.nav[item.id]}</NavLink>)}
      <NavLink to="/places">{lang === 'kz' ? 'Мекендер' : lang === 'ru' ? 'Места' : 'Habitats'}</NavLink>
      <NavLink to="/silk-road">{lang === 'kz' ? 'Ұлы Жібек жолы' : lang === 'ru' ? 'Шёлковый путь' : 'Silk Roads'}</NavLink><NavLink to="/about">{lang === 'kz' ? 'Жоба туралы' : lang === 'ru' ? 'О проекте' : 'About'}</NavLink>
      <LanguagePicker small/>
    </nav>}
  </header>
}

function Footer() {
  const { lang, t } = useLocale()
  const footerLinks = ['history', 'timeline', 'map', 'heritage', 'science', 'shymkent', 'media', 'reviews', 'sources']
  return <footer className="site-footer">
    <div className="footer-top"><span className="eyebrow">{t.common.curated}</span><h2>{t.footer.title}</h2><p>{t.footer.body}</p>
      <Link className="button button-light" to="/">{t.footer.restart}<ArrowRight size={17}/></Link>
      <a className="footer-photo-credit" href="https://commons.wikimedia.org/wiki/File:Tulipa_greigii_(Aksu_Zhabagly_Nature_Reserve,_Kazakhstan).png" target="_blank" rel="noreferrer">{lang === 'kz' ? 'Сурет: В. А. Ковшар · CC BY-SA 4.0 ашық лицензиясы · сайтқа лайықталып ықшамдалған' : lang === 'ru' ? 'Фото: В. А. Ковшар · CC BY-SA 4.0 · формат и размер адаптированы для сайта' : 'Photo: V. A. Kovshar · CC BY-SA 4.0 · resized and converted to WebP'}</a>
    </div>
    <div className="footer-bottom"><Link to="/" className="footer-brand"><Flower2 size={21}/><span>{lang === 'kz' ? 'ГРЕЙГ' : lang === 'ru' ? 'ГРЕЙГ' : 'GREIG'}<br/><small>{lang === 'kz' ? 'ӨЛКЕМНІҢ ЦИФРЛЫҚ ШЕЖІРЕСІ' : lang === 'ru' ? 'ЦИФРОВАЯ ЛЕТОПИСЬ КРАЯ' : 'DIGITAL REGIONAL CHRONICLE'}</small></span></Link>
      <div className="footer-links">{footerLinks.map(id => <Link key={id} to={navItems.find(item => item.id === id)?.to ?? `/${id}`}>{t.nav[id]}</Link>)}<Link to="/places">{lang === 'kz' ? 'Мекендер' : lang === 'ru' ? 'Места' : 'Habitats'}</Link><Link to="/silk-road">{lang === 'kz' ? 'Ұлы Жібек жолы' : lang === 'ru' ? 'Шёлковый путь' : 'Silk Roads'}</Link><Link to="/about">{lang === 'kz' ? 'Жоба туралы' : lang === 'ru' ? 'О проекте' : 'About'}</Link></div>
      <LanguagePicker small/>
      <p className="copyright">© 2026 · {t.footer.note}</p>
    </div>
  </footer>
}

function HomePage() {
  const { lang, t } = useLocale()
  const h = t.home
  const greigPhoto = photoAssets.find(item => item.id === 'solo-greig-photo') || photoAssets[0]
  return <>
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-image" aria-hidden="true"/><div className="hero-shade" aria-hidden="true"/>
        <div className="hero-content page-wrap">
          <p className="eyebrow hero-eyebrow"><span className="eyebrow-line"/>{h.eyebrow}</p>
          <h1 id="hero-title">{h.titleA}<br/><em>{h.titleB}</em></h1>
          <p className="hero-subheading">{h.subheading}</p><p className="hero-species">{h.species}</p>
          <p className="hero-intro">{h.intro}</p>
          <div className="hero-actions"><Link className="button button-primary" to="/history">{h.discover}<ArrowUpRight size={17}/></Link><Link className="button button-ghost" to="/heritage"><span className="button-orbit">✳</span>{h.seeNature}</Link></div>
        </div>
        <div className="hero-note"><span>{lang === 'kz' ? 'ТАРИХИ МҰРА' : lang === 'ru' ? 'ИСТОРИЧЕСКОЕ НАСЛЕДИЕ' : 'HISTORY LEGACY'}</span></div>
        <a className="hero-photo-credit" href="https://commons.wikimedia.org/wiki/File:Tulipa_greigii_(Aksu_Zhabagly_Nature_Reserve,_Kazakhstan).png" target="_blank" rel="noreferrer">{lang === 'kz' ? 'Сурет: В. А. Ковшар · Уикимедиа ашық қоры · CC BY-SA 4.0' : lang === 'ru' ? 'Фото: В. А. Ковшар · Wikimedia Commons · CC BY-SA 4.0' : 'Photo: V. A. Kovshar · Wikimedia Commons · CC BY-SA 4.0'}</a>
        <a className="hero-scroll" href="#introduction" aria-label={lang === 'kz' ? 'Кіріспеге өту' : lang === 'ru' ? 'Перейти к введению' : 'Scroll to introduction'}><ArrowDownRight size={18}/></a>
        <span className="hero-number" aria-hidden="true">01</span>
      </section>

      <section className="intro-section page-wrap" id="introduction" data-reveal>
        <div className="section-index"><span>{lang === 'kz' ? 'ӨЛКЕМНІҢ ШЕЖІРЕСІ' : lang === 'ru' ? 'ЛЕТОПИСЬ КРАЯ' : 'REGIONAL CHRONICLE'}</span><b>01 — 05</b></div>
        <div className="intro-content"><span className="eyebrow">{h.journey}</span><h2>{h.quote}</h2><p>{h.journeyBody}</p><Link className="text-link" to="/timeline">{t.common.timeline}<ArrowRight size={17}/></Link></div>
        <div className="journey-line" aria-label={h.steps.join(' to ')}>{h.steps.map((step, i) => <div key={step} className={`journey-step ${i === 0 ? 'step-active' : ''}`}><span className="journey-node">{String(i + 1).padStart(2, '0')}</span><span>{step}</span>{i < h.steps.length - 1 && <i/>}</div>)}</div>
      </section>

      <section className="specimen-band" data-reveal>
        <div className="specimen-art"><img src="/images/solo-greig-photo.jpeg" srcSet={greigPhoto.srcSet} sizes="(max-width: 700px) 100vw, 50vw" alt={lang === 'kz' ? 'Грейг қызғалдағының макро тостағаны' : lang === 'ru' ? 'Макросъёмка цветка тюльпана Грейга' : 'Macro bloom of Greig’s tulip'} loading="lazy" decoding="async"/><a className="art-index" href="https://commons.wikimedia.org/wiki/File:Tulipa_greigii_(Aksu_Zhabagly_Nature_Reserve,_Kazakhstan).png" target="_blank" rel="noreferrer">SOLO-GREIG-PHOTO · FREE LICENSE</a></div>
        <div className="specimen-copy"><span className="eyebrow"><i>Tulipa greigii</i> Regel</span><h2>{h.specimen}</h2><p>{h.specimenBody}</p><div className="specimen-facts"><div><span>01</span><b>{lang === 'kz' ? 'Ғылыми атауы' : lang === 'ru' ? 'Название вида' : 'Species name'}</b><i>{lang === 'kz' ? 'Грейг қызғалдағы' : 'Tulipa greigii'}</i></div><div><span>02</span><b>{lang === 'kz' ? 'Таралу аймағы' : lang === 'ru' ? 'Ареал' : 'Native range'}</b><i>{lang === 'kz' ? 'Орталық Азия' : lang === 'ru' ? 'Центральная Азия' : 'Central Asia'}</i></div><div><span>03</span><b>{lang === 'kz' ? 'Алғаш жарияланған жылы' : lang === 'ru' ? 'Первая публикация' : 'First published'}</b><i>1873</i></div></div><Link className="button button-primary specimen-btn" to="/science">{t.common.explore}<ArrowRight size={17}/></Link></div>
      </section>

      <section className="home-facts page-wrap" data-reveal><div className="block-heading"><div><span className="eyebrow">01 · {lang === 'kz' ? 'ДӘЛЕЛДІ ДЕРЕКТЕР' : lang === 'ru' ? 'ФАКТЫ С ИСТОЧНИКАМИ' : 'FACTS WITH SOURCES'}</span><h2>{lang === 'kz' ? 'Грейг қызғалдағы туралы деректер' : lang === 'ru' ? 'Почему этот цветок важен?' : 'Why does this flower matter?'}</h2><p>{t.pages.facts.lead}</p></div><Link className="text-link" to="/malimetter">{t.nav.encyclopedia}<ArrowRight size={17}/></Link></div><FactExplorer limit={3}/></section>

      <NaturePhotoPreview/>

      <section className="story-section page-wrap" data-reveal>
        <div className="story-copy"><span className="eyebrow">{lang === 'kz' ? 'ТАРИХИ МҰРА' : lang === 'ru' ? 'СЛЕД РАСТЕНИЯ' : 'A PLANT’S TRACE'}</span><h2>{h.story}</h2><p>{h.storyBody}</p><Link className="text-link" to="/history">{t.common.read}<ArrowRight size={17}/></Link></div>
        <div className="story-quote"><div className="quote-mark">“</div><p>{lang === 'kz' ? 'Туған жердің тарихы дерекке үңілгенде тереңдей түседі.' : lang === 'ru' ? 'История, основанная на источниках, помогает надёжно узнавать родной край.' : 'History grounded in evidence is a sure way to know a place.'}</p><div className="quote-flower"><Flower2 size={118} strokeWidth={0.7}/></div></div>
      </section>

      <section className="silk-section" data-reveal><div className="silk-art"><div className="silk-route-map"><span className="route-pin pin-1">{lang === 'kz' ? 'ОҢТҮСТІК ҚАЗАҚСТАН' : lang === 'ru' ? 'ЮЖНЫЙ КАЗАХСТАН' : 'SOUTHERN KAZAKHSTAN'}</span><span className="route-pin pin-2">{lang === 'kz' ? 'ҚАРАТАУ' : lang === 'ru' ? 'КАРАТАУ' : 'KARATAU'}</span><span className="route-pin pin-3">{lang === 'kz' ? 'ТҮЛКІБАС' : lang === 'ru' ? 'ТЮЛЬКУБАС' : 'TYULKUBAS'}</span><span className="route-pin pin-4">{lang === 'kz' ? 'ТҮРКІСТАН' : lang === 'ru' ? 'ТУРКЕСТАН' : 'TURKISTAN'}</span><span className="route-line"/><small></small></div></div><div className="silk-copy"><span className="eyebrow">{lang === 'kz' ? 'ТАРИХИ ДЕРЕК' : lang === 'ru' ? 'ИСТОРИЧЕСКИЙ КОНТЕКСТ' : 'HISTORICAL CONTEXT'}</span><h2>{h.route}</h2><p>{h.routeBody}</p><Link className="text-link" to="/silk-road">{lang === 'kz' ? 'Тарихи жолды зерттеу' : lang === 'ru' ? 'Исследовать исторический путь' : 'Explore the historical route'}<ArrowRight size={17}/></Link></div></section>

      <section className="map-teaser page-wrap" data-reveal><div className="map-teaser-heading"><div><span className="eyebrow">{lang === 'kz' ? 'ӨҢІРГЕ САЯХАТ' : lang === 'ru' ? 'ПУТЕШЕСТВИЕ ПО РЕГИОНУ' : 'EXPLORE THE REGION'}</span><h2>{h.map}</h2><p>{h.mapBody}</p></div><Link className="round-link" to="/map" aria-label={t.common.map}><ArrowUpRight/></Link></div><MapTeaser/></section>

      <section className="timeline-preview page-wrap" data-reveal><div className="block-heading"><div><span className="eyebrow">{lang === 'kz' ? 'ТАРИХИ ХРОНОЛОГИЯ' : lang === 'ru' ? 'ВРЕМЯ В ИСТОЧНИКАХ' : 'TIME IN THE RECORD'}</span><h2>{lang === 'kz' ? 'Бір өлке — әртүрлі дәуір шежіресі' : lang === 'ru' ? 'Один край. Разное время.' : 'One region. Many moments.'}</h2></div><Link className="text-link" to="/timeline">{t.common.timeline}<ArrowRight size={17}/></Link></div><TimelineStrip items={timeline.slice(0,4)} compact/></section>

      <section className="feature-grid page-wrap" data-reveal>
        <Link className="feature-card feature-science" to="/science"><span className="feature-card-icon"><Sparkles/></span><span className="eyebrow">06 · {t.nav.science.toUpperCase()}</span><h3>{h.science}</h3><p>{h.scienceBody}</p><span className="feature-arrow"><ArrowUpRight/></span></Link>
        <Link className="feature-card feature-care" to="/heritage"><span className="feature-card-icon"><Leaf/></span><span className="eyebrow">07 · {t.nav.heritage.toUpperCase()}</span><h3>{h.care}</h3><p>{h.careBody}</p><span className="feature-arrow"><ArrowUpRight/></span></Link>
        <Link className="feature-card feature-city" to="/shymkent"><span className="feature-card-icon"><MapPinned/></span><span className="eyebrow">08 · {t.nav.shymkent.toUpperCase()}</span><h3>{h.city}</h3><p>{h.cityBody}</p><span className="feature-arrow"><ArrowUpRight/></span></Link>
      </section>

      <section className="gallery-teaser page-wrap" data-reveal><div className="block-heading"><div><span className="eyebrow">09 · {lang === 'kz' ? 'ВИЗУАЛДЫ ҚОР' : lang === 'ru' ? 'ВИЗУАЛЬНАЯ КОЛЛЕКЦИЯ' : 'VISUAL COLLECTION'}</span><h2>{h.gallery}</h2><p>{t.common.photoNote}</p></div><Link className="text-link" to="/gallery">{t.common.viewAll}<ArrowRight size={17}/></Link></div><ImageMosaic items={mediaItems.slice(0, 6)}/></section>

      <section className="source-ribbon" data-reveal><div className="source-ribbon-icon"><BookOpen size={25}/></div><div><span className="eyebrow">10 · {lang === 'kz' ? 'АШЫҚ ДЕРЕК' : lang === 'ru' ? 'ОТКРЫТЫЕ ДАННЫЕ' : 'OPEN EVIDENCE'}</span><h2>{h.sources}</h2><p>{lang === 'kz' ? 'Ғылыми атаулардан бастап архивтік құжаттарға дейін — зерттеудің түпнұсқа дереккөздері жинақталған.' : lang === 'ru' ? 'От научного названия до исторического архива — источники в одном разделе.' : 'From a scientific name to a historic archive, follow the sources.'}</p></div><Link to="/sources" className="button button-dark">{t.common.sources}<ArrowRight size={17}/></Link></section>

      <section className="final-statement" data-reveal><div className="final-flower" aria-hidden="true"><Flower2 size={160} strokeWidth={0.65}/></div><span className="eyebrow">{lang === 'kz' ? 'ОҢТҮСТІК ҚАЗАҚСТАН · 2026' : lang === 'ru' ? 'ЮЖНЫЙ КАЗАХСТАН · 2026' : 'SOUTHERN KAZAKHSTAN · 2026'}</span><h2>{h.final}</h2><p>{t.footer.body}</p><Link className="button button-primary" to="/heritage">{lang === 'kz' ? 'Мұраны қорғау жолын білу' : lang === 'ru' ? 'Узнать, как сохранить наследие' : 'Learn how to protect this legacy'}<ArrowUpRight size={17}/></Link></section>
    </main>
  </>
}

function NaturePhotoPreview() {
  const { lang, t } = useLocale()
  const copy = {
    kz: { eyebrow: 'ТАБИҒАТ · АҚСУ-ЖАБАҒЫЛЫ', title: 'Қызғалдақтың табиғи мекені', body: 'Суретте Ақсу-Жабағылы қорығында өскен қызыл-сары Грейг қызғалдағы көрінеді. Нақты өскен жері көрсетілмейді: сирек гүлдердің мекенін жарияламау маңызды.', alt: 'Ақсу-Жабағылы қорығындағы қызыл және сары Грейг қызғалдағы', credit: 'Сурет: В. А. Ковшар · CC BY-SA 4.0', action: 'Қорғау жайын оқу' },
    ru: { eyebrow: 'ПРИРОДА · АКСУ-ЖАБАГЛЫ', title: 'Увидеть цветок в его природной среде', body: 'На фотографии — красная и жёлтая формы Tulipa greigii в заповеднике Аксу-Жабаглы. Снимок сделан на территории заповедника, но не указывает точное местоположение отдельных популяций.', alt: 'Красные и жёлтые тюльпаны Грейга в заповеднике Аксу-Жабаглы', credit: 'Фото: В. А. Ковшар · CC BY-SA 4.0', action: 'Читать о природном наследии' },
    en: { eyebrow: 'NATURE · AKSU-ZHABAGLY', title: 'Meet the flower in its habitat', body: 'This photograph shows red and yellow forms of Tulipa greigii in Aksu-Zhabagly Nature Reserve. It was made within the reserve and does not identify the precise location of individual populations.', alt: 'Red and yellow Greig’s tulips in Aksu-Zhabagly Nature Reserve', credit: 'Photo: V. A. Kovshar · CC BY-SA 4.0', action: 'Read about natural heritage' },
  }[lang]
  return <section className="botanical-feature page-wrap" data-reveal aria-label={copy.eyebrow}>
    <figure className="botanical-feature-image"><img src="/images/tulipa-greigii-wild.webp" srcSet={mediaItems[0].srcSet} sizes="(max-width: 700px) 100vw, 55vw" alt={copy.alt} loading="lazy" decoding="async"/><figcaption><span>{lang === 'kz' ? 'АҚСУ-ЖАБАҒЫЛЫ · 2014 ЖЫЛҒЫ МАМЫР' : lang === 'ru' ? 'АКСУ-ЖАБАГЛЫ · МАЙ 2014' : 'AKSU-ZHABAGLY · MAY 2014'}</span><a href="https://commons.wikimedia.org/wiki/File:Tulipa_greigii_(Aksu_Zhabagly_Nature_Reserve,_Kazakhstan).png" target="_blank" rel="noreferrer">{copy.credit}</a></figcaption></figure>
    <div className="botanical-feature-copy"><span className="eyebrow">{copy.eyebrow}</span><h2>{copy.title}</h2><p>{copy.body}</p><Link className="text-link" to="/heritage">{copy.action}<ArrowRight size={17}/></Link></div>
  </section>
}
function PageHero({ pageKey, index = '' }) {
  const { lang, t } = useLocale()
  const page = t.pages[pageKey]
  return <section className="page-hero page-wrap" data-reveal><div className="page-hero-copy"><span className="eyebrow">{page.eyebrow}</span><h1>{page.title}</h1><p>{page.lead}</p></div><span className="page-hero-number">{index}</span><span className="page-hero-ornament" aria-hidden="true"><Flower2 size={196} strokeWidth={0.45}/></span><a className="page-hero-credit" href="https://commons.wikimedia.org/wiki/File:Tulipa_greigii_(Aksu_Zhabagly_Nature_Reserve,_Kazakhstan).png" target="_blank" rel="noreferrer">{lang === 'kz' ? 'Сурет: В. А. Ковшар · CC BY-SA 4.0 · сайтқа лайықталып ықшамдалған' : lang === 'ru' ? 'Фото: В. А. Ковшар · CC BY-SA 4.0 · фото оптимизировано и преобразовано в WebP' : 'Photo: V. A. Kovshar · CC BY-SA 4.0 · image resized and converted to WebP'}</a></section>
}

function Citation({ id }) {
  const { lang, t } = useLocale()
  const ids = Array.isArray(id) ? id : [id]
  const records = ids.map(sourceId => sourceRecords.find(item => item.id === sourceId)).filter(Boolean)
  if (!records.length) return null
  return <>{records.map(record => <a className="citation-link" key={record.id} href={record.url} target="_blank" rel="noreferrer">{t.common.citation}: {sourceAuthor(record, lang).split(' · ')[0]}<ArrowUpRight size={12}/></a>)}</>
}

function ExhibitNarrative({ pageKey }) {
  const { lang } = useLocale()
  const story = exhibitNarratives[pageKey]
  if (!story) return null
  return <article className="longform-story page-wrap" aria-label={story.title[lang]} data-reveal>
    <header className="longform-story-heading"><span className="eyebrow">{story.eyebrow[lang]}</span><h2>{story.title[lang]}</h2></header>
    <div className="longform-story-body">{story.paragraphs[lang].map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      <div className="longform-story-sources"><span className="eyebrow">{lang === 'kz' ? 'ДЕРЕККӨЗДЕР' : lang === 'ru' ? 'ИСТОЧНИКИ ДЛЯ ПРОВЕРКИ' : 'SOURCES TO CHECK'}</span><div>{story.sources.map(id => <Citation id={id} key={id}/>)}</div></div>
    </div>
  </article>
}

function EditorialPage({ pageKey, index }) {
  const { lang, t } = useLocale()
  const page = t.pages[pageKey]
  const citations = i => {
    if (pageKey === 'history') return i === 0 ? ['ipni', 'kew'] : i === 1 ? 'ipni' : i === 2 ? 'frontiers' : i === 3 ? ['kew', 'frontiers'] : i === 4 ? 'unesco-fs' : null
    if (pageKey === 'science') return i === 0 ? ['ipni', 'kew'] : i === 1 ? ['kew', 'frontiers'] : i < 4 ? 'frontiers' : null
    if (pageKey === 'heritage') return 'gov'
    if (pageKey === 'shymkent') return 'shymkent-tourism'
    if (pageKey === 'silk-road') return i === 0 ? ['unesco', 'unesco-fs'] : i === 1 ? 'unesco' : i === 2 ? 'ipni' : 'unesco-fs'
    if (pageKey === 'about' && i === 1) return ['kew', 'ipni']
    return null
  }
  return <main className="editorial-page"><PageHero pageKey={pageKey} index={index}/><section className="editorial-cards page-wrap">{page.cards.map(([title, body], i) => <article className="editorial-card" data-reveal key={title} style={{ '--card-index': i, '--card-offset': `${i * 11}px` }}><div className="editorial-card-number">{String(i + 1).padStart(2, '0')}</div><div><span className="eyebrow">{page.eyebrow}</span><h2>{title}</h2><p>{body}</p><div className="editorial-source"><Citation id={citations(i)}/></div></div><span className="editorial-card-mark">✳</span></article>)}</section><ExhibitNarrative pageKey={pageKey}/>
    {pageKey === 'shymkent' && <div className="page-wrap editorial-note"><span className="eyebrow">{t.common.citation}</span><p>{lang === 'kz' ? 'Қаланың қызғалдақ белгісі мен көктемгі гүл егіні туралы туристік басқарманың ресми жазбасы.' : lang === 'ru' ? 'Официальная запись туристического управления о тюльпане в символике города и весенних посадках.' : 'Official tourism-office record of the tulip in city symbolism and spring planting.'}</p><Citation id="shymkent-tourism"/></div>}
    {pageKey === 'history' && <section className="history-archive page-wrap" data-reveal><div className="archive-image"><img src="/images/gartenflora-1873.webp" srcSet={mediaItems.find(item => item.id === 'gartenflora-plate-773').srcSet} sizes="(max-width: 700px) 100vw, 55vw" alt={lang === 'kz' ? '«Гартенфлора» журналының 1873 жылғы 773-тақтасы' : lang === 'ru' ? 'Таблица 773 журнала Gartenflora за 1873 год' : 'Plate 773 from the 1873 volume of Gartenflora'} loading="lazy" decoding="async"/><a className="archive-photo-credit" href="https://www.biodiversitylibrary.org/page/47574892" target="_blank" rel="noreferrer">{lang === 'kz' ? 'Биоалуандық мұрағаты · ашық мұра' : lang === 'ru' ? 'Библиотека наследия биоразнообразия · Общественное достояние' : 'Biodiversity Heritage Library · Public Domain Mark 1.0'}</a></div><div><span className="eyebrow">{lang === 'kz' ? '1873 · «ГАРТЕНФЛОРА» 22-ТОМ' : lang === 'ru' ? '1873 · «ГАРТЕНФЛОРА», ТОМ 22' : '1873 · GARTENFLORA 22'}</span><h2>{lang === 'kz' ? 'Түпнұсқа мұрағат ізі' : lang === 'ru' ? 'След в первоисточнике' : 'The original archival trace'}</h2><p>{lang === 'kz' ? 'Мұнда 1873 жылғы ботаникалық басылымның цифрланған беті берілген. Ғылыми атаудың жарияланған дерегін түпнұсқамен салыстырып көріңіз.' : lang === 'ru' ? 'Локальная копия открытой оцифрованной страницы издания 1873 года. Библиографические данные публикации научного названия можно сверить с первоисточником.' : 'Local copy of an openly digitized page from the 1873 volume. The publication details for the scientific name can be checked against the original record.'}</p><Citation id="bhl"/></div></section>}
    <NextChapter to={pageKey === 'history' ? '/silk-road' : pageKey === 'science' ? '/heritage' : pageKey === 'heritage' ? '/map' : pageKey === 'silk-road' ? '/map' : '/sources'} label={pageKey === 'history' ? t.home.route : pageKey === 'science' ? t.home.care : pageKey === 'heritage' ? t.home.map : pageKey === 'silk-road' ? t.pages.map.title : t.nav.sources}/>
  </main>
}

function NextChapter({ to, label }) {
  const { t } = useLocale()
  return <div className="next-chapter page-wrap"><span className="eyebrow">{t.common.next}</span><Link to={to}><span>{label}</span><ArrowUpRight/></Link></div>
}

function TimelinePage() {
  const { t } = useLocale()
  return <main><PageHero pageKey="timeline" index="1873"/><section className="timeline-full page-wrap"><TimelineExplorer items={timeline}/></section><div className="editorial-note page-wrap"><span className="eyebrow">{t.common.citation}</span><p>{t.pages.timeline.lead}</p><Citation id="ipni"/><Citation id="kew"/><Citation id="paper"/><Citation id="frontiers"/><Citation id="unesco"/></div><NextChapter to="/map" label={t.pages.map.title}/></main>
}

function ReviewsPage() {
  const { lang, t } = useLocale()
  const noteHeading = lang === 'kz' ? 'ҒЫЛЫМИ ТҮСІНІКТЕМЕ' : lang === 'ru' ? 'КОММЕНТАРИЙ НАУЧНОГО РЕДАКТОРА' : 'SCIENTIFIC CURATOR’S NOTE'
  const sourceLabel = lang === 'kz' ? 'Бастапқы дереккөз' : lang === 'ru' ? 'Первоисточник' : 'Open source'
  return <main className="reviews-page">
    <PageHero pageKey="reviews" index={lang === 'kz' ? '03 · ПІКІРЛЕР' : lang === 'ru' ? '03 · МНЕНИЯ' : '03 / VOICES'}/>
    <section className="review-grid page-wrap" aria-label={t.pages.reviews.title}>
      {reviews.map((review, index) => {
        const source = sourceRecords.find(record => record.id === review.source)
        return <article className="review-card" data-reveal key={review.id}>
          <div className="review-card-meta"><span>{String(index + 1).padStart(2, '0')}</span><small>{review.role[lang]}</small></div>
          <h2>{typeof review.name === 'string' ? review.name : review.name[lang]}</h2><h3>{review.title[lang]}</h3>
          <p className="review-summary">{review.summary[lang]}</p>
          <p className="review-attribution">{review.attribution[lang]}</p>
          {source && <a className="citation-link review-source-link" href={source.url} target="_blank" rel="noreferrer">{sourceLabel}: {sourceTitle(source, lang)}<ArrowUpRight size={13}/></a>}
        </article>
      })}
    </section>
    <section className="curator-note page-wrap" data-reveal aria-labelledby="curator-note-title">
      <div><span className="eyebrow">{noteHeading}</span><h2 id="curator-note-title">{curatorNote.title[lang]}</h2></div>
      <div><p>{curatorNote.body[lang]}</p><div className="curator-note-sources">{curatorNote.sources.map(id => <Citation key={id} id={id}/>)}</div></div>
    </section>
    <NextChapter to="/timeline" label={t.pages.timeline.title}/>
  </main>
}

function EncyclopediaPage() {
  const { lang, t } = useLocale()
  const chapters = [
    ['history', '/history'], ['science', '/science'], ['heritage', '/ecology'],
    ['shymkent', '/shymkent'], ['silk-road', '/silk-road'], ['timeline', '/timeline'], ['map', '/map'],
  ]
  const heading = { kz: 'Жеті зерттеу бағыты', ru: 'Семь направлений экспозиции', en: 'Seven paths through the collection' }
  return <main className="encyclopedia-page"><PageHero pageKey="facts" index="30+"/>
    <section className="encyclopedia-chapters page-wrap"><div className="block-heading"><div><span className="eyebrow">{lang === 'kz' ? 'ӨЛКЕ · ӨСІМДІК · ҒЫЛЫМ' : lang === 'ru' ? 'РЕГИОН · РАСТЕНИЕ · НАУКА' : 'REGION · PLANT · SCIENCE'}</span><h2>{heading[lang]}</h2></div></div><div className="encyclopedia-chapter-grid">{chapters.map(([key, to], index) => <Link to={to} key={key}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{key === 'heritage' ? t.pages.heritage.title : t.pages[key].title}</b><small>{t.pages[key].lead}</small></div><ArrowUpRight size={17}/></Link>)}</div></section>
    <section className="page-wrap encyclopedia-facts"><div className="block-heading"><div><span className="eyebrow">{lang === 'kz' ? `ҒЫЛЫМИ АНЫҚТАМА · ${facts.length} ЖАЗБА` : lang === 'ru' ? `НАУЧНЫЙ СПРАВОЧНИК · ${facts.length} ЗАПИСЕЙ` : `REFERENCE · ${facts.length} RECORDS`}</span><h2>{t.pages.science.title}</h2><p>{lang === 'kz' ? 'Санат бойынша сүзгілеңіз, сөзбен іздеңіз, дереккөзді ашыңыз.' : lang === 'ru' ? 'Выберите тему, найдите термин и откройте первичный источник.' : 'Filter by subject, search a term and open its source.'}</p></div></div><FactExplorer/></section>
    <NextChapter to="/timeline" label={t.pages.timeline.title}/>
  </main>
}

function MapPage() {
  const { t } = useLocale()
  return <main><PageHero pageKey="map" index="42° N"/><section className="map-page-section page-wrap"><Suspense fallback={<div className="loading-panel">{t.common.explore}…</div>}><MuseumMapView/></Suspense><div className="map-source-row"><span>{t.common.mapNote}</span><Link className="text-link" to="/places/aqsu-zhabagly">{t.common.explore}<ArrowRight size={16}/></Link></div></section><NextChapter to="/science" label={t.pages.science.title}/></main>
}

function SourcesPage() {
  const { lang, t } = useLocale()
  const sortedSources = [...sourceRecords].sort((a, b) => {
    const yearOf = record => Number.parseInt(record.year, 10) || Number.POSITIVE_INFINITY
    return yearOf(a) - yearOf(b)
  })
  return <main><PageHero pageKey="sources" index="06"/><section className="sources-explainer page-wrap"><p className="eyebrow">01 · {lang === 'kz' ? 'ҒЫЛЫМ' : lang === 'ru' ? 'НАУКА' : 'SCIENCE'}</p><p>{lang === 'kz' ? 'Дереккөз карточкасын ашып, бастапқы материалмен танысыңыз. Сілтемелер жеке бетте ашылады.' : lang === 'ru' ? 'Откройте карточку источника и проверьте оригинальный материал. Ссылки откроются отдельно.' : 'Open a source card to review the original material. Links open in a separate tab.'}</p></section><section className="page-wrap"><SourceCards items={sortedSources}/></section><NextChapter to="/about" label={lang === 'kz' ? 'Жоба туралы' : lang === 'ru' ? 'О проекте' : 'About this project'}/></main>
}

function FieldFilm() {
  const { lang } = useLocale()
  const text = {
    kz: { title: 'Көктемгі дала · табиғи орта', eyebrow: 'АҚСУ-ЖАБАҒЫЛЫ · ӨҢІРЛІК КӨРІНІС', body: 'Гүлдеу мерзімі ауа райы мен биіктікке қарай өзгереді. Бұл таулы көрініс — Ақсу-Жабағылы қорығынан алынған фото; ол нақты гүл популяциясының мекенін көрсетпейді.', alt: 'Ақсу-Жабағылы қорығының тау ландшафты', credit: 'Фото: Jack Bartovsky · CC BY-SA 4.0', action: 'Табиғи мұраны оқу' },
    ru: { title: 'Весенняя степь · природный ландшафт', eyebrow: 'АКСУ-ЖАБАГЛЫ · ВИД РЕГИОНА', body: 'Сроки цветения меняются в зависимости от погоды и высоты. Этот горный пейзаж снят в заповеднике Аксу-Жабаглы; он не указывает место конкретной популяции тюльпанов.', alt: 'Горный ландшафт заповедника Аксу-Жабаглы', credit: 'Фото: Jack Bartovsky · CC BY-SA 4.0', action: 'Читать о природном наследии' },
    en: { title: 'Spring landscape · natural setting', eyebrow: 'AKSU-ZHABAGLY · REGIONAL VIEW', body: 'Flowering time varies with weather and elevation. This mountain photograph was made in Aksu-Zhabagly Nature Reserve; it does not identify a particular tulip population.', alt: 'Mountain landscape in Aksu-Zhabagly Nature Reserve', credit: 'Photo: Jack Bartovsky · CC BY-SA 4.0', action: 'Read about natural heritage' },
  }[lang]
  return <section className="field-film page-wrap" aria-labelledby="field-film-title">
    <figure className="field-film-media"><img src="/images/aksu-zhabagly-mountains.webp" srcSet={mediaItems.find(item => item.id === 'aksu-zhabagly-mountains').srcSet} sizes="(max-width: 700px) 100vw, 60vw" alt={text.alt} loading="lazy" decoding="async"/><figcaption><span>{text.eyebrow}</span><a href="https://commons.wikimedia.org/wiki/File:Aksu_Zhabagly_mountains.jpg" target="_blank" rel="noreferrer">{text.credit}</a></figcaption></figure>
    <div className="field-film-copy"><span className="eyebrow">{text.eyebrow}</span><h2 id="field-film-title">{text.title}</h2><p>{text.body}</p><Link className="button button-outline" to="/heritage">{text.action}<ArrowRight size={17}/></Link></div>
  </section>
}

function MediaPage() {
  const { lang, t } = useLocale()
  const [active, setActive] = useState(null)
  const categories = lang === 'kz' ? ['Барлығы','Қызғалдақ','Табиғат','Архив'] : lang === 'ru' ? ['Все','Цветы','Природа','Архив'] : ['All','Tulips','Nature','Archive']
  const kinds = ['all', 'flower', 'landscape', 'archive']
  const visibleItems = mediaItems.filter(item => (active ?? 0) === 0 || item.kind === kinds[active])
  const categoryCounts = kinds.map(kind => kind === 'all' ? mediaItems.length : mediaItems.filter(item => item.kind === kind).length)
  return <main>
    <PageHero pageKey="media" index="03 / 06"/>
    <div className="gallery-filter page-wrap" role="group" aria-label={t.common.filters}>{categories.map((cat,i)=><button type="button" className={(active ?? 0)===i?'selected':''} key={cat} onClick={()=>setActive(i)} aria-pressed={(active ?? 0)===i}>{cat}<small>{categoryCounts[i]}</small></button>)}</div>
    {visibleItems.length ? <section className="page-wrap"><ImageMosaic items={visibleItems} large/></section> : <p className="fact-empty page-wrap">{t.common.empty}</p>}
    <FieldFilm/>
    <NextChapter to="/sources" label={t.pages.sources.title}/>
  </main>
}

function PlacesIndexPage() {
  const { lang, t } = useLocale()
  const placePhotos = {
    'aqsu-zhabagly': { image: '/images/aksu-canyon-panorama.jpeg', srcSet: photoAssets.find(item => item.id === 'aksu-canyon-panorama')?.srcSet || photoAssets[0].srcSet },
    kazygurt: { image: '/images/tulip-steppe-sunset.jpeg', srcSet: photoAssets.find(item => item.id === 'tulip-steppe-sunset')?.srcSet || photoAssets[0].srcSet },
    shymkent: { image: '/images/shymkent-downtown.webp', srcSet: photoAssets.find(item => item.id === 'shymkent-downtown')?.srcSet },
    turkistan: { image: '/images/turkistan-mausoleum.webp', srcSet: photoAssets.find(item => item.id === 'turkistan-mausoleum')?.srcSet },
    karatau: { image: '/images/karatau-ridge.webp', srcSet: photoAssets.find(item => item.id === 'karatau-ridge')?.srcSet },
    shubaykyzyl: { image: '/images/shubaykyzyl-steppe.jpeg', srcSet: photoAssets.find(item => item.id === 'shubaykyzyl-steppe')?.srcSet },
    tulkibas: { image: '/images/koktem.jpeg', srcSet: photoAssets.find(item => item.id === 'koktem')?.srcSet },
    berkara: { image: '/images/berkara-gorge.jpeg', srcSet: photoAssets.find(item => item.id === 'berkara-gorge')?.srcSet },
  }
  return <main className="places-page">
    <PageHero pageKey="places" index="08"/>
    <section className="page-wrap places-grid" data-reveal>
      {places.map((place, index) => {
        const photo = placePhotos[place.slug] ?? placePhotos['aqsu-zhabagly']
        return <article className="places-summary-card" key={place.slug}>
          <figure className="places-summary-figure">
            <img src={photo.image} srcSet={photo.srcSet} sizes="(max-width: 768px) 100vw, 50vw" alt={place.name[lang]} loading="lazy" decoding="async"/>
            <span className="places-summary-badge">{String(index + 1).padStart(2, '0')} · {place.region[lang]}</span>
            <span className="places-summary-coords">{place.coordsLabel}</span>
          </figure>
          <div className="places-summary-body">
            <span className="eyebrow">{place.region[lang]}</span>
            <h3>{place.name[lang]}</h3>
            <p>{place.summary[lang]}</p>
            <Link className="places-summary-cta" to={`/places/${place.slug}`}>
              <span>{t.common.explore}</span>
              <ArrowRight size={16}/>
            </Link>
          </div>
        </article>
      })}
    </section>
    <NextChapter to="/map" label={t.pages.map.title}/>
  </main>
}

function PlacePage({ slug: propSlug }) {
  const params = useParams()
  const slug = propSlug || params.slug
  const { lang, t } = useLocale()
  const place = places.find(item => item.slug === slug)
  if (!place) return <NotFound/>
  const placePhotos = {
    'aqsu-zhabagly': { image: '/images/aksu-canyon-panorama.jpeg', srcSet: photoAssets.find(item => item.id === 'aksu-canyon-panorama')?.srcSet || photoAssets[0].srcSet, credit: 'A. F. Kovshar · Aksu-Zhabagly Nature Reserve · CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Aksu_river_canyon_(Aksu-Zhabagly_Nature_Reserve,_Kazakhstan).png' },
    kazygurt: { image: '/images/tulip-steppe-sunset.jpeg', srcSet: photoAssets.find(item => item.id === 'tulip-steppe-sunset')?.srcSet || photoAssets[0].srcSet, credit: 'Regional Nature Archive · Free License', url: 'https://www.gov.kz/memleket/entities/ontustik' },
    shymkent: { image: '/images/shymkent-downtown.webp', srcSet: photoAssets.find(item => item.id === 'shymkent-downtown')?.srcSet, credit: 'Rassim · CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Shymkent_city_downtown.jpg' },
    turkistan: { image: '/images/turkistan-mausoleum.webp', srcSet: photoAssets.find(item => item.id === 'turkistan-mausoleum')?.srcSet, credit: 'Petar Milošević · CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Mausoleum_of_Khoja_Ahmed_Yasawi_in_Hazrat-e_Turkestan,_Kazakhstan.jpg' },
    karatau: { image: '/images/karatau-ridge.webp', srcSet: photoAssets.find(item => item.id === 'karatau-ridge')?.srcSet, credit: 'Andrey Shishkalov · Karatau Nature Reserve · CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Горы_Каратау_3.png' },
    shubaykyzyl: { image: '/images/shubaykyzyl-steppe.jpeg', srcSet: photoAssets.find(item => item.id === 'shubaykyzyl-steppe')?.srcSet, credit: 'Shubaykyzyl Nature Sanctuary · Photo Archive', url: 'https://oq.gov.kz/ru/abai/shubaykyzyl-tulips' },
    tulkibas: { image: '/images/koktem.jpeg', srcSet: photoAssets.find(item => item.id === 'koktem')?.srcSet, credit: 'Personal photo archive · Free License', url: 'https://www.gov.kz/memleket/entities/ontustik' },
    berkara: { image: '/images/berkara-gorge.jpeg', srcSet: photoAssets.find(item => item.id === 'berkara-gorge')?.srcSet, credit: 'Aidana Shanlatbai · Berkara Nature Sanctuary · CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Берікқара_таулары.jpg' },
  }
  const photo = placePhotos[slug] ?? placePhotos['aqsu-zhabagly']
  const photoAlt = slug === 'shymkent' ? (lang === 'kz' ? 'Шымкент қаласының орталығы' : lang === 'ru' ? 'Центр Шымкента' : 'Downtown Shymkent') : slug === 'turkistan' ? (lang === 'kz' ? 'Түркістандағы Қожа Ахмет Ясауи кесенесі' : lang === 'ru' ? 'Мавзолей Ходжи Ахмеда Ясави в Туркестане' : 'Mausoleum of Khoja Ahmed Yasawi in Turkistan') : slug === 'karatau' ? (lang === 'kz' ? 'Қаратау қорығының таулары мен шатқалдары' : lang === 'ru' ? 'Горы и ущелья Каратауского заповедника' : 'Mountains and gorges of Karatau Nature Reserve') : slug === 'shubaykyzyl' ? (lang === 'kz' ? 'Шұбайқызыл төбесіндегі қызғалдақтар алқабы' : lang === 'ru' ? 'Цветущие тюльпаны урочища Шубайкызыл' : 'Blooming tulips of Shubaykyzyl') : slug === 'tulkibas' ? (lang === 'kz' ? 'Түлкібас аңғары мен көктемгі қазақ даласы' : lang === 'ru' ? 'Тюлькубасская долина и весенняя степь' : 'Tyulkubas Valley and spring steppe') : slug === 'berkara' ? (lang === 'kz' ? 'Берікқара шатқалының табиғи көрінісі' : lang === 'ru' ? 'Природный ландшафт урочища Беркара' : 'Natural landscape of Berkara Gorge') : slug === 'aqsu-zhabagly' ? (lang === 'kz' ? 'Ақсу-Жабағылы қорығының таулары мен шатқалы' : lang === 'ru' ? 'Каньон и горы заповедника Аксу-Жабаглы' : 'Mountains and canyon in Aksu-Zhabagly Nature Reserve') : (lang === 'kz' ? 'Өңір көрінісі: көктемгі қызғалдақты дала' : lang === 'ru' ? 'Региональный пейзаж: цветущая степь' : 'Regional landscape: blooming steppe')
  const tour = {
    kz: [['01 · БАҒДАР', 'Картадағы координата — мекенді бағдарлау үшін берілген нүкте, сирек өсімдіктің нақты популяция координатасы емес.'], ['02 · ӨҢІР', place.region[lang]], ['03 · ЖАЗБА', place.detail[lang]], ['04 · ДЕРЕККӨЗ', 'Сілтемені ашып, осы орынға қатысты мәліметті бастапқы материалдан тексеріңіз.']],
    ru: [['01 · ОРИЕНТИР', 'Координата на карте — ориентир для знакомства с местом, а не точка популяции редкого растения.'], ['02 · РЕГИОН', place.region[lang]], ['03 · ЗАПИСЬ', place.detail[lang]], ['04 · ИСТОЧНИК', 'Откройте ссылку и сверьте сведения об этом месте с первичным материалом.']],
    en: [['01 · ORIENTATION', 'The map coordinate is an orientation point for visitors, not a rare-plant population coordinate.'], ['02 · REGION', place.region[lang]], ['03 · RECORD', place.detail[lang]], ['04 · SOURCE', 'Open the linked record and check its place information against the source.']],
  }[lang]
  return <main><section className="place-detail-hero page-wrap"><div style={{ display: 'flex', gap: '16px', marginBottom: 'auto' }}><Link className="back-link" to="/places">← {lang === 'kz' ? 'Мекендер тізімі' : lang === 'ru' ? 'Все места' : 'All habitats'}</Link><Link className="back-link" to="/map">{t.nav.map}</Link></div><span className="eyebrow">{place.region[lang]}</span><h1>{place.name[lang]}</h1><p>{place.summary[lang]}</p><span className="place-coordinates">{place.coordsLabel}</span></section><section className="place-detail-body page-wrap"><figure className="place-illustration"><img src={photo.image} srcSet={photo.srcSet} sizes="(max-width: 700px) 100vw, 55vw" alt={photoAlt} loading="lazy" decoding="async"/><figcaption><a href={photo.url} target="_blank" rel="noreferrer">{photo.credit}</a></figcaption></figure><div className="place-facts"><span className="eyebrow">{lang==='kz'?'МЕКЕН ТУРАЛЫ':lang==='ru'?'О МЕСТЕ':'ABOUT THIS PLACE'}</span><h2>{place.name[lang]}</h2><p>{place.detail[lang]}</p><div className="place-meta"><span>{t.common.place}</span><b>{place.region[lang]}</b></div><div className="place-meta"><span>{lang==='kz'?'Картадағы бағдар':lang==='ru'?'Ориентир на карте':'Map orientation'}</span><b>{place.coordsLabel}</b></div><Citation id={place.source}/><Link className="button button-outline" to="/map">{t.common.map}<ArrowRight size={17}/></Link></div></section><section className="place-tour page-wrap"><span className="eyebrow">{lang === 'kz' ? 'ТАРИХҚА САЯХАТ' : lang === 'ru' ? 'ВИРТУАЛЬНАЯ ЭКСКУРСИЯ' : 'A VIRTUAL FIELD VISIT'}</span><h2>{lang === 'kz' ? 'Мекенді дерекпен зерттеу' : lang === 'ru' ? 'Изучаем место через источники' : 'Explore this place through records'}</h2><div className="place-tour-steps">{tour.map(([title, description], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{description}</p>{index === 3 && <Citation id={place.source}/>}</div></article>)}</div></section><NextChapter to="/heritage" label={t.pages.heritage.title}/></main>
}

function ArticlePage() {
  const { slug } = useParams()
  const { lang, t } = useLocale()
  const entry = slug === 'species-record' ? sourceRecords.find(item => item.id==='ipni') : sourceRecords.find(item => item.id==='unesco')
  if (!entry) return <NotFound/>
  const isSilk = slug === 'silk-road-context'
  return <main><section className="page-hero page-wrap"><div className="page-hero-copy"><span className="eyebrow">{lang==='kz'?'ЗЕРТТЕУ ЖАЗБАСЫ':lang==='ru'?'ИССЛЕДОВАТЕЛЬСКАЯ ЗАПИСКА':'RESEARCH NOTE'}</span><h1>{isSilk?t.pages['silk-road'].cards[0][0]:t.pages.history.cards[0][0]}</h1><p>{entry.note[lang]}</p></div></section><section className="article-reading page-wrap"><p className="article-dropcap">{isSilk?t.pages['silk-road'].cards[1][1]:t.pages.history.cards[0][1]}</p><h2>{lang==='kz'?'Деректі қалай оқу керек':lang==='ru'?'Как читать запись':'How to read the record'}</h2><p>{entry.note[lang]}</p><Citation id={entry.id}/></section><NextChapter to={isSilk?'/silk-road':'/history'} label={isSilk?t.pages['silk-road'].title:t.pages.history.title}/></main>
}

function NotFound() {
  const { t } = useLocale()
  return <main className="not-found page-wrap"><span className="eyebrow">404 · {t.common.curated}</span><h1>{t.pages.about.title}</h1><p>{t.pages.about.lead}</p><Link className="button button-primary" to="/">{t.common.back}<ArrowRight size={17}/></Link></main>
}

function App() {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('greig-locale') || 'kz' } catch { return 'kz' }
  })
  const setLang = useCallback(code => {
    if (!locales[code]) return
    try { localStorage.setItem('greig-locale', code) } catch { /* The current session still uses the selected locale. */ }
    setLangState(code)
  }, [])
  const t = locales[lang]
  const location = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }, [location.pathname])
  useEffect(() => {
    document.documentElement.lang = t.html
    const titles = { kz: 'Грейг қызғалдағы — Өлкемнің цифрлық шежіресі', ru: 'Тюльпан Грейга — цифровая летопись края', en: 'Greig’s Tulip — A Digital Chronicle of the Region' }
    const routeKey = ({ '/malimetter': 'facts', '/tarikh': 'history', '/ecology': 'heritage' })[location.pathname] ?? location.pathname.replace(/^\//, '')
    const routePage = t.pages[routeKey]
    const placeSlug = location.pathname.startsWith('/places/') ? location.pathname.split('/').at(-1) : null
    const routePlace = placeSlug ? places.find(place => place.slug === placeSlug) : null
    const articleTitle = location.pathname.startsWith('/articles/') ? (lang === 'kz' ? 'Зерттеу жазбасы' : lang === 'ru' ? 'Исследовательская записка' : 'Research note') : null
    const visibleTitle = routePage?.title ?? routePlace?.name[lang] ?? articleTitle
    document.title = visibleTitle ? `${visibleTitle} · ${titles[lang]}` : titles[lang]
    const description = document.querySelector('meta[name="description"]')
    const pageDescription = routePage?.lead ?? routePlace?.summary[lang] ?? t.home.intro
    if (description) description.setAttribute('content', pageDescription)
    const publicBase = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')
    const canonicalPath = ({ '/tarikh': '/history', '/ecology': '/heritage', '/gallery': '/media' })[location.pathname] ?? location.pathname
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
    canonical.href = `${publicBase}${canonicalPath}`
    const socialTitle = visibleTitle ? `${visibleTitle} · ${titles[lang]}` : titles[lang]
    for (const [selector, value] of [['meta[property="og:title"]', socialTitle], ['meta[property="og:description"]', pageDescription], ['meta[property="og:url"]', canonical.href], ['meta[name="twitter:title"]', socialTitle], ['meta[name="twitter:description"]', pageDescription]]) document.querySelector(selector)?.setAttribute('content', value)
    let structuredData = document.getElementById('site-structured-data')
    if (!structuredData) { structuredData = document.createElement('script'); structuredData.id = 'site-structured-data'; structuredData.type = 'application/ld+json'; document.head.appendChild(structuredData) }
    structuredData.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Museum', name: titles[lang], description: pageDescription, inLanguage: t.html, url: canonical.href })
    ScrollTrigger.refresh()
  }, [lang, location.pathname, t])
  useEffect(() => {
    const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (noMotion) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-reveal]').forEach(node => gsap.fromTo(node,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out', clearProps: 'transform', scrollTrigger: { trigger: node, start: 'top 90%', once: true } },
      ))
    })
    return () => ctx.revert()
  }, [location.pathname])
  return <LocaleContext.Provider value={{ lang, setLang, t }}><Header/><RouteBreadcrumbs/><div id="site-content"><Routes>
    <Route path="/" element={<HomePage/>}/>
    <Route path="/history" element={<EditorialPage pageKey="history" index="1873"/>}/>
    <Route path="/tarikh" element={<EditorialPage pageKey="history" index="1873"/>}/>
    <Route path="/malimetter" element={<EncyclopediaPage/>}/>
    <Route path="/timeline" element={<TimelinePage/>}/><Route path="/map" element={<MapPage/>}/><Route path="/reviews" element={<ReviewsPage/>}/>
    <Route path="/science" element={<EditorialPage pageKey="science" index="BOTANICA"/>}/>
    <Route path="/heritage" element={<EditorialPage pageKey="heritage" index="01 FLOWER"/>}/>
    <Route path="/ecology" element={<EditorialPage pageKey="heritage" index="01 FLOWER"/>}/>
    <Route path="/media" element={<MediaPage/>}/><Route path="/gallery" element={<MediaPage/>}/>
    <Route path="/3d" element={<Navigate to="/heritage" replace/>}/><Route path="/shymkent" element={<EditorialPage pageKey="shymkent" index="42° N"/>}/>
    <Route path="/silk-road" element={<EditorialPage pageKey="silk-road" index="EURASIA"/>}/>
    <Route path="/sources" element={<SourcesPage/>}/><Route path="/about" element={<EditorialPage pageKey="about" index="2026"/>}/>
    <Route path="/places" element={<PlacesIndexPage/>}/>
    <Route path="/places/:slug" element={<PlacePage/>}/>
    <Route path="/places/kazygurt" element={<PlacePage slug="kazygurt"/>}/>
    <Route path="/places/aqsu-zhabagly" element={<PlacePage slug="aqsu-zhabagly"/>}/>
    <Route path="/places/berkara" element={<PlacePage slug="berkara"/>}/>
    <Route path="/places/karatau" element={<PlacePage slug="karatau"/>}/>
    <Route path="/places/shubaykyzyl" element={<PlacePage slug="shubaykyzyl"/>}/>
    <Route path="/places/tulkibas" element={<PlacePage slug="tulkibas"/>}/>
    <Route path="/places/turkistan" element={<PlacePage slug="turkistan"/>}/>
    <Route path="/places/shymkent" element={<PlacePage slug="shymkent"/>}/>
    <Route path="/articles/:slug" element={<ArticlePage/>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes></div><Footer/><SiteUtilities/></LocaleContext.Provider>
}

export default App

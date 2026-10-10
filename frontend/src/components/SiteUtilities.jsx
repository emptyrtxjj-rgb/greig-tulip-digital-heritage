import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, ArrowUp, Search, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useLocale } from '../locales/context.js'
import { facts } from '../data/facts.js'
import { places, sourceRecords, sourceTitle } from '../data/collections.js'
import { timeline } from '../data/timeline.js'

const pageKeys = [
  ['facts', '/malimetter'], ['history', '/history'], ['timeline', '/timeline'], ['map', '/map'],
  ['science', '/science'], ['heritage', '/heritage'], ['media', '/media'],
  ['shymkent', '/shymkent'], ['silk-road', '/silk-road'], ['reviews', '/reviews'], ['sources', '/sources'], ['about', '/about'],
]

function SearchDialog({ close }) {
  const { lang, t } = useLocale()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  const records = useMemo(() => {
    const pages = pageKeys.map(([key, href]) => ({ type: lang === 'kz' ? 'ТАРАУ' : lang === 'ru' ? 'РАЗДЕЛ' : 'CHAPTER', title: t.pages[key]?.title ?? key, summary: t.pages[key]?.lead ?? '', href }))
    const placeRecords = places.map(item => ({ type: lang === 'kz' ? 'МЕКЕН' : lang === 'ru' ? 'МЕСТО' : 'PLACE', title: item.name[lang], summary: item.summary[lang], href: `/places/${item.slug}` }))
    const factRecords = facts.map(item => ({ type: lang === 'kz' ? 'ДЕРЕК' : lang === 'ru' ? 'ФАКТ' : 'FACT', title: item.title[lang], summary: `${typeof item.value === 'string' ? item.value : item.value[lang]} · ${item.detail[lang]}`, href: `/malimetter#fact-${item.id}` }))
    const sourceItems = sourceRecords.map(item => ({ type: lang === 'kz' ? 'ДЕРЕККӨЗ' : lang === 'ru' ? 'ИСТОЧНИК' : 'SOURCE', title: sourceTitle(item, lang), summary: item.note[lang], href: `/sources#source-${item.id}` }))
    const timelineItems = timeline.map(item => ({ type: lang === 'kz' ? 'ХРОНОЛОГИЯ' : lang === 'ru' ? 'ХРОНОЛОГИЯ' : 'TIMELINE', title: item.title[lang], summary: `${item.year} · ${item.body[lang]}`, href: `/timeline#timeline-${item.year}` }))
    return [...pages, ...placeRecords, ...factRecords, ...timelineItems, ...sourceItems]
  }, [lang, t])
  const matches = records.filter(record => `${record.title} ${record.summary} ${record.type}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).slice(0, 10)
  const navigateToHash = href => {
    const hash = href.split('#')[1]
    if (hash) window.setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80)
    close()
  }

  return <div className="site-search-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) close() }}>
    <section className="site-search-dialog" role="dialog" aria-modal="true" aria-labelledby="site-search-title">
      <div className="site-search-head"><h2 id="site-search-title">{t.common.search}</h2><button type="button" onClick={close} aria-label={t.common.close}><X/></button></div>
      <label className="site-search-input"><Search size={19}/><input ref={inputRef} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t.common.searchPlaceholder}/><kbd>ESC</kbd></label>
      <div className="site-search-results" aria-live="polite">{matches.length ? matches.map((record, index) => <Link to={record.href} key={`${record.type}-${record.href}-${index}`} onClick={() => navigateToHash(record.href)}><small>{record.type}</small><span><b>{record.title}</b><em>{record.summary}</em></span><ArrowRight size={16}/></Link>) : <p>{t.common.noResults}</p>}</div>
    </section>
  </div>
}

export function SiteUtilities() {
  const { lang, t } = useLocale()
  const [progress, setProgress] = useState(0)
  const [showTop, setShowTop] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0)
      setShowTop(window.scrollY > 500)
    }
    update(); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])
  useEffect(() => {
    if (!searchOpen) return undefined
    const onKey = event => { if (event.key === 'Escape') setSearchOpen(false) }
    document.body.style.overflow = 'hidden'; window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [searchOpen])

  return <>
    <a className="skip-link" href="#site-content">{lang === 'kz' ? 'Мазмұнға өту' : lang === 'ru' ? 'К содержимому' : 'Skip to content'}</a>
    <div className="scroll-progress" aria-hidden="true"><span style={{ width: `${progress}%` }}/></div>
    <div className="site-utility-buttons"><button className="utility-search" type="button" onClick={() => setSearchOpen(true)} aria-label={t.common.search}><Search size={19}/></button>{showTop && <button className="utility-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })} aria-label={lang === 'kz' ? 'Жоғарыға' : lang === 'ru' ? 'Наверх' : 'Back to top'}><ArrowUp size={18}/></button>}</div>
    {searchOpen && <SearchDialog close={() => setSearchOpen(false)}/>}
  </>
}

export function RouteBreadcrumbs() {
  const { lang, t } = useLocale()
  const { pathname } = useLocation()
  if (pathname === '/') return null
  const isPlacesIndex = pathname === '/places'
  const place = pathname.startsWith('/places/') ? places.find(item => item.slug === pathname.split('/').at(-1)) : null
  const route = pageKeys.find(([, path]) => path === pathname)
  const key = pathname === '/tarikh' ? 'history' : pathname === '/ecology' ? 'heritage' : pathname === '/gallery' ? 'media' : route?.[0]
  const current = isPlacesIndex ? (lang === 'kz' ? 'Табиғи мекендер' : lang === 'ru' ? 'Природные памятники' : 'Natural Habitats') : place?.name[lang] ?? (pathname.startsWith('/articles/') ? (lang === 'kz' ? 'Мақала' : lang === 'ru' ? 'Материал' : 'Article') : t.pages[key]?.title)
  if (!current) return null
  const placesLabel = lang === 'kz' ? 'Мекендер' : lang === 'ru' ? 'Места' : 'Habitats'
  return <nav className="route-breadcrumb page-wrap" aria-label={lang === 'kz' ? 'Навигация жолы' : lang === 'ru' ? 'Навигационная цепочка' : 'Breadcrumb'}>
    <Link to="/">{t.nav.home}</Link>
    <span aria-hidden="true">/</span>
    {place && <><Link to="/places">{placesLabel}</Link><span aria-hidden="true">/</span></>}
    <span aria-current="page">{current}</span>
  </nav>
}

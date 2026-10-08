import { useEffect, useRef, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, ArrowRight, BookOpen, X, ChevronLeft, ChevronRight, Maximize2, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLocale } from '../locales/context.js'
import { sourceRecords, places } from '../data/collections.js'
import { timelineCategories } from '../data/timeline.js'

export function SourceCards({ items = sourceRecords }) {
  const { lang, t } = useLocale()
  return <div className="source-grid">{items.map((item, i) => <article className="source-card" id={`source-${item.id}`} key={item.id} data-reveal>
    <div className="source-card-top"><span className="source-number">{String(i + 1).padStart(2, '0')}</span><span className="source-kind">{item.category[lang]}</span></div>
    <div><h2>{item.title}</h2><p className="source-author">{item.author}</p><p className="source-note">{item.note[lang]}</p></div>
    <div className="source-card-bottom"><span>{item.year}</span><a href={item.url} target="_blank" rel="noreferrer">{t.common.open}<ArrowUpRight size={15}/></a></div>
  </article>)}</div>
}

export function TimelineStrip({ items, compact = false }) {
  const { lang, t } = useLocale()
  return <div className={`timeline-list ${compact ? 'timeline-list-compact' : ''}`}>{items.map((item, i) => {
    const date = typeof item.date === 'string' ? item.date : item.date[lang]
    const sourceIds = Array.isArray(item.source) ? item.source : [item.source]
    const linkedSources = sourceIds.map(id => sourceRecords.find(source => source.id === id)).filter(Boolean)
    const year = item.year ?? date
    const firstOfYear = items.findIndex(record => record.year === item.year) === i
    return <article className="timeline-entry" id={`timeline-${year}${firstOfYear ? '' : `-${i}`}`} data-reveal key={`${date}-${i}`}>
      <div className="timeline-date"><span>{date}</span><i/></div>
      <div className="timeline-card"><div className="timeline-card-head"><span>0{i + 1}</span>{linkedSources[0] && <a href={linkedSources[0].url} target="_blank" rel="noreferrer" aria-label={`${t.common.open}: ${linkedSources[0].title}`}><ArrowUpRight size={15}/></a>}</div>
        <h3>{item.title[lang]}</h3><p>{item.body[lang]}</p>
        {item.details?.[lang] && <details className="timeline-detail"><summary>{lang === 'kz' ? 'Толығырақ оқу' : lang === 'ru' ? 'Читать подробнее' : 'Read more'}</summary><p>{item.details[lang]}</p></details>}
        {linkedSources.map(source => <a className="citation-link" key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.author.split(' · ')[0]}<ArrowUpRight size={12}/></a>)}
      </div>
    </article>
  })}</div>
}

export function TimelineExplorer({ items }) {
  const { lang, t } = useLocale()
  const [category, setCategory] = useState('all')
  const categoryNames = {
    kz: { all: 'Барлығы', botany: 'Ботаника', archive: 'Архив', research: 'Ғылым', heritage: 'Мәдени мұра', conservation: 'Қорғау' },
    ru: { all: 'Все темы', botany: 'Ботаника', archive: 'Архив', research: 'Исследования', heritage: 'Культурное наследие', conservation: 'Охрана' },
    en: { all: 'All topics', botany: 'Botany', archive: 'Archive', research: 'Research', heritage: 'Cultural heritage', conservation: 'Conservation' },
  }
  const filtered = items.filter(item => category === 'all' || item.category === category)
  const years = [...new Set(filtered.map(item => item.year))]
  const jumpToYear = year => document.getElementById(`timeline-${year}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' })
  return <>
    <div className="timeline-controls">
      <div className="timeline-filters" role="group" aria-label={t.common.filters}>{timelineCategories.map(key => <button type="button" key={key} onClick={() => setCategory(key)} aria-pressed={category === key} className={category === key ? 'selected' : ''}>{categoryNames[lang][key]}</button>)}</div>
      <div className="timeline-year-nav"><span>{lang === 'kz' ? 'ЖЫЛДАРҒА ӨТУ' : lang === 'ru' ? 'ПЕРЕЙТИ К ГОДУ' : 'JUMP TO YEAR'}</span>{years.map(year => <button key={year} type="button" onClick={() => jumpToYear(year)}>{year}</button>)}</div>
    </div>
    {filtered.length ? <TimelineStrip items={filtered}/> : <p className="fact-empty">{t.common.noResults}</p>}
  </>
}

export function ImageMosaic({ items, large = false }) {
  const { lang, t } = useLocale()
  const [active, setActive] = useState(-1)
  const startX = useRef(0)
  const close = () => setActive(-1)
  const move = dir => setActive(index => (index + dir + items.length) % items.length)
  useEffect(() => {
    if (active < 0) return undefined
    const onKey = event => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') move(1)
      if (event.key === 'ArrowLeft') move(-1)
    }
    document.body.style.overflow = 'hidden'; window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [active, items.length])
  return <>
    <div className={`image-mosaic ${large ? 'image-mosaic-large' : ''}`}>{items.map((item, i) => {
      const source = item.sourceId ? sourceRecords.find(record => record.id === item.sourceId) : null
      return <button className={`mosaic-card mosaic-${item.kind}`} key={item.id} onClick={() => item.image ? setActive(i) : source && window.open(source.url, '_blank', 'noopener,noreferrer')} aria-label={`${item.title[lang]} — ${item.location[lang]}`}>
        {item.image ? <><img src={item.image} srcSet={item.srcSet} sizes={large ? '(max-width: 700px) 100vw, 50vw' : '(max-width: 700px) 100vw, 40vw'} alt={item.alt?.[lang] ?? `${item.title[lang]} · ${item.author}`} loading="lazy" decoding="async" onError={event => { event.currentTarget.hidden = true; event.currentTarget.nextElementSibling.hidden = false }}/><span className="mosaic-fallback" hidden>{lang === 'kz' ? 'ФОТО ҚОЛЖЕТІМСІЗ' : lang === 'ru' ? 'ФОТО НЕДОСТУПНО' : 'IMAGE UNAVAILABLE'}</span></> : <div className="archive-card-art"><BookOpen size={42}/><span>GARTENFLORA<br/>1873 · PLATE 773</span><small>{lang==='kz'?'Түпнұсқаға өту':lang==='ru'?'К оригиналу':'Open original record'} ↗</small></div>}
        <span className="mosaic-number">0{i + 1}</span><span className="mosaic-open">{item.image ? <Maximize2 size={18}/> : <ArrowUpRight size={19}/>}</span>
        <span className="mosaic-caption"><b>{item.title[lang]}</b><small>{item.location[lang]} · {item.year}</small></span>
      </button>
    })}</div>
    {active >= 0 && <div className="lightbox" role="dialog" aria-modal="true" aria-label={items[active].title[lang]} onMouseDown={event => { if (event.target === event.currentTarget) close() }} onTouchStart={event => { startX.current = event.touches[0].clientX }} onTouchEnd={event => { const diff = event.changedTouches[0].clientX - startX.current; if (Math.abs(diff) > 65) move(diff < 0 ? 1 : -1) }}>
      <button className="lightbox-close" onClick={close} aria-label={t.common.close}><X/></button><button className="lightbox-prev" onClick={() => move(-1)} aria-label={lang==='kz'?'Алдыңғы сурет':lang==='ru'?'Предыдущее изображение':'Previous image'}><ChevronLeft/></button>
      <figure><img src={items[active].image} alt={items[active].alt?.[lang] ?? `${items[active].title[lang]} · ${items[active].author}`} /><figcaption><b>{items[active].title[lang]}</b><span>{items[active].location[lang]} · {items[active].year}</span><small>{items[active].author} · {items[active].license}{items[active].processing ? ` · ${items[active].processing}` : ''}{items[active].sourceUrl ? <> · <a href={items[active].sourceUrl} target="_blank" rel="noreferrer">{t.common.open}<ArrowUpRight size={11}/></a></> : null}</small></figcaption></figure>
      <button className="lightbox-next" onClick={() => move(1)} aria-label={lang==='kz'?'Келесі сурет':lang==='ru'?'Следующее изображение':'Next image'}><ChevronRight/></button><div className="lightbox-count">{String(active+1).padStart(2,'0')} / {String(items.length).padStart(2,'0')}</div>
    </div>}
  </>
}

export function MapTeaser() {
  const { lang } = useLocale()
  const labels = { kz: ['Ақсу-Жабағылы','Шымкент','Түркістан','Қазығұрт'], ru: ['Аксу-Жабаглы','Шымкент','Туркестан','Казыгурт'], en: ['Aksu-Zhabagly','Shymkent','Turkistan','Kazygurt'] }
  const points = [places[0], places[2], places[3], places[1]]
  return <div className="map-teaser-art">
    <svg className="map-contours" viewBox="0 0 1200 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><pattern id="topo" width="170" height="135" patternUnits="userSpaceOnUse"><path d="M-30 70c30-44 91-50 140-24s75 14 85-13M-29 91c43-37 91-33 127-10s69 17 93-9M-30 113c43-30 83-18 116 0s70 19 104-3M-23 37C8 4 70-3 106 21s73 20 92 0" fill="none" stroke="#c4ad85" strokeWidth="1" opacity=".45"/></pattern><linearGradient id="mapbg" x2="0" y2="1"><stop stopColor="#ddd0b5"/><stop offset="1" stopColor="#f0e8d8"/></linearGradient></defs><rect width="1200" height="450" fill="url(#mapbg)"/><rect width="1200" height="450" fill="url(#topo)"/><path d="M-20 314c194-69 291 16 435-21s207-123 364-81 233 96 452 48" fill="none" stroke="#b06c4d" strokeWidth="2" strokeDasharray="5 8" opacity=".8"/><path d="M-20 376c171-38 236-101 401-81s274 108 427 34 250-120 414-75" fill="none" stroke="#728069" strokeWidth="1" strokeDasharray="2 9" opacity=".6"/></svg>
    <div className="teaser-map-label">SOUTHERN KAZAKHSTAN <span>·</span> FIELD GUIDE</div>
    {points.map((place, i) => <Link to={`/places/${place.slug}`} className={`teaser-pin teaser-pin-${i+1}`} key={place.slug}><span className="teaser-pin-dot"><MapPin size={17}/></span><span>{labels[lang][i]}</span></Link>)}
    <Link to="/map" className="map-teaser-cta">{lang==='kz'?'Картаға өту':lang==='ru'?'Перейти к карте':'Explore the map'}<ArrowRight size={15}/></Link>
  </div>
}

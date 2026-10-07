import { useMemo, useState } from 'react'
import { ArrowUpRight, ChevronDown, Search } from 'lucide-react'
import { facts, factCategories } from '../data/facts.js'
import { sourceRecords } from '../data/collections.js'
import { useLocale } from '../locales/context.js'

const labels = {
  kz: { all: 'Барлығы', science: 'Биология', history: 'Тарих', geography: 'Ареал', conservation: 'Қорғау', heritage: 'Мәдени контекст', archive: 'Архив', verified: 'Дерекпен расталған', qualified: 'Нақтылаумен берілген', interpretation: 'Тарихи түсіндірме', read: 'Толығырақ', count: 'дерек', empty: 'Бұл сүзгіге сай дерек жоқ.' },
  ru: { all: 'Все темы', science: 'Биология', history: 'История', geography: 'Ареал', conservation: 'Охрана', heritage: 'Культурный контекст', archive: 'Архив', verified: 'Подтверждено источником', qualified: 'С оговоркой', interpretation: 'Историческая интерпретация', read: 'Подробнее', count: 'фактов', empty: 'По этому фильтру ничего не найдено.' },
  en: { all: 'All topics', science: 'Botany', history: 'History', geography: 'Range', conservation: 'Conservation', heritage: 'Cultural context', archive: 'Archive', verified: 'Source verified', qualified: 'Qualified claim', interpretation: 'Historical interpretation', read: 'Read more', count: 'facts', empty: 'No records match this filter.' },
}

export function FactExplorer({ limit = null }) {
  const { lang, t } = useLocale()
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(null)
  const copy = labels[lang]
  const visibleFacts = useMemo(() => facts.filter(fact => {
    const text = [fact.title[lang], typeof fact.value === 'string' ? fact.value : fact.value[lang], fact.detail[lang]].join(' ').toLocaleLowerCase()
    return (category === 'all' || fact.category === category) && (!query.trim() || text.includes(query.trim().toLocaleLowerCase()))
  }), [category, lang, query])
  const items = limit ? visibleFacts.slice(0, limit) : visibleFacts

  return <div className="fact-explorer">
    {!limit && <div className="fact-controls">
      <label className="fact-search"><Search size={17}/><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t.common.searchPlaceholder} aria-label={t.common.search}/></label>
      <div className="fact-filters" role="group" aria-label={t.common.filters}>{factCategories.map(key => <button type="button" key={key} className={category === key ? 'selected' : ''} aria-pressed={category === key} onClick={() => setCategory(key)}>{copy[key]}</button>)}</div>
    </div>}
    <div className="fact-grid" aria-live="polite">
      {items.map((fact, index) => {
        const sources = (Array.isArray(fact.source) ? fact.source : [fact.source]).map(id => sourceRecords.find(source => source.id === id)).filter(Boolean)
        const isOpen = expanded === fact.id
        return <article className={`fact-card ${isOpen ? 'is-expanded' : ''}`} id={`fact-${fact.id}`} key={fact.id} data-reveal>
          <div className="fact-card-top"><span>{String(index + 1).padStart(2, '0')}</span><small>{copy[fact.status]}</small></div>
          <span className="eyebrow">{copy[fact.category]}</span>
          <h2>{fact.title[lang]}</h2>
          <p className="fact-value">{typeof fact.value === 'string' ? fact.value : fact.value[lang]}</p>
          <button type="button" className="fact-expand" aria-expanded={isOpen} onClick={() => setExpanded(isOpen ? null : fact.id)}>{copy.read}<ChevronDown size={15}/></button>
          {isOpen && <div className="fact-detail"><p>{fact.detail[lang]}</p><div className="fact-citations">{sources.map(source => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{t.common.citation}: {source.author.split(' · ')[0]}<ArrowUpRight size={12}/></a>)}</div></div>}
        </article>
      })}
    </div>
    {!items.length && <p className="fact-empty">{copy.empty}</p>}
    {limit && <p className="fact-count">{facts.length} {copy.count}</p>}
  </div>
}

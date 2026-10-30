import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { ArrowRight, ArrowUpRight, MapPin, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { places as curatedPlaces } from '../data/collections.js'
import { useLocale } from '../locales/context.js'
import { cityLabel, parse2gisUrl } from '../lib/parse2gis.js'
import 'leaflet/dist/leaflet.css'
import './MapExperience.css'

const STORAGE_KEY = 'greig-visitor-habitats'
const ROUTE_SLUGS = ['kazygurt', 'aqsu-zhabagly', 'shubaykyzyl', 'karatau', 'turkistan']

function loadAdded() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(raw) ? raw.filter(item => item && Number.isFinite(item.lat) && Number.isFinite(item.lng) && item.name) : []
  } catch {
    return []
  }
}

function saveAdded(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* Private mode can block localStorage; the pin still appears for this session. */
  }
}

function formatCoord(lat, lng) {
  return `${lat.toFixed(2)}° N, ${lng.toFixed(2)}° E`
}

function toPlace(record, lang, copy) {
  const regionText = cityLabel(record.city, lang)
  const name = record.name
  return {
    slug: record.id,
    custom: true,
    coord: [record.lat, record.lng],
    coordsLabel: formatCoord(record.lat, record.lng),
    gisUrl: record.gisUrl,
    name: { kz: name, ru: name, en: name },
    region: { kz: regionText, ru: regionText, en: regionText },
    summary: { kz: copy.added, ru: copy.added, en: copy.added },
  }
}

function errorMessage(copy, code) {
  if (code === 'empty') return copy.empty
  if (code === 'needName') return copy.needName
  if (code === 'invalid') return copy.invalid
  if (code === 'not_2gis') return copy.notGis
  if (code === 'short') return copy.short
  if (code === 'coords') return copy.coords
  if (code === 'duplicate') return copy.duplicate
  return copy.invalid
}

export function MuseumMap({ compact = false }) {
  const { lang, t } = useLocale()
  const copy = t.mapAdd
  const [activeSlug, setActiveSlug] = useState('aqsu-zhabagly')
  const [tileFailed, setTileFailed] = useState(false)
  const [added, setAdded] = useState(() => loadAdded())
  const [name, setName] = useState('')
  const [gisUrl, setGisUrl] = useState('')
  const [formError, setFormError] = useState('')
  const mapRef = useRef(null)

  const extraPlaces = useMemo(() => added.map(item => toPlace(item, lang, copy)), [added, lang, copy])
  const allPlaces = useMemo(() => [...curatedPlaces, ...extraPlaces], [extraPlaces])
  const active = allPlaces.find(place => place.slug === activeSlug) ?? allPlaces[0]
  const markerIcon = useMemo(() => divIcon({ className: 'greig-div-marker', html: '<span>✿</span>', iconSize: [36, 36], iconAnchor: [18, 32], popupAnchor: [0, -30] }), [])
  const customIcon = useMemo(() => divIcon({ className: 'greig-div-marker is-custom', html: '<span>✿</span>', iconSize: [36, 36], iconAnchor: [18, 32], popupAnchor: [0, -30] }), [])

  useEffect(() => {
    saveAdded(added)
  }, [added])

  const choose = place => {
    setActiveSlug(place.slug)
    mapRef.current?.flyTo(place.coord, place.custom ? 14 : 9, { duration: 0.6 })
  }

  const addPlace = event => {
    event.preventDefault()
    const placeName = name.trim()
    if (!placeName) {
      setFormError('needName')
      return
    }
    if (!gisUrl.trim()) {
      setFormError('empty')
      return
    }
    const parsed = parse2gisUrl(gisUrl)
    if (parsed.error) {
      setFormError(parsed.error)
      return
    }
    const duplicate = [...curatedPlaces.map(place => ({ lat: place.coord[0], lng: place.coord[1] })), ...added]
      .some(item => Math.abs(item.lat - parsed.lat) < 0.0004 && Math.abs(item.lng - parsed.lng) < 0.0004)
    if (duplicate) {
      setFormError('duplicate')
      return
    }
    const record = {
      id: `added-${Date.now()}`,
      name: placeName,
      lat: parsed.lat,
      lng: parsed.lng,
      city: parsed.city,
      gisUrl: parsed.url,
    }
    setAdded(current => [...current, record])
    setName('')
    setGisUrl('')
    setFormError('')
    setActiveSlug(record.id)
    window.setTimeout(() => mapRef.current?.flyTo([record.lat, record.lng], 14, { duration: 0.7 }), 40)
  }

  const removePlace = slug => {
    setAdded(current => current.filter(item => item.id !== slug))
    if (activeSlug === slug) setActiveSlug(curatedPlaces[0].slug)
  }

  return <div className={`interactive-map ${compact ? 'interactive-map-compact' : ''}`}>
    <aside className="map-place-list">
      <div className="map-list-header">
        <span className="eyebrow">{lang==='kz'?'КАРТАДАҒЫ МЕКЕНДЕР':lang==='ru'?'ТОЧКИ НА КАРТЕ':'PLACES ON THE MAP'}</span>
        <span>{String(allPlaces.length).padStart(2, '0')}</span>
      </div>
      <div className="map-place-scroll">
        {allPlaces.map((place, i) => (
          <button className={`map-place-option ${active.slug===place.slug?'selected':''}`} key={place.slug} onClick={() => choose(place)} aria-pressed={active.slug===place.slug}>
            <span className="map-list-index">{String(i + 1).padStart(2, '0')}</span>
            <span>
              <b>{place.name[lang]}</b>
              <small>{place.custom ? copy.visitor : place.region[lang]}</small>
            </span>
            <ArrowRight size={16}/>
          </button>
        ))}
      </div>
      <div className="map-selected-card">
        <span className="eyebrow">{active.custom ? copy.visitor : (lang==='kz'?'МЕКЕН ТУРАЛЫ':lang==='ru'?'КАРТОЧКА МЕСТА':'PLACE NOTE')}</span>
        <h2>{active.name[lang]}</h2>
        <p>{active.summary[lang]}</p>
        {active.custom ? (
          <div className="map-custom-actions">
            <a href={active.gisUrl} target="_blank" rel="noreferrer">{copy.openGis}<ArrowUpRight size={15}/></a>
            <button type="button" className="map-remove-pin" onClick={() => removePlace(active.slug)}>
              <Trash2 size={14}/>{copy.remove}
            </button>
          </div>
        ) : (
          <Link to={`/places/${active.slug}`}>{lang==='kz'?'Мекенді таныңыз':lang==='ru'?'Подробнее':'Explore place'}<ArrowRight size={15}/></Link>
        )}
      </div>
      {!compact && (
        <form className="map-add-form" onSubmit={addPlace}>
          <span className="eyebrow">{copy.title}</span>
          <p>{copy.lead}</p>
          <label>
            <span>{copy.name}</span>
            <input type="text" value={name} onChange={event => setName(event.target.value)} placeholder={copy.namePlaceholder} autoComplete="off"/>
          </label>
          <label>
            <span>{copy.url}</span>
            <input type="text" value={gisUrl} onChange={event => setGisUrl(event.target.value)} placeholder={copy.urlPlaceholder} autoComplete="off"/>
          </label>
          {formError && <small className="map-add-error">{errorMessage(copy, formError)}</small>}
          <button type="submit">{copy.add}</button>
        </form>
      )}
      <small className="map-coordinate-note"><MapPin size={13}/>{lang==='kz'?'Координаталар — бағдарлық нүкте':lang==='ru'?'Координаты служат ориентиром':'Coordinates are orientation points'}</small>
    </aside>
    <div className={`leaflet-frame ${tileFailed?'tile-fallback':''}`}>
      {tileFailed && <div className="map-fallback-art"><span>42° N</span><b>{lang === 'kz' ? 'ОҢТҮСТІК ҚАЗАҚСТАН' : lang === 'ru' ? 'ЮЖНЫЙ КАЗАХСТАН' : 'SOUTHERN KAZAKHSTAN'}</b><i>39°</i><i>40°</i><i>41°</i><i>42°</i></div>}
      <MapContainer ref={mapRef} center={[42.5,69.7]} zoom={7} minZoom={5} maxZoom={16} scrollWheelZoom={false} zoomControl={!compact} className="leaflet-map" aria-label={lang==='kz'?'Оңтүстік Қазақстанның интерактивті картасы':lang==='ru'?'Интерактивная карта Южного Казахстана':'Interactive map of Southern Kazakhstan'}>
        {!tileFailed && <TileLayer attribution={`&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">${lang === 'kz' ? 'Ашық көше картасына үлес қосқандар' : lang === 'ru' ? 'Участники OpenStreetMap' : 'OpenStreetMap contributors'}</a>`} url={import.meta.env.VITE_MAP_TILES || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} eventHandlers={{ tileerror: () => setTileFailed(true) }} />}
        <Polyline positions={ROUTE_SLUGS.map(slug => curatedPlaces.find(place => place.slug === slug)?.coord).filter(Boolean)} pathOptions={{ color: '#a47445', weight: 3, opacity: 0.75, dashArray: '7 8' }} interactive={false}/>
        {allPlaces.map(place => (
          <Marker key={place.slug} position={place.coord} icon={place.custom ? customIcon : markerIcon} eventHandlers={{ click: () => setActiveSlug(place.slug) }}>
            <Popup>
              <div className="map-popup">
                <b>{place.name[lang]}</b>
                <span>{place.custom ? copy.added : place.region[lang]}</span>
                {place.custom
                  ? <a href={place.gisUrl} target="_blank" rel="noreferrer">{copy.openGis} ↗</a>
                  : <Link to={`/places/${place.slug}`}>{lang==='kz'?'Мекенді зерттеу':lang==='ru'?'Исследовать место':'Explore place'} ↗</Link>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="map-route-note"><span aria-hidden="true"/><small>{lang==='kz'?'Тарихи байланыс сызбасы · гүлдің таралу жолы емес':lang==='ru'?'Схема исторических связей · не маршрут цветка':'Schematic historical context · not a flower migration route'}</small></div>
      <div className="map-scale-note">{tileFailed ? (lang==='kz'?'Желі өшкендегі бағдар картасы':lang==='ru'?'Автономная обзорная карта':'Offline orientation map') : lang === 'kz' ? 'Ашық көше картасы · дерекке үлес қосқандар' : lang === 'ru' ? 'OpenStreetMap · © Участники OSM' : 'OpenStreetMap · © OSM contributors'}</div>
      <div className="map-north" aria-hidden="true">{lang === 'en' ? 'N' : 'С'}<i>↑</i></div>
    </div>
  </div>
}

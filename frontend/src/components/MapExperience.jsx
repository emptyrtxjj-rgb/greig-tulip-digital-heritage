import { useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { places } from '../data/collections.js'
import { useLocale } from '../locales/context.js'
import 'leaflet/dist/leaflet.css'

export function MuseumMap({ compact = false }) {
  const { lang } = useLocale()
  const [activeSlug, setActiveSlug] = useState('aqsu-zhabagly')
  const [tileFailed, setTileFailed] = useState(false)
  const mapRef = useRef(null)
  const active = places.find(place => place.slug === activeSlug) ?? places[0]
  const markerIcon = useMemo(() => divIcon({ className: 'greig-div-marker', html: '<span>✿</span>', iconSize: [36, 36], iconAnchor: [18, 32], popupAnchor: [0, -30] }), [])
  const choose = place => {
    setActiveSlug(place.slug)
    mapRef.current?.flyTo(place.coord, 9, { duration: 0.6 })
  }
  return <div className={`interactive-map ${compact ? 'interactive-map-compact' : ''}`}>
    <aside className="map-place-list"><div className="map-list-header"><span className="eyebrow">{lang==='kz'?'КАРТАДАҒЫ ОРЫНДАР':lang==='ru'?'ТОЧКИ НА КАРТЕ':'PLACES ON THE MAP'}</span><span>0{places.length}</span></div>
      {places.map((place, i) => <button className={`map-place-option ${active.slug===place.slug?'selected':''}`} key={place.slug} onClick={() => choose(place)} aria-pressed={active.slug===place.slug}><span className="map-list-index">0{i+1}</span><span><b>{place.name[lang]}</b><small>{place.region[lang]}</small></span><ArrowRight size={16}/></button>)}
      <div className="map-selected-card"><span className="eyebrow">{lang==='kz'?'МЕКЕН КАРТОЧКАСЫ':lang==='ru'?'КАРТОЧКА МЕСТА':'PLACE NOTE'}</span><h2>{active.name[lang]}</h2><p>{active.summary[lang]}</p><Link to={`/places/${active.slug}`}>{lang==='kz'?'Толығырақ':lang==='ru'?'Подробнее':'Explore place'}<ArrowRight size={15}/></Link></div>
      <small className="map-coordinate-note"><MapPin size={13}/>{lang==='kz'?'Координаталар — бағдарлық нүкте':lang==='ru'?'Координаты служат ориентиром':'Coordinates are orientation points'}</small>
    </aside>
    <div className={`leaflet-frame ${tileFailed?'tile-fallback':''}`}>
      {tileFailed && <div className="map-fallback-art"><span>42° N</span><b>ОҢТҮСТІК ҚАЗАҚСТАН</b><i>39°</i><i>40°</i><i>41°</i><i>42°</i></div>}
      <MapContainer ref={mapRef} center={[42.5,69.7]} zoom={7} minZoom={5} maxZoom={15} scrollWheelZoom={false} zoomControl={!compact} className="leaflet-map" aria-label={lang==='kz'?'Оңтүстік Қазақстанның интерактивті картасы':lang==='ru'?'Интерактивная карта Южного Казахстана':'Interactive map of Southern Kazakhstan'}>
        {!tileFailed && <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors' url={import.meta.env.VITE_MAP_TILES || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} eventHandlers={{ tileerror: () => setTileFailed(true) }} />}
        <Polyline positions={['sayram','otrar','turkistan'].map(slug => places.find(place => place.slug === slug).coord)} pathOptions={{ color: '#a47445', weight: 3, opacity: 0.75, dashArray: '7 8' }} interactive={false}/>
        {places.map(place => <Marker key={place.slug} position={place.coord} icon={markerIcon} eventHandlers={{ click: () => setActiveSlug(place.slug) }}>
          <Popup><div className="map-popup"><b>{place.name[lang]}</b><span>{place.region[lang]}</span><Link to={`/places/${place.slug}`}>{lang==='kz'?'Мекенді зерттеу':lang==='ru'?'Исследовать место':'Explore place'} ↗</Link></div></Popup>
        </Marker>)}
      </MapContainer>
      <div className="map-route-note"><span aria-hidden="true"/><small>{lang==='kz'?'Тарихи байланыс сызбасы · гүлдің таралу жолы емес':lang==='ru'?'Схема исторических связей · не маршрут цветка':'Schematic historical context · not a flower migration route'}</small></div>
      <div className="map-scale-note">{tileFailed ? (lang==='kz'?'Офлайн бағдар картасы':lang==='ru'?'Автономная обзорная карта':'Offline orientation map') : 'OpenStreetMap · © OSM contributors'}</div>
      <div className="map-north" aria-hidden="true">N<i>↑</i></div>
    </div>
  </div>
}

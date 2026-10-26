import React, { useState } from 'react'
import { Play, Sparkles, Video, ExternalLink, CheckCircle2 } from 'lucide-react'
import { videoMaterials } from '../data/videoMaterials.js'
import { useLocale } from '../locales/context.js'
import './VideoChronicle.css'

export function VideoChronicleSection({ compact = false }) {
  const { lang } = useLocale()
  const [activeVideoId, setActiveVideoId] = useState(videoMaterials[0].id)

  const activeVideo = videoMaterials.find((v) => v.id === activeVideoId) || videoMaterials[0]

  const copy = {
    kz: {
      eyebrow: 'РЕСМИ ДЕРЕКТІ БЕЙНЕХРОНИКА ЖӘНЕ РЕПОРТАЖДАР',
      title: 'Грейг қызғалдағы туралы бейнеқор',
      lead: 'Оңтүстік Қазақстанның жабайы табиғатынан, телеарналардың арнайы репортаждарынан және Қызыл кітапты қорғау рейдтерінен алынған шынайы бейнематериалдар.',
      badge: '3 Ресми бейнематериал',
      nowPlaying: 'Қазір қаралуда',
      watchOnYoutube: 'YouTube-та көру',
      playVideo: 'Бейнені қосу',
    },
    ru: {
      eyebrow: 'ДОКУМЕНТАЛЬНАЯ ВИДЕОХРОНИКА И СПЕЦИАЛЬНЫЕ РЕПОРТАЖИ',
      title: 'Видеоархив тюльпана Грейга',
      lead: 'Подлинные видеосюжеты республиканских телеканалов о массовом цветении диких тюльпанов в Южном Казахстане и мерах государственной защиты Красной книги.',
      badge: '3 Официальных видеосюжета',
      nowPlaying: 'Сейчас воспроизводится',
      watchOnYoutube: 'Смотреть на YouTube',
      playVideo: 'Смотреть видео',
    },
    en: {
      eyebrow: 'DOCUMENTARY VIDEO CHRONICLE & FIELD REPORTS',
      title: 'Greig\'s Tulip Video Archive',
      lead: 'Authentic documentary footage from national television channels capturing the mass spring flowering and strict conservation laws in Southern Kazakhstan.',
      badge: '3 Official Video Reports',
      nowPlaying: 'Now playing',
      watchOnYoutube: 'Watch on YouTube',
      playVideo: 'Play video',
    },
  }[lang]

  return (
    <section className="video-chronicle-section page-wrap" data-reveal aria-labelledby="video-chronicle-title">
      <div className="video-chronicle-header">
        <div>
          <span className="eyebrow">
            <Video size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} />
            {copy.eyebrow}
          </span>
          <h2 id="video-chronicle-title">{copy.title}</h2>
          <p className="video-chronicle-lead">{copy.lead}</p>
        </div>
        <span className="video-chronicle-badge">
          <Sparkles size={13} />
          {copy.badge}
        </span>
      </div>

      {/* Main active video player */}
      <div className="video-player-card">
        <div className="video-player-frame-wrap">
          <iframe
            src={`${activeVideo.embedUrl}?rel=0&modestbranding=1`}
            title={activeVideo.title[lang]}
            className="video-player-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>

        <div className="video-player-meta">
          <div className="video-player-tag-row">
            <span className="video-player-badge">{activeVideo.badge[lang]}</span>
            <span className="video-player-channel">
              <b>{activeVideo.channel}</b>
              <a
                href={activeVideo.url}
                target="_blank"
                rel="noreferrer"
                className="button-link"
                style={{ color: '#e5c27f', marginLeft: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>{copy.watchOnYoutube}</span>
                <ExternalLink size={12} />
              </a>
            </span>
          </div>

          <h3 className="video-player-title">{activeVideo.title[lang]}</h3>
          <p className="video-player-desc">{activeVideo.description[lang]}</p>
        </div>
      </div>

      {/* Selector grid of all 3 videos */}
      <div className="video-selector-grid">
        {videoMaterials.map((v) => {
          const isActive = v.id === activeVideoId
          return (
            <button
              key={v.id}
              type="button"
              className={`video-thumb-card ${isActive ? 'is-active' : ''}`}
              onClick={() => setActiveVideoId(v.id)}
              aria-pressed={isActive}
            >
              <div className="video-thumb-media">
                <img
                  src={v.thumbnail}
                  alt={v.title[lang]}
                  className="video-thumb-img"
                  loading="lazy"
                />
                <div className="video-thumb-play-overlay">
                  <div className="video-play-circle">
                    <Play size={18} fill="currentColor" />
                  </div>
                </div>
                <span className="video-thumb-badge-floating">{v.channel}</span>
              </div>

              <div className="video-thumb-body">
                <span className="video-thumb-channel">{v.badge[lang]}</span>
                <h4 className="video-thumb-title">{v.title[lang]}</h4>
                {isActive ? (
                  <span className="video-thumb-status">
                    <CheckCircle2 size={13} />
                    {copy.nowPlaying}
                  </span>
                ) : (
                  <span className="video-thumb-status" style={{ color: '#7a6d5a' }}>
                    {copy.playVideo} →
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

/**
 * Dedicated single video card for placing inside specific niche pages (e.g. /heritage)
 */
export function NicheVideoCard({ videoId = 'nZ3xwTtdzIg' }) {
  const { lang } = useLocale()
  const video = videoMaterials.find((v) => v.id === videoId) || videoMaterials[0]

  const copy = {
    kz: {
      watchOnYoutube: 'YouTube арқылы ашу',
      reportBadge: 'ДЕРЕКТІ РЕПОРТАЖ',
    },
    ru: {
      watchOnYoutube: 'Открыть на YouTube',
      reportBadge: 'СПЕЦИАЛЬНЫЙ РЕПОРТАЖ',
    },
    en: {
      watchOnYoutube: 'Open on YouTube',
      reportBadge: 'SPECIAL REPORT',
    },
  }[lang]

  return (
    <div className="niche-video-card" data-reveal>
      <div className="niche-video-header">
        <span className="eyebrow">
          <Video size={13} style={{ verticalAlign: '-1px', marginRight: '5px' }} />
          {copy.reportBadge} · {video.badge[lang]}
        </span>
        <h3>{video.title[lang]}</h3>
      </div>

      <div className="niche-video-frame">
        <iframe
          src={`${video.embedUrl}?rel=0&modestbranding=1`}
          title={video.title[lang]}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>

      <div className="niche-video-footer">
        <span>{video.description[lang]}</span>
        <a href={video.url} target="_blank" rel="noreferrer">
          <span>{copy.watchOnYoutube}</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  )
}

export default VideoChronicleSection

import React, { useEffect, useRef, useState } from 'react'
import {
  FastForward,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Rewind,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useLocale } from '../locales/context.js'
import './MainVideoFeature.css'

export function MainVideoFeature() {
  const { lang } = useLocale()
  const videoRef = useRef(null)
  const containerRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const hideControlsTimeout = useRef(null)

  const copy = {
    kz: {
      badge: 'БАСТЫ КИНОМАТЕРИАЛ · 4K МҰРАҒАТ',
      title: '«Дала мұрасы: Грейг қызғалдағының шежіресі»',
      synopsis:
        'Жобаның басты деректі бейнефильмі: Оңтүстік Қазақстанның қорықтары мен тау бөктерлеріндегі сирек Грейг қызғалдағының (Tulipa greigii) сұлулығы, Ұлы Жібек жолы тарихы және табиғи мұраны қорғау шежіресі.',
      playPrompt: 'Басты фильмді қарау',
      location: 'Оңтүстік Қазақстан · Ақсу-Жабағылы мен Шубайқызыл',
      quality: '4K Ultra HD · Түпнұсқа',
      archiveId: 'ARCHIVE-KZ-2026-MAIN',
    },
    ru: {
      badge: 'ГЛАВНЫЙ ВИДЕОМАТЕРИАЛ · 4K АРХИВ',
      title: '«Наследие степи: Летопись тюльпана Грейга»',
      synopsis:
        'Главный документальный видеофильм проекта: первозданная красота краснокнижного тюльпана Грейга (Tulipa greigii) в заповедниках Южного Казахстана, перекрестки Шёлкового пути и сохранение степного наследия.',
      playPrompt: 'Смотреть главный фильм',
      location: 'Южный Казахстан · Аксу-Жабаглы и урочище Шубайкызыл',
      quality: '4K Ultra HD · Оригинал',
      archiveId: 'ARCHIVE-KZ-2026-MAIN',
    },
    en: {
      badge: 'FLAGSHIP FILM · 4K DIGITAL ARCHIVE',
      title: '“Steppe Heritage: Chronicle of Greig’s Tulip”',
      synopsis:
        'The premier documentary film of the project: the pristine majesty of the Red Book Greig’s tulip (Tulipa greigii) across Southern Kazakhstan’s nature reserves, Silk Road crossings, and the vital conservation of steppe heritage.',
      playPrompt: 'Watch Feature Film',
      location: 'Southern Kazakhstan · Aksu-Zhabagly & Shubaykyzyl',
      quality: '4K Ultra HD · Original Master',
      archiveId: 'ARCHIVE-KZ-2026-MAIN',
    },
  }[lang]

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play().catch((err) => console.log('Video play error:', err))
      setIsPlaying(true)
      setHasStarted(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return
    setCurrentTime(video.currentTime)
    if (video.duration) {
      setProgress((video.currentTime / video.duration) * 100)
    }
  }

  const handleLoadedMetadata = () => {
    const video = videoRef.current
    if (!video) return
    setDuration(video.duration)
  }

  const handleSeek = (e) => {
    const video = videoRef.current
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, clickX / rect.width))
    if (video && video.duration) {
      video.currentTime = percent * video.duration
      setProgress(percent * 100)
    }
  }

  const skipSeconds = (seconds) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
  }

  const toggleFullscreen = () => {
    const frame = containerRef.current
    if (!frame) return

    if (!document.fullscreenElement) {
      frame.requestFullscreen().then(() => setIsFullscreen(true)).catch((err) => console.log(err))
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch((err) => console.log(err))
    }
  }

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const triggerControlsShow = () => {
    setControlsVisible(true)
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current)
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) setControlsVisible(false)
    }, 2800)
  }

  return (
    <section className="main-film-section" id="main-film" data-reveal aria-labelledby="main-film-title">
      <div className="main-film-ambient-glow" aria-hidden="true" />

      <div className="main-film-header">
        <div className="main-film-badge-row">
          <span className="main-film-dot" />
          <span className="main-film-badge-text">{copy.badge}</span>
        </div>
        <h2 id="main-film-title" className="main-film-title">
          {copy.title}
        </h2>
        <p className="main-film-synopsis">{copy.synopsis}</p>
      </div>

      <div className="main-film-cinema-wrap">
        <div
          ref={containerRef}
          className={`main-film-frame ${controlsVisible ? 'is-controls-visible' : ''}`}
          onMouseMove={triggerControlsShow}
          onTouchStart={triggerControlsShow}
        >
          <video
            ref={videoRef}
            className="main-film-video"
            src="/videos/main-video.mp4"
            poster="/images/tulipa-greigii-wild.webp"
            preload="metadata"
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
          />

          {/* Big Play Overlay before video has started */}
          {!hasStarted && (
            <div className="main-film-poster-overlay" onClick={togglePlay} role="button" tabIndex={0}>
              <div className="main-film-big-play-btn" aria-label={copy.playPrompt}>
                <Play size={38} fill="currentColor" stroke="none" />
              </div>
              <span className="main-film-play-label">{copy.playPrompt}</span>
            </div>
          )}

          {/* Custom Controls Bar */}
          <div className="main-film-controls-bar">
            {/* Timeline Scrub Bar */}
            <div
              className="main-film-scrub-wrap"
              onClick={handleSeek}
              role="slider"
              aria-label="Seek timeline"
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div className="main-film-scrub-fill" style={{ width: `${progress}%` }}>
                <span className="main-film-scrub-thumb" />
              </div>
            </div>

            {/* Buttons Row */}
            <div className="main-film-ctrl-row">
              <div className="main-film-ctrl-left">
                <button
                  type="button"
                  className="main-film-ctrl-btn"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
                </button>

                <button
                  type="button"
                  className="main-film-ctrl-btn"
                  onClick={() => skipSeconds(-10)}
                  title="-10s"
                  aria-label="Rewind 10 seconds"
                >
                  <Rewind size={18} />
                </button>

                <button
                  type="button"
                  className="main-film-ctrl-btn"
                  onClick={() => skipSeconds(10)}
                  title="+10s"
                  aria-label="Fast forward 10 seconds"
                >
                  <FastForward size={18} />
                </button>

                <button
                  type="button"
                  className="main-film-ctrl-btn"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}
                </button>

                <span className="main-film-time">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="main-film-ctrl-right">
                <span className="main-film-pill">{copy.quality}</span>
                <button
                  type="button"
                  className="main-film-ctrl-btn"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cinematic Meta Information Bar */}
        <div className="main-film-meta-footer">
          <div className="main-film-meta-item">
            <span>📍</span>
            <span>{copy.location}</span>
          </div>
          <div className="main-film-meta-item">
            <span>🎞️</span>
            <strong>{copy.archiveId}</strong>
          </div>
          <div className="main-film-meta-item">
            <span>⌛</span>
            <span>{formatTime(duration || 165)} · Ultra HD</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MainVideoFeature

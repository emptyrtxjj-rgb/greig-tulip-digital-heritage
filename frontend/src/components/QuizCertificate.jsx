import React, { useEffect, useRef, useState } from 'react'
import { Award, Check, Download, Eye, Printer, Sparkles } from 'lucide-react'
import { useLocale } from '../locales/context.js'
import './QuizCertificate.css'

export function QuizCertificate({ score = 5, total = 5, unlockedLevel = null }) {
  const { lang: siteLang } = useLocale()
  const [certLang, setCertLang] = useState(siteLang)
  const [participantName, setParticipantName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const imageRef = useRef(null)

  // Keep certificate language synced with site language initially
  useEffect(() => {
    setCertLang(siteLang)
  }, [siteLang])

  const copy = {
    kz: {
      congrats: 'ҚҰТТЫҚТАЙМЫЗ! СЕРТИФИКАТ ТАБЫСТАЛАДЫ',
      title: '«Дала мұрасын қорғаушы» ресми сертификаты',
      desc: 'Тесттен сәтті өткеніңіз үшін сізге жеке сертификат тағайындалды. Төменге аты-жөніңізді жазып, сертификатты жоғары сапада жүктеп алыңыз немесе басып шығарыңыз.',
      nameLabel: 'Аты-жөніңіз (Ф.И.О.):',
      placeholder: 'Мысалы: Нұрланұлы Айдос',
      defaultName: 'Қазақстан азаматы',
      downloadBtn: 'Сертификатты жүктеу (JPG)',
      downloading: 'Жүктелуде...',
      printBtn: 'Басып шығару',
      datePrefix: '27.10.2026 ж.',
      langLabel: 'Сертификат тілі:',
    },
    ru: {
      congrats: 'ПОЗДРАВЛЯЕМ! ВАМ ПРИСВОЕН СЕРТИФИКАТ',
      title: 'Официальный сертификат «Защитник наследия степи»',
      desc: 'За успешное прохождение историко-ботанического теста вам присвоен персональный сертификат. Укажите ваше Ф.И.О. и скачайте сертификат в высоком разрешении или распечатайте.',
      nameLabel: 'Ваше Ф.И.О.:',
      placeholder: 'Например: Иванов Александр',
      defaultName: 'Защитник природы',
      downloadBtn: 'Скачать сертификат (JPG)',
      downloading: 'Формирование...',
      printBtn: 'Печать сертификата',
      datePrefix: '27.10.2026 г.',
      langLabel: 'Язык сертификата:',
    },
    en: {
      congrats: 'CONGRATULATIONS! CERTIFICATE AWARDED',
      title: 'Official “Steppe Heritage Protector” Certificate',
      desc: 'For your outstanding completion of the historical & botanical quiz, you have been awarded this official certificate. Enter your name and download or print in high resolution.',
      nameLabel: 'Full Name:',
      placeholder: 'e.g. Alex Morgan',
      defaultName: 'Steppe Explorer',
      downloadBtn: 'Download Certificate (JPG)',
      downloading: 'Rendering...',
      printBtn: 'Print Certificate',
      datePrefix: '27.10.2026',
      langLabel: 'Certificate Language:',
    },
  }[certLang] || {
    kz: {},
    ru: {},
    en: {},
  }[siteLang]

  const certImageSrc = `/images/certificates/certificate-${certLang}.jpg`
  const displayName = participantName.trim() || copy.defaultName

  // Compute dynamic current date
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy = today.getFullYear() || 2026
  const dateString =
    certLang === 'kz'
      ? `${dd}.${mm}.${yyyy} ж.`
      : certLang === 'ru'
        ? `${dd}.${mm}.${yyyy} г.`
        : `${dd}.${mm}.${yyyy}`

  // High-Resolution Canvas Download Generator
  const handleDownload = () => {
    setIsGenerating(true)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = certImageSrc

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        // Double resolution for ultra crisp print quality
        canvas.width = 2048
        canvas.height = 1152
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          setIsGenerating(false)
          return
        }

        // 1. Draw base certificate template
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // 2. Render Participant Name exactly on the name line
        ctx.font = 'bold 50px "Playfair Display", Georgia, "Times New Roman", serif'
        ctx.fillStyle = '#22180e'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        // Position on 2048x1152 coordinate map: X: 50% (1024), Y: 57.0% (656)
        ctx.fillText(displayName, 1024, 656)

        // 3. Render Date at bottom-left date slot
        ctx.font = 'bold 24px "Playfair Display", Georgia, "Times New Roman", serif'
        ctx.fillStyle = '#3a2d1d'
        ctx.textAlign = 'center'
        // Position: X: 24.2% (~496), Y: 90.2% (~1039)
        ctx.fillText(dateString, 496, 1039)

        // 4. Download file
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
        const link = document.createElement('a')
        const safeName = displayName.replace(/\s+/g, '_').substring(0, 30)
        link.download = `Sertifikat-${safeName || 'Dala-Murasy'}.jpg`
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (err) {
        console.error('Certificate generation error:', err)
      } finally {
        setIsGenerating(false)
      }
    }

    img.onerror = () => {
      setIsGenerating(false)
      alert('Certificate template failed to load')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <section className="quiz-cert-section" aria-labelledby="quiz-cert-title" data-reveal>
      <div className="quiz-cert-header">
        <div className="quiz-cert-congrats-badge">
          <Sparkles size={14} />
          <span>{copy.congrats}</span>
        </div>
        <h2 id="quiz-cert-title" className="quiz-cert-title">
          {copy.title}
        </h2>
        <p className="quiz-cert-desc">{copy.desc}</p>
      </div>

      {/* Toolbar: Name input & Language Switcher */}
      <div className="quiz-cert-toolbar">
        <div className="quiz-cert-name-input-wrap">
          <label htmlFor="participant-name-input">{copy.nameLabel}</label>
          <input
            id="participant-name-input"
            type="text"
            className="quiz-cert-name-input"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder={copy.placeholder}
            maxLength={45}
          />
        </div>

        <div className="quiz-cert-lang-selector" role="group" aria-label={copy.langLabel}>
          <button
            type="button"
            className={`quiz-cert-lang-chip ${certLang === 'kz' ? 'is-active' : ''}`}
            onClick={() => setCertLang('kz')}
          >
            ҚАЗАҚША
          </button>
          <button
            type="button"
            className={`quiz-cert-lang-chip ${certLang === 'ru' ? 'is-active' : ''}`}
            onClick={() => setCertLang('ru')}
          >
            РУССКИЙ
          </button>
          <button
            type="button"
            className={`quiz-cert-lang-chip ${certLang === 'en' ? 'is-active' : ''}`}
            onClick={() => setCertLang('en')}
          >
            ENGLISH
          </button>
        </div>
      </div>

      {/* Interactive Certificate Preview Frame with Live Overlays */}
      <div className="quiz-cert-frame-wrap">
        <img
          ref={imageRef}
          src={certImageSrc}
          alt={`Certificate ${certLang.toUpperCase()}`}
          className="quiz-cert-image"
          loading="eager"
        />

        {/* Live Overlaid Participant Name */}
        <div className="quiz-cert-name-overlay">{displayName}</div>

        {/* Live Overlaid Date */}
        <div className="quiz-cert-date-overlay">{dateString}</div>
      </div>

      {/* Action Buttons */}
      <div className="quiz-cert-actions">
        <button
          type="button"
          className="quiz-cert-btn quiz-cert-btn-primary"
          onClick={handleDownload}
          disabled={isGenerating}
        >
          <Download size={18} />
          <span>{isGenerating ? copy.downloading : copy.downloadBtn}</span>
        </button>

        <button
          type="button"
          className="quiz-cert-btn quiz-cert-btn-secondary"
          onClick={handlePrint}
        >
          <Printer size={18} />
          <span>{copy.printBtn}</span>
        </button>
      </div>
    </section>
  )
}

export default QuizCertificate

import { useState } from 'react'
import { Compass, ExternalLink, Maximize2, Sparkles } from 'lucide-react'
import { useLocale } from '../locales/context.js'

export function VirtualTourSection() {
  const { lang } = useLocale()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const copy = {
    kz: {
      eyebrow: '360° ПАНОРАМА · ВИРТУАЛДЫ ТУР',
      title: 'Қызғалдақты даланың 3D панорамасы',
      lead: 'Шынайы табиғат аясындағы жабайы қызғалдақтар алқабын 360° бұрышпен тамашалаңыз. Тінтуірмен немесе саусақпен айналдырып, көктемгі өлкенің әр бұрышын табиғи қалпында көре аласыз.',
      hint: 'Панораманы жан-жаққа айналдыру үшін экранды жылжытыңыз',
      openFull: 'Жеке терезеде ашу',
      provider: 'True Virtual Tours платформасында жасалған',
      badge: '360° Интерактивті тур',
      sourceNote: 'Дала панорамасы',
    },
    ru: {
      eyebrow: '360° ПАНОРАМА · ВИРТУАЛЬНЫЙ ТУР',
      title: '3D-панорама цветущего тюльпанового поля',
      lead: 'Погрузитесь в круговую панораму весеннего поля дикорастущих тюльпанов. Вращайте обзор во всех направлениях с помощью мыши или сенсорного экрана, чтобы исследовать естественный ландшафт.',
      hint: 'Двигайте курсор или проведите пальцем по экрану для обзора 360°',
      openFull: 'Открыть в отдельной вкладке',
      provider: 'Создано на платформе True Virtual Tours',
      badge: '360° Интерактивный тур',
      sourceNote: 'Панорама поля',
    },
    en: {
      eyebrow: '360° PANORAMA · VIRTUAL TOUR',
      title: '3D Panorama of the Blooming Tulip Field',
      lead: 'Immerse yourself in a 360° circular panorama of a wild blooming tulip field. Drag with your mouse or swipe on touch screens to explore the pristine spring steppe from every angle.',
      hint: 'Drag your mouse or swipe the screen to look around 360°',
      openFull: 'Open full view in new tab',
      provider: 'Created with True Virtual Tours',
      badge: '360° Interactive Tour',
      sourceNote: 'Field panorama',
    },
  }[lang]

  return (
    <section className="virtual-tour-section page-wrap" data-reveal aria-labelledby="virtual-tour-title">
      <div className="virtual-tour-header">
        <div>
          <span className="eyebrow">
            <Compass size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} />
            {copy.eyebrow}
          </span>
          <h2 id="virtual-tour-title">{copy.title}</h2>
          <p className="virtual-tour-lead">{copy.lead}</p>
        </div>
        <div className="virtual-tour-actions">
          <span className="virtual-tour-badge">
            <Sparkles size={13} />
            {copy.badge}
          </span>
          <a
            href="https://truevirtualtours.com/ru/panorama/230864/360view"
            target="_blank"
            rel="noreferrer"
            className="button button-outline button-sm virtual-tour-ext-btn"
          >
            <span>{copy.openFull}</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      <div className={`virtual-tour-card ${isFullscreen ? 'is-fullscreen' : ''}`}>
        <div className="virtual-tour-frame-wrap">
          <iframe
            src="https://truevirtualtours.com/ru/panorama/230864/360view"
            title={copy.title}
            className="virtual-tour-iframe"
            allow="fullscreen; accelerometer; gyroscope; magnetometer"
            allowFullScreen={true}
            loading="lazy"
          />
        </div>

        <div className="virtual-tour-footer">
          <div className="virtual-tour-hint">
            <Compass size={14} />
            <span>{copy.hint}</span>
          </div>

          <div className="virtual-tour-credits">
            <a
              href="https://truevirtualtours.com/ru/panorama/p-videoplayback-vkx5rh3o"
              target="_blank"
              rel="noreferrer"
              className="virtual-tour-credit-link"
            >
              videoplayback vKx5Rh3O
            </a>
            <span className="sep">·</span>
            <a
              href="https://truevirtualtours.com"
              target="_blank"
              rel="noreferrer"
              className="virtual-tour-credit-link"
            >
              {copy.provider}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

import React from 'react'
import './OurJourney.css'
import { useLocale } from '../locales/context.js'
import { journeyData, journeyHeading } from '../data/journeyTimeline.js'

function JourneyItem({ item, index, lang, copy }) {
  const labelText = typeof item.label === 'object' ? item.label[lang] : item.label
  const paragraphText = typeof item.text === 'object' ? item.text[lang] : item.text

  return (
    <article
      className={`journey-item journey-item-${item.imagePosition}`}
      data-reveal
    >
      <div className="journey-image-wrapper">
        {item.image ? (
          <img
            src={item.image}
            alt={`${labelText} ${item.year}`}
            className="journey-image"
            loading="lazy"
          />
        ) : (
          <div className="journey-image-placeholder" aria-label={copy.addPhoto}>
            <div className="journey-placeholder-inner">
              <svg
                className="journey-placeholder-icon"
                viewBox="0 0 24 24"
                width="32"
                height="32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="journey-placeholder-label">
                + {copy.addPhoto}
              </span>
              <small className="journey-placeholder-year">{item.year}</small>
            </div>
          </div>
        )}

        <button
          className="journey-arrow journey-arrow-left"
          aria-label={copy.prevImage}
          type="button"
        >
          ←
        </button>

        <button
          className="journey-arrow journey-arrow-right"
          aria-label={copy.nextImage}
          type="button"
        >
          →
        </button>
      </div>

      <div className="journey-content">
        <span className="journey-label">{labelText}</span>

        <h2 className="journey-year">{item.year}</h2>

        <p className="journey-text">{paragraphText}</p>
      </div>
    </article>
  )
}

export function OurJourney() {
  const { lang } = useLocale()
  const copy = journeyHeading[lang] || journeyHeading.kz

  return (
    <section className="journey-section">
      <div className="journey-card">
        <div className="journey-timeline">
          <div className="journey-heading">
            <h1>
              {copy.title1}
              <br />
              {copy.title2}
            </h1>
            <p className="journey-lead">{copy.lead}</p>
          </div>

          <div className="journey-items">
            {journeyData.map((item, index) => (
              <JourneyItem
                key={`${item.year}-${index}`}
                item={item}
                index={index}
                lang={lang}
                copy={copy}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default OurJourney

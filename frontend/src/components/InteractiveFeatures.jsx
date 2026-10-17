import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Sprout,
  XCircle,
} from 'lucide-react'
import { useLocale } from '../locales/context.js'
import { sourceAuthor, sourceRecords, sourceTitle } from '../data/collections.js'
import {
  bloomWheelCopy,
  bloomWheelMonths,
  quizCopy,
  quizLevels,
  quizQuestions,
  usefulLinkGroups,
  usefulLinksCopy,
} from '../data/interactiveFeatures.js'

function formatItalicText(text) {
  if (!text) return null
  const parts = String(text).split(/(\*[^*]+\*)/g)
  return parts.map((part, idx) =>
    part.startsWith('*') && part.endsWith('*') ? (
      <em key={idx}>{part.slice(1, -1)}</em>
    ) : (
      part
    ),
  )
}

function SourceLinksRow({ ids }) {
  const { lang, t } = useLocale()
  const list = (Array.isArray(ids) ? ids : [ids])
    .map(id => sourceRecords.find(item => item.id === id))
    .filter(Boolean)
  if (!list.length) return null
  return (
    <div className="interactive-source-links">
      {list.map(record => (
        <a
          key={record.id}
          className="citation-link"
          href={record.url}
          target="_blank"
          rel="noreferrer"
        >
          <span>
            {t.common.citation}: {sourceAuthor(record, lang).split(' · ')[0]} ({record.year})
          </span>
          <ArrowUpRight size={13} />
        </a>
      ))}
    </div>
  )
}

export function BloomWheelSection() {
  const { lang } = useLocale()
  const copy = bloomWheelCopy[lang]
  const [selectedMonth, setSelectedMonth] = useState(4) // Default to April (Peak Mass Bloom)
  const [autoPlay, setAutoPlay] = useState(false)

  useEffect(() => {
    if (!autoPlay) return undefined
    const timer = window.setInterval(() => {
      setSelectedMonth(prev => (prev % 12) + 1)
    }, 3200)
    return () => window.clearInterval(timer)
  }, [autoPlay])

  const activeItem =
    bloomWheelMonths.find(item => item.month === selectedMonth) || bloomWheelMonths[3]
  const handAngle = (selectedMonth - 1) * 30 - 90

  const seasonFirstMonth = {
    winter: 1,
    spring: 4,
    summer: 6,
    autumn: 10,
  }

  return (
    <section
      className="bloom-wheel-section page-wrap"
      id="bloom-wheel"
      aria-labelledby="bloom-wheel-title"
      data-reveal
    >
      <div className="bloom-wheel-header">
        <div>
          <span className="eyebrow">
            <Clock size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} />
            {copy.eyebrow}
          </span>
          <h2 id="bloom-wheel-title">{copy.title}</h2>
          <p className="bloom-wheel-lead">{copy.lead}</p>
        </div>
        <div className="bloom-season-pills" role="group" aria-label={copy.phaseLabel}>
          {Object.entries(copy.seasons).map(([seasonKey, label]) => (
            <button
              key={seasonKey}
              type="button"
              className={`bloom-season-pill ${activeItem.season === seasonKey ? 'active' : ''}`}
              onClick={() => {
                setAutoPlay(false)
                setSelectedMonth(seasonFirstMonth[seasonKey])
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bloom-wheel-grid">
        {/* Left: Interactive Circular Clock / Wheel + Slider */}
        <div className="bloom-dial-panel">
          <div className="bloom-dial-wrap">
            <svg
              className="bloom-dial-svg"
              viewBox="0 0 360 360"
              role="img"
              aria-label={copy.title}
            >
              <defs>
                <radialGradient id="bloomWheelGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={activeItem.accent} stopOpacity="0.24" />
                  <stop offset="100%" stopColor={activeItem.accent} stopOpacity="0.02" />
                </radialGradient>
              </defs>

              <circle cx="180" cy="180" r="164" fill="url(#bloomWheelGlow)" />
              <circle
                cx="180"
                cy="180"
                r="156"
                fill="none"
                stroke="rgba(139, 92, 62, 0.22)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <circle
                cx="180"
                cy="180"
                r="116"
                fill="none"
                stroke="rgba(139, 92, 62, 0.18)"
                strokeWidth="1.2"
              />

              {/* Clock Hand */}
              <g
                transform={`rotate(${handAngle} 180 180)`}
                style={{ transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)' }}
              >
                <line
                  x1="180"
                  y1="180"
                  x2="294"
                  y2="180"
                  stroke={activeItem.accent}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="294" cy="180" r="5" fill={activeItem.accent} />
              </g>

              {/* 12 Month Nodes around the Clock */}
              {bloomWheelMonths.map(item => {
                const angleDeg = (item.month - 1) * 30 - 90
                const angleRad = (angleDeg * Math.PI) / 180
                const radius = 136
                const cx = 180 + radius * Math.cos(angleRad)
                const cy = 180 + radius * Math.sin(angleRad)
                const isSelected = item.month === selectedMonth
                return (
                  <g
                    key={item.month}
                    className={`bloom-dial-node ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => {
                      setAutoPlay(false)
                      setSelectedMonth(item.month)
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 24 : 19}
                      fill={isSelected ? item.accent : '#fbf7f1'}
                      stroke={item.accent}
                      strokeWidth={isSelected ? '3' : '1.6'}
                    />
                    <text
                      x={cx}
                      y={cy - 3}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="700"
                      fill={isSelected ? '#ffffff' : '#6c5344'}
                    >
                      {item.code}
                    </text>
                    <text
                      x={cx}
                      y={cy + 9}
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="600"
                      fill={isSelected ? '#ffffff' : '#2a201b'}
                    >
                      {item.short[lang]}
                    </text>
                  </g>
                )
              })}

              {/* Center Hub */}
              <circle
                cx="180"
                cy="180"
                r="66"
                fill="#fffdf9"
                stroke={activeItem.accent}
                strokeWidth="2.5"
              />
              <text x="180" y="158" textAnchor="middle" fontSize="24">
                {activeItem.icon}
              </text>
              <text
                x="180"
                y="182"
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                letterSpacing="0.12em"
                fill={activeItem.accent}
              >
                {activeItem.code} / 12
              </text>
              <text
                x="180"
                y="201"
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill="#201713"
              >
                {activeItem.name[lang]}
              </text>
            </svg>
          </div>

          {/* Interactive Range Slider + Controls */}
          <div className="bloom-slider-box">
            <div className="bloom-slider-top">
              <label htmlFor="bloom-month-slider">{copy.sliderLabel}</label>
              <span>
                {activeItem.code} · {activeItem.name[lang]}
              </span>
            </div>
            <input
              id="bloom-month-slider"
              className="bloom-range-input"
              type="range"
              min="1"
              max="12"
              step="1"
              value={selectedMonth}
              style={{ '--bloom-accent': activeItem.accent }}
              onChange={e => {
                setAutoPlay(false)
                setSelectedMonth(Number(e.target.value))
              }}
            />
            <div className="bloom-slider-ticks" aria-hidden="true">
              {bloomWheelMonths.map(item => (
                <button
                  key={item.month}
                  type="button"
                  className={item.month === selectedMonth ? 'active' : ''}
                  onClick={() => {
                    setAutoPlay(false)
                    setSelectedMonth(item.month)
                  }}
                >
                  {item.short[lang]}
                </button>
              ))}
            </div>

            <div className="bloom-controls-row">
              <button
                type="button"
                className="bloom-ctrl-btn"
                onClick={() => {
                  setAutoPlay(false)
                  setSelectedMonth(prev => (prev === 1 ? 12 : prev - 1))
                }}
                aria-label={copy.prevMonth}
              >
                <ArrowLeft size={15} />
                <span>{copy.prevMonth}</span>
              </button>

              <button
                type="button"
                className={`bloom-ctrl-btn bloom-autoplay-btn ${autoPlay ? 'is-playing' : ''}`}
                onClick={() => setAutoPlay(prev => !prev)}
              >
                {autoPlay ? <Pause size={15} /> : <Play size={15} />}
                <span>{autoPlay ? copy.autoPlayStop : copy.autoPlayStart}</span>
              </button>

              <button
                type="button"
                className="bloom-ctrl-btn"
                onClick={() => {
                  setAutoPlay(false)
                  setSelectedMonth(prev => (prev % 12) + 1)
                }}
                aria-label={copy.nextMonth}
              >
                <span>{copy.nextMonth}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Phenological Details & Conservation Explanation */}
        <article
          className="bloom-detail-card"
          style={{ '--bloom-accent': activeItem.accent }}
          aria-live="polite"
        >
          <div className="bloom-detail-top">
            <span className="bloom-month-badge">
              {activeItem.icon} {activeItem.code} · {activeItem.name[lang].toUpperCase()} ·{' '}
              {copy.seasons[activeItem.season]}
            </span>
            <span className={`bloom-risk-badge risk-${activeItem.risk}`}>
              {copy.riskBadges[activeItem.risk]}
            </span>
          </div>

          <h3 className="bloom-stage-title">{formatItalicText(activeItem.stage[lang])}</h3>
          <p className="bloom-elevation-meta">
            <Compass size={15} />
            <span>
              <strong>{copy.elevationLabel}:</strong> {activeItem.elevation[lang]}
            </span>
          </p>

          <div className="bloom-states-grid">
            <div className="bloom-state-box">
              <span className="bloom-state-label">
                <Sprout size={15} /> {copy.bulbStateLabel}
              </span>
              <p>{formatItalicText(activeItem.bulbState[lang])}</p>
            </div>
            <div className="bloom-state-box">
              <span className="bloom-state-label">
                <Sparkles size={15} /> {copy.surfaceStateLabel}
              </span>
              <p>{formatItalicText(activeItem.surfaceState[lang])}</p>
            </div>
          </div>

          <div className={`bloom-protect-callout risk-${activeItem.risk}`}>
            <div className="bloom-protect-header">
              <ShieldAlert size={20} />
              <h4>{copy.whyProtectTitle}</h4>
            </div>
            <p>{formatItalicText(activeItem.whyProtect[lang])}</p>
          </div>

          <SourceLinksRow ids={activeItem.sourceIds} />
        </article>
      </div>
    </section>
  )
}

export function QuizTeaserBanner() {
  const { lang } = useLocale()
  const copy = quizCopy[lang]
  return (
    <section className="quiz-teaser-section page-wrap" data-reveal>
      <div className="quiz-teaser-card">
        <div className="quiz-teaser-copy">
          <span className="eyebrow">
            <Award size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} />
            {copy.teaserBadge}
          </span>
          <h2>{copy.title}</h2>
          <p>{copy.lead}</p>
          <div className="quiz-teaser-ranks">
            {quizLevels.map(lvl => (
              <span key={lvl.id} className="quiz-mini-rank">
                {lvl.icon} {lvl.title[lang]}
              </span>
            ))}
          </div>
        </div>
        <div className="quiz-teaser-action">
          <Link className="button button-primary" to="/quiz">
            <span>{copy.teaserCta}</span>
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export function QuizSection() {
  const { lang } = useLocale()
  const copy = quizCopy[lang]
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [finished, setFinished] = useState(false)

  const total = quizQuestions.length
  const currentQ = quizQuestions[currentIdx]
  const selectedOption = answers[currentQ.id]
  const isAnswered = selectedOption !== undefined

  const score = quizQuestions.reduce(
    (sum, q) => (answers[q.id] === q.correctIndex ? sum + 1 : sum),
    0,
  )
  const xp = score * 200

  const unlockedLevel =
    quizLevels.find(lvl => score >= lvl.minScore && score <= lvl.maxScore) || quizLevels[0]

  const handleSelectOption = optIdx => {
    if (isAnswered) return
    setAnswers(prev => ({ ...prev, [currentQ.id]: optIdx }))
  }

  const handleNext = () => {
    if (currentIdx + 1 < total) {
      setCurrentIdx(prev => prev + 1)
    } else {
      setFinished(true)
    }
  }

  const handleRetry = () => {
    setAnswers({})
    setCurrentIdx(0)
    setFinished(false)
  }

  return (
    <section className="quiz-engine-section page-wrap" id="historical-code-quiz" data-reveal>
      {/* Top Status Bar */}
      <div className="quiz-statusbar">
        <div className="quiz-progress-meta">
          <span className="eyebrow">{copy.eyebrow}</span>
          <strong>
            {finished
              ? `${copy.resultScoreTitle}: ${score} / ${total}`
              : `${copy.questionCounter} ${currentIdx + 1} ${copy.ofLabel} ${total}`}
          </strong>
        </div>

        <div className="quiz-score-pills">
          <span className="quiz-score-pill">
            🏆 {copy.scoreLabel}: <b>{score}</b> / {total}
          </span>
          <span className="quiz-score-pill quiz-xp-pill">
            ⚡ {copy.xpLabel}: <b>{xp} XP</b>
          </span>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="quiz-step-track" role="tablist" aria-label={copy.title}>
        {quizQuestions.map((q, idx) => {
          const ans = answers[q.id]
          const statusClass =
            ans === undefined
              ? ''
              : ans === q.correctIndex
                ? 'is-correct'
                : 'is-wrong'
          return (
            <button
              key={q.id}
              type="button"
              className={`quiz-step-dot ${idx === currentIdx && !finished ? 'is-current' : ''} ${statusClass}`}
              onClick={() => {
                setFinished(false)
                setCurrentIdx(idx)
              }}
            >
              <span>0{idx + 1}</span>
              <small>{q.category[lang]}</small>
            </button>
          )
        })}
      </div>

      {!finished ? (
        <article className="quiz-question-card" aria-live="polite">
          <div className="quiz-question-header">
            <span className="quiz-code-tag">{currentQ.code}</span>
            <span className="quiz-category-tag">{currentQ.category[lang]}</span>
          </div>

          <h2 className="quiz-question-title">{formatItalicText(currentQ.question[lang])}</h2>
          <p className="quiz-select-hint">{copy.selectPrompt}</p>

          <div className="quiz-options-list">
            {currentQ.options[lang].map((optionText, optIdx) => {
              const isChosen = selectedOption === optIdx
              const isRightOption = optIdx === currentQ.correctIndex
              let stateClass = ''
              if (isAnswered) {
                if (isRightOption) stateClass = 'option-correct'
                else if (isChosen) stateClass = 'option-wrong'
                else stateClass = 'option-dimmed'
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  disabled={isAnswered}
                  className={`quiz-option-btn ${stateClass}`}
                  onClick={() => handleSelectOption(optIdx)}
                >
                  <span className="quiz-option-letter">
                    {['A', 'B', 'C', 'D'][optIdx]}
                  </span>
                  <span className="quiz-option-text">{formatItalicText(optionText)}</span>
                  {isAnswered && isRightOption && (
                    <CheckCircle2 className="quiz-option-icon correct" size={20} />
                  )}
                  {isAnswered && isChosen && !isRightOption && (
                    <XCircle className="quiz-option-icon wrong" size={20} />
                  )}
                </button>
              )
            })}
          </div>

          {isAnswered && (
            <div
              className={`quiz-feedback-panel ${
                selectedOption === currentQ.correctIndex ? 'feedback-correct' : 'feedback-wrong'
              }`}
            >
              <div className="quiz-feedback-badge">
                {selectedOption === currentQ.correctIndex ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>{copy.correctBadge}</span>
                  </>
                ) : (
                  <>
                    <XCircle size={18} />
                    <span>{copy.wrongBadge}</span>
                  </>
                )}
              </div>
              <h3>{copy.explanationTitle}</h3>
              <p>{formatItalicText(currentQ.explanation[lang])}</p>
              <div className="quiz-feedback-footer">
                <SourceLinksRow ids={currentQ.sourceId} />
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleNext}
                >
                  <span>
                    {currentIdx + 1 < total ? copy.nextQuestionBtn : copy.finishQuizBtn}
                  </span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}
        </article>
      ) : (
        <div className="quiz-results-wrapper" aria-live="polite">
          <article className="quiz-result-hero">
            <div className="quiz-result-badge-col">
              <span className="quiz-rank-icon">{unlockedLevel.icon}</span>
              <span className="quiz-rank-pill">{unlockedLevel.badge}</span>
              <div className="quiz-final-score-circle">
                <strong>
                  {score}/{total}
                </strong>
                <small>{xp} XP</small>
              </div>
            </div>

            <div className="quiz-result-copy-col">
              <span className="eyebrow">{copy.resultEyebrow}</span>
              <h2>{unlockedLevel.title[lang]}</h2>
              <p className="quiz-result-subtitle">{unlockedLevel.subtitle[lang]}</p>
              <p className="quiz-result-desc">{ formatItalicText(unlockedLevel.description[lang]) }</p>

              <div className="quiz-result-actions">
                <button type="button" className="button button-primary" onClick={handleRetry}>
                  <RotateCcw size={16} />
                  <span>{copy.retryBtn}</span>
                </button>
                <Link className="button button-outline" to="/sources">
                  <span>{copy.exploreSourcesBtn}</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </article>

          {/* Gamification Ladder */}
          <div className="quiz-ranks-ladder">
            <h3>{copy.allRanksTitle}</h3>
            <div className="quiz-ranks-grid">
              {quizLevels.map(lvl => {
                const isUnlocked = lvl.id === unlockedLevel.id
                return (
                  <div
                    key={lvl.id}
                    className={`quiz-rank-card ${isUnlocked ? 'is-unlocked' : ''}`}
                  >
                    <div className="quiz-rank-card-top">
                      <span>{lvl.icon}</span>
                      <small>{lvl.badge}</small>
                    </div>
                    <h4>{lvl.title[lang]}</h4>
                    <p>{formatItalicText(lvl.description[lang])}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Full Scientific Review */}
          <div className="quiz-review-section">
            <h3>{copy.reviewTitle}</h3>
            <div className="quiz-review-grid">
              {quizQuestions.map((q, idx) => {
                const userAns = answers[q.id]
                const isCorrect = userAns === q.correctIndex
                return (
                  <article key={q.id} className="quiz-review-card">
                    <div className="quiz-review-meta">
                      <span>
                        0{idx + 1} · {q.category[lang]}
                      </span>
                      <b className={isCorrect ? 'text-correct' : 'text-wrong'}>
                        {isCorrect ? '✓' : '✗'}
                      </b>
                    </div>
                    <h4>{formatItalicText(q.question[lang])}</h4>
                    <p className="quiz-review-correct-ans">
                      <strong>✓ </strong>
                      {formatItalicText(q.options[lang][q.correctIndex])}
                    </p>
                    <p className="quiz-review-explanation">
                      {formatItalicText(q.explanation[lang])}
                    </p>
                    <SourceLinksRow ids={q.sourceId} />
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export function UsefulLinksDirectory() {
  const { lang } = useLocale()
  const copy = usefulLinksCopy[lang]

  return (
    <section
      className="useful-links-directory page-wrap"
      id="official-useful-links"
      aria-labelledby="useful-links-title"
      data-reveal
    >
      <div className="useful-links-header">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h2 id="useful-links-title">{copy.title}</h2>
          <p>{copy.lead}</p>
        </div>
        <div className="useful-links-counter">
          <span>{copy.totalSourcesLabel}</span>
          <strong>{sourceRecords.length}</strong>
        </div>
      </div>

      <div className="useful-groups-stack">
        {usefulLinkGroups.map(group => {
          const groupRecords = group.sourceIds
            .map(id => sourceRecords.find(item => item.id === id))
            .filter(Boolean)
          return (
            <div key={group.id} className="useful-group-block">
              <div className="useful-group-heading">
                <span className="eyebrow">{group.badge}</span>
                <h3>{group.title[lang]}</h3>
                <p>{formatItalicText(group.description[lang])}</p>
              </div>

              <div className="useful-links-grid">
                {groupRecords.map(record => (
                  <article key={record.id} className="useful-link-card">
                    <div className="useful-link-top">
                      <span className="useful-link-year">{record.year}</span>
                      <span className="useful-verified-pill">✓ {copy.verifiedBadge}</span>
                    </div>
                    <h4>{sourceTitle(record, lang)}</h4>
                    <p className="useful-link-author">{sourceAuthor(record, lang)}</p>
                    <p className="useful-link-summary">{record.note[lang]}</p>
                    <div className="useful-link-footer">
                      <a
                        className="useful-link-btn"
                        href={record.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>{copy.openOfficialLink}</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

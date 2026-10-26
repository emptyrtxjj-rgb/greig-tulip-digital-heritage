import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import './OrbitMap.css'
import { useLocale } from '../locales/context.js'

// Silk Road milestone stations around South Kazakhstan
const locations = [
  {
    id: 'south-kz',
    name: {
      kz: 'ОҢТҮСТІК ҚАЗАҚСТАН',
      ru: 'ЮЖНЫЙ КАЗАХСТАН',
      en: 'SOUTH KAZAKHSTAN',
    },
    tag: {
      kz: 'Ұлы Жібек жолы торабы',
      ru: 'Узел Шёлкового пути',
      en: 'Silk Road Hub',
    },
    desc: {
      kz: 'Шығыс пен Батысты тоғыстырған керуен жолдарының алтын өзегі. Ежелгі қалалар мен өркениеттер ошағы.',
      ru: 'Золотое русло караванных путей между Востоком и Западом. Очаг древних городов и оазисов.',
      en: 'The golden artery of caravan routes bridging East and West. Cradle of ancient cities and oasis civilizations.',
    },
    // Positioned on the globe surface (radius ~ 1.66)
    position: [-1.22, 0.65, 0.92],
  },
  {
    id: 'karatau',
    name: {
      kz: 'ҚАРАТАУ',
      ru: 'КАРАТАУ',
      en: 'KARATAU',
    },
    tag: {
      kz: 'Петроглифтер мен тарих',
      ru: 'Петроглифы и история',
      en: 'Petroglyphs & History',
    },
    desc: {
      kz: 'Қаратау жоталары — ежелгі жартас суреттері, сақ-үйсін дәуірі мен керуен асуларының тас шежіресі.',
      ru: 'Хребет Каратау — древние петроглифы, стоянки эпохи саков и перевалы караванщиков.',
      en: 'Karatau mountains — ancient rock petroglyphs, Saka-era sanctuaries and mountain caravan passes.',
    },
    position: [-0.62, 0.28, 1.48],
  },
  {
    id: 'tyulkubas',
    name: {
      kz: 'ТҮЛКІБАС',
      ru: 'ТЮЛЬКУБАС',
      en: 'TYULKUBAS',
    },
    tag: {
      kz: 'Қызғалдақтар мен бау-бақша мекені',
      ru: 'Край диких тюльпанов и садов',
      en: 'Tulip & Orchard Sanctuary',
    },
    desc: {
      kz: 'Шубайқызыл қыраты, Грейг қызғалдағының табиғи мекені. Керуендер дем алған табиғаты көркем шұрат.',
      ru: 'Урочище Шубайкызыл, колыбель тюльпана Грейга. Живописный оазис отдыха для великих караванов.',
      en: 'Shubaykyzyl hill, natural sanctuary of Greig’s tulips. A scenic mountain oasis for caravan travelers.',
    },
    position: [0.38, -0.32, 1.54],
  },
  {
    id: 'turkistan',
    name: {
      kz: 'ТҮРКІСТАН',
      ru: 'ТУРКЕСТАН',
      en: 'TURKISTAN',
    },
    tag: {
      kz: 'Рухани астана мен сауда шаһары',
      ru: 'Духовная столица и торговый град',
      en: 'Spiritual Capital & Citadel',
    },
    desc: {
      kz: 'Қожа Ахмет Ясауи кесенесі, Түркі әлемінің рухани орталығы. Орта ғасырлық ірі сауда және мәдениет ошағы.',
      ru: 'Мавзолей Ходжи Ахмеда Ясави, духовная столица тюркского мира и крупнейший торговый центр средневековья.',
      en: 'Mausoleum of Khoja Ahmed Yasawi, spiritual heart of the Turkic world and major medieval commerce hub.',
    },
    position: [1.25, -0.58, 0.88],
  },
]

// =============================================================
// Procedural Parchment / Silk Road Globe Texture Generator
// =============================================================
function createSilkRoadTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  // 1. Aged Parchment Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  bgGrad.addColorStop(0, '#e5d9c2')
  bgGrad.addColorStop(0.3, '#ded1b7')
  bgGrad.addColorStop(0.7, '#ebdcc4')
  bgGrad.addColorStop(1, '#d8caa8')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 2. Subtle parchment grain / texture stippling
  ctx.fillStyle = 'rgba(120, 95, 60, 0.04)'
  for (let i = 0; i < 4000; i++) {
    const gx = Math.random() * canvas.width
    const gy = Math.random() * canvas.height
    ctx.fillRect(gx, gy, 1.5, 1.5)
  }

  // 3. Coordinate Grids (Equator, Parallels, Meridians)
  ctx.strokeStyle = 'rgba(173, 145, 102, 0.45)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])

  // Parallels (latitude)
  for (let lat = 60; lat < canvas.height; lat += 60) {
    ctx.beginPath()
    ctx.moveTo(0, lat)
    ctx.lineTo(canvas.width, lat)
    ctx.stroke()
  }

  // Meridians (longitude)
  for (let lon = 0; lon < canvas.width; lon += 85) {
    ctx.beginPath()
    ctx.moveTo(lon, 0)
    ctx.lineTo(lon, canvas.height)
    ctx.stroke()
  }

  // Equator line solid
  ctx.setLineDash([])
  ctx.strokeStyle = 'rgba(189, 114, 91, 0.55)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, canvas.height / 2)
  ctx.lineTo(canvas.width, canvas.height / 2)
  ctx.stroke()

  // 4. Stylized Eurasia / Central Asia Continental Silhouettes
  ctx.fillStyle = 'rgba(195, 178, 146, 0.55)'
  ctx.beginPath()
  // Eurasia contour
  ctx.moveTo(250, 100)
  ctx.bezierCurveTo(340, 80, 480, 110, 600, 130)
  ctx.bezierCurveTo(720, 150, 850, 200, 800, 290)
  ctx.bezierCurveTo(700, 310, 560, 340, 450, 300)
  ctx.bezierCurveTo(380, 280, 300, 300, 250, 250)
  ctx.bezierCurveTo(200, 200, 210, 140, 250, 100)
  ctx.fill()

  // Africa / Arabia contour
  ctx.beginPath()
  ctx.moveTo(280, 250)
  ctx.bezierCurveTo(350, 270, 380, 360, 340, 420)
  ctx.bezierCurveTo(300, 470, 240, 430, 240, 350)
  ctx.bezierCurveTo(240, 290, 250, 260, 280, 250)
  ctx.fill()

  // 5. Great Silk Road caravan trunk paths across Central Asia
  ctx.strokeStyle = '#bd725b'
  ctx.lineWidth = 3
  ctx.setLineDash([8, 6])
  ctx.beginPath()
  ctx.moveTo(760, 250) // Chang'an / Xi'an
  ctx.bezierCurveTo(660, 230, 580, 210, 510, 220) // Dunhuang / Tarim
  ctx.bezierCurveTo(460, 225, 420, 220, 390, 210) // Central Asia / South KZ
  ctx.bezierCurveTo(340, 200, 290, 215, 220, 210) // Samarkand / Merv / Baghdad
  ctx.stroke()

  // Secondary northern route (Steppe / Karatau / Turkistan)
  ctx.strokeStyle = '#c49348'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.moveTo(560, 180)
  ctx.bezierCurveTo(490, 170, 420, 175, 360, 185)
  ctx.bezierCurveTo(310, 195, 270, 190, 230, 180)
  ctx.stroke()

  // 6. Vintage Cartography Label
  ctx.setLineDash([])
  ctx.fillStyle = 'rgba(100, 80, 50, 0.35)'
  ctx.font = 'bold 22px serif'
  ctx.textAlign = 'center'
  ctx.fillText('VIA SERICA · GREAT SILK ROAD', 512, 175)

  ctx.font = 'italic 13px serif'
  ctx.fillText('SOUTH KAZAKHSTAN · 43° 18′ N / 68° 16′ E', 512, 198)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

export function OrbitMap() {
  const containerRef = useRef(null)
  const { lang } = useLocale()
  const labelElementsRef = useRef([])
  const controlsRef = useRef(null)
  const cameraRef = useRef(null)
  const [activeLocation, setActiveLocation] = useState(null)
  const [isAutoSpinning, setIsAutoSpinning] = useState(true)

  // Update label texts when language switches without rebuilding the 3D scene
  useEffect(() => {
    labelElementsRef.current.forEach((el, index) => {
      if (el && locations[index]) {
        el.textContent = locations[index].name[lang] || locations[index].name.kz
      }
    })
  }, [lang])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear any previous child nodes
    container.innerHTML = ''
    labelElementsRef.current = []

    // =========================
    // SCENE & CAMERAS
    // =========================
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#e8dfcf')

    const width = container.clientWidth || 500
    const height = container.clientHeight || 450

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(0, 0.4, 7.8)
    cameraRef.current = camera

    // =========================
    // WEBGL RENDERER
    // =========================
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    // =========================
    // CSS LABEL RENDERER
    // =========================
    const labelRenderer = new CSS2DRenderer()
    labelRenderer.setSize(width, height)
    labelRenderer.domElement.className = 'orbit-label-renderer'
    container.appendChild(labelRenderer.domElement)

    // =========================
    // ORBIT CONTROLS (Touch & Drag)
    // =========================
    // Attach controls to labelRenderer.domElement so gestures are smoothly captured
    const controls = new OrbitControls(camera, labelRenderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.065
    controls.rotateSpeed = 0.85
    controls.enableZoom = true
    controls.zoomSpeed = 0.85
    controls.minDistance = 3.6
    controls.maxDistance = 14
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.75
    controls.enablePan = false // Keep sphere comfortably centered
    controlsRef.current = controls

    // Pause auto-rotate briefly on manual touch/mouse interaction
    controls.addEventListener('start', () => {
      container.classList.add('is-dragging')
    })
    controls.addEventListener('end', () => {
      container.classList.remove('is-dragging')
    })

    // =========================
    // LIGHTING
    // =========================
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.7)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xfffdf7, 2.2)
    mainLight.position.set(5, 6, 6)
    scene.add(mainLight)

    const warmFillLight = new THREE.PointLight(0xf2cf95, 1.8, 20)
    warmFillLight.position.set(-4, -2, 4)
    scene.add(warmFillLight)

    // =========================
    // CENTRAL SILK ROAD GLOBE (Touchable sphere!)
    // =========================
    const globeGroup = new THREE.Group()
    scene.add(globeGroup)

    const globeTexture = createSilkRoadTexture()
    const globeGeometry = new THREE.SphereGeometry(1.65, 64, 48)
    const globeMaterial = new THREE.MeshStandardMaterial({
      map: globeTexture,
      roughness: 0.8,
      metalness: 0.08,
      bumpScale: 0.02,
    })
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial)
    globeGroup.add(globeMesh)

    // Thin coordinate wireframe halo around the globe
    const wireframeGeo = new THREE.SphereGeometry(1.68, 36, 18)
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: '#ad9872',
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    })
    const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat)
    globeGroup.add(wireframeMesh)

    // Golden Equator Ring
    const equatorGeo = new THREE.RingGeometry(1.72, 1.745, 64)
    const equatorMat = new THREE.MeshBasicMaterial({
      color: '#c49348',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
    })
    const equatorMesh = new THREE.Mesh(equatorGeo, equatorMat)
    equatorMesh.rotation.x = Math.PI / 2
    globeGroup.add(equatorMesh)

    // Outer subtle atmospheric glow
    const haloGeo = new THREE.SphereGeometry(1.76, 32, 32)
    const haloMat = new THREE.MeshBasicMaterial({
      color: '#e0caa0',
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    })
    const haloMesh = new THREE.Mesh(haloGeo, haloMat)
    globeGroup.add(haloMesh)

    // =========================
    // ORBITS (From reference code)
    // =========================
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: '#ad9872',
      transparent: true,
      opacity: 0.8,
    })

    function createOrbit(radiusX, radiusY, rotationX, rotationY, rotationZ) {
      const points = []
      const segments = 180
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        points.push(new THREE.Vector3(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, 0))
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const orbit = new THREE.Line(geometry, orbitMaterial.clone())
      orbit.rotation.set(rotationX, rotationY, rotationZ)
      return orbit
    }

    const orbit1 = createOrbit(3.2, 1.85, 0.15, 0.4, -0.25)
    const orbit2 = createOrbit(2.85, 2.1, 0.6, -0.3, 0.4)
    const orbit3 = createOrbit(3.5, 1.6, -0.45, 0.2, -0.5)
    globeGroup.add(orbit1, orbit2, orbit3)

    // =========================
    // DASHED SILK ROUTE CONNECTOR
    // =========================
    const connectorPoints = locations.map((loc) => new THREE.Vector3(...loc.position))
    const connectorGeometry = new THREE.BufferGeometry().setFromPoints(connectorPoints)
    const connectorMaterial = new THREE.LineDashedMaterial({
      color: '#aa392e',
      dashSize: 0.08,
      gapSize: 0.06,
      linewidth: 2,
    })
    const connector = new THREE.Line(connectorGeometry, connectorMaterial)
    connector.computeLineDistances()
    globeGroup.add(connector)

    // =========================
    // LOCATION PINS & CSS2D LABELS
    // =========================
    const pinMeshes = []

    locations.forEach((location, index) => {
      const position = new THREE.Vector3(...location.position)

      // 3D Pin Point (pulsing sphere + gold ring)
      const pinGroup = new THREE.Group()
      pinGroup.position.copy(position)

      const pinGeometry = new THREE.SphereGeometry(0.065, 24, 24)
      const pinMaterial = new THREE.MeshStandardMaterial({
        color: '#aa392e',
        emissive: '#591610',
        roughness: 0.3,
        metalness: 0.6,
      })
      const pinMesh = new THREE.Mesh(pinGeometry, pinMaterial)
      pinGroup.add(pinMesh)

      const ringGeometry = new THREE.RingGeometry(0.09, 0.12, 24)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: '#c49348',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      })
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial)
      ringMesh.lookAt(position.clone().multiplyScalar(2))
      pinGroup.add(ringMesh)

      globeGroup.add(pinGroup)
      pinMeshes.push({ pinGroup, pinMesh, location })

      // CSS 2D Label
      const labelElement = document.createElement('div')
      labelElement.className = 'orbit-label'
      labelElement.textContent = location.name[lang] || location.name.kz
      labelElementsRef.current[index] = labelElement

      const label = new CSS2DObject(labelElement)
      label.position.set(0, 0.2, 0)
      pinGroup.add(label)

      // Hover interaction
      labelElement.addEventListener('mouseenter', () => {
        gsap.to(pinGroup.scale, {
          x: 1.6,
          y: 1.6,
          z: 1.6,
          duration: 0.25,
          ease: 'power2.out',
        })
        labelElement.classList.add('is-active')
      })

      labelElement.addEventListener('mouseleave', () => {
        gsap.to(pinGroup.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.25,
          ease: 'power2.out',
        })
        labelElement.classList.remove('is-active')
      })

      // Click to focus and open detail popover
      labelElement.addEventListener('click', (e) => {
        e.stopPropagation()
        setActiveLocation(location)

        // Smoothly rotate controls target towards selected pin
        gsap.to(controls.target, {
          x: position.x * 0.4,
          y: position.y * 0.4,
          z: position.z * 0.4,
          duration: 0.8,
          ease: 'power2.out',
        })
      })
    })

    // Initial entrance scale
    globeGroup.scale.set(0.65, 0.65, 0.65)
    gsap.to(globeGroup.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.2,
      ease: 'power3.out',
    })

    // Gentle vertical bobbing
    const bobTween = gsap.to(globeGroup.position, {
      y: 0.1,
      duration: 3.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    // =========================
    // RENDER LOOP
    // =========================
    let animationFrame

    function animate() {
      animationFrame = requestAnimationFrame(animate)

      // Update controls for damping and auto-rotation
      controls.update()

      renderer.render(scene, camera)
      labelRenderer.render(scene, camera)
    }

    animate()

    // =========================
    // RESPONSIVE RESIZE
    // =========================
    function onResize() {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      if (w === 0 || h === 0) return

      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      labelRenderer.setSize(w, h)
    }

    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(container)

    // =========================
    // CLEANUP
    // =========================
    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      bobTween.kill()
      controls.dispose()

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose())
          } else {
            obj.material.dispose()
          }
        }
      })

      if (globeTexture) globeTexture.dispose()
      renderer.dispose()

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
      if (labelRenderer.domElement.parentNode) {
        labelRenderer.domElement.parentNode.removeChild(labelRenderer.domElement)
      }
    }
  }, [])

  // =========================
  // Control Bar Actions
  // =========================
  function handleReset() {
    if (!cameraRef.current || !controlsRef.current) return
    const controls = controlsRef.current
    const camera = cameraRef.current

    gsap.to(camera.position, {
      x: 0,
      y: 0.4,
      z: 7.8,
      duration: 0.9,
      ease: 'power3.out',
    })
    gsap.to(controls.target, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.9,
      ease: 'power3.out',
      onUpdate: () => controls.update(),
    })
  }

  function handleZoomIn() {
    if (!controlsRef.current) return
    controlsRef.current.dollyIn(1.22)
    controlsRef.current.update()
  }

  function handleZoomOut() {
    if (!controlsRef.current) return
    controlsRef.current.dollyOut(1.22)
    controlsRef.current.update()
  }

  function handleToggleSpin() {
    if (!controlsRef.current) return
    const next = !isAutoSpinning
    setIsAutoSpinning(next)
    controlsRef.current.autoRotate = next
  }

  // =========================
  // Trilingual Text
  // =========================
  const topBadgeText = {
    kz: 'ЖІБЕК ЖОЛЫ КӨРІНІСІ · THREE.JS + GSAP',
    ru: 'МАРШРУТ ШЁЛКОВОГО ПУТИ · THREE.JS + GSAP',
    en: 'SILK ROAD ROUTE · THREE.JS + GSAP',
  }[lang]

  const touchBadgeText = {
    kz: 'Сфераны бұраңыз · 360°',
    ru: 'Вращайте сферу · 360°',
    en: 'Touch & Spin · 360°',
  }[lang]

  const hintText = {
    kz: 'Саусақпен немесе тінтуірмен бұраңыз, жақындатыңыз',
    ru: 'Вращайте и приближайте касанием или мышью',
    en: 'Drag to spin, pinch or scroll to zoom in',
  }[lang]

  const resetBtnLabel = {
    kz: 'Бастапқы күй',
    ru: 'Сброс вида',
    en: 'Reset view',
  }[lang]

  const spinBtnLabel = {
    kz: isAutoSpinning ? 'Айналуды кідірту' : 'Айналдыру',
    ru: isAutoSpinning ? 'Остановить вращение' : 'Запустить вращение',
    en: isAutoSpinning ? 'Pause spin' : 'Resume spin',
  }[lang]

  return (
    <div className="orbit-map-wrapper">
      {/* Top Left Title Badge */}
      <div className="orbit-badge-top">
        <span className="orbit-badge-dot" />
        <span>{topBadgeText}</span>
      </div>

      {/* Top Right Touch Indicator Badge */}
      <div className="orbit-touch-indicator" title={hintText}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
        </svg>
        <span>{touchBadgeText}</span>
      </div>

      {/* 3D Canvas + CSS2D Labels */}
      <div ref={containerRef} className="orbit-map-canvas" />

      {/* Popover Detail Card when location is clicked */}
      {activeLocation && (
        <div className="orbit-info-card">
          <div className="orbit-info-head">
            <h3 className="orbit-info-title">
              {activeLocation.name[lang] || activeLocation.name.kz}
            </h3>
            <button
              type="button"
              className="orbit-info-close"
              onClick={() => setActiveLocation(null)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <span className="orbit-info-tag">
            {activeLocation.tag[lang] || activeLocation.tag.kz}
          </span>
          <p className="orbit-info-desc">
            {activeLocation.desc[lang] || activeLocation.desc.kz}
          </p>
        </div>
      )}

      {/* Bottom Coordinates & Hint */}
      <div className="orbit-badge-bottom">
        <span className="orbit-badge-coords">43° 18′ N / 68° 16′ E</span>
        <span className="orbit-badge-hint">{hintText}</span>
      </div>

      {/* Interactive Controls Dock (Reset, Zoom +/-, Spin toggle) */}
      <div className="orbit-controls-dock" role="toolbar" aria-label="3D Globe controls">
        <button
          type="button"
          className="orbit-ctrl-btn"
          onClick={handleReset}
          title={resetBtnLabel}
          aria-label={resetBtnLabel}
        >
          ↺
        </button>
        <button
          type="button"
          className="orbit-ctrl-btn"
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom In"
        >
          +
        </button>
        <button
          type="button"
          className="orbit-ctrl-btn"
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          −
        </button>
        <button
          type="button"
          className={`orbit-ctrl-btn ${isAutoSpinning ? 'is-active' : ''}`}
          onClick={handleToggleSpin}
          title={spinBtnLabel}
          aria-label={spinBtnLabel}
        >
          {isAutoSpinning ? '⏸' : '▶'}
        </button>
      </div>
    </div>
  )
}

export default OrbitMap

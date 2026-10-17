import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Layers,
  Info,
  Compass,
  Trees,
} from 'lucide-react'
import { useLocale } from '../locales/context.js'
import { bloomWheelCopy, bloomWheelMonths } from '../data/interactiveFeatures.js'
import {
  createLowPolyLandscape,
  createLowPolyClouds,
  createAlpineWildflowers,
} from './tulip3dBuilder.js'

export function Tulip3DViewer({ selectedMonth = 4, onSelectMonth }) {
  const { lang } = useLocale()
  const copy = bloomWheelCopy[lang]
  const canvasMountRef = useRef(null)

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [autoRotate, setAutoRotate] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showEnvironment, setShowEnvironment] = useState(true)

  // Keep state refs for animation loop without tearing down the WebGL scene
  const autoRotateRef = useRef(autoRotate)
  useEffect(() => {
    autoRotateRef.current = autoRotate
  }, [autoRotate])

  const showEnvironmentRef = useRef(showEnvironment)
  useEffect(() => {
    showEnvironmentRef.current = showEnvironment
    if (envGroupRef.current) {
      envGroupRef.current.visible = showEnvironment
    }
  }, [showEnvironment])

  // References to keep Three.js instances alive without re-creating
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const controlsRef = useRef(null)
  const cameraRef = useRef(null)
  const modelGroupRef = useRef(null)
  const tulipMeshRef = useRef(null)
  const envGroupRef = useRef(null)
  const cloudsGroupRef = useRef(null)
  const animationFrameRef = useRef(null)

  // Target values for smooth lerp transitions across months
  const targetTransformRef = useRef({
    y: 0.0,
    scale: 1.0,
    rotSpeed: 0.004,
  })

  const currentMonthData =
    bloomWheelMonths.find(m => m.month === selectedMonth) || bloomWheelMonths[3]

  // Calculate target transformation for the low-poly tulip according to the phenological month
  useEffect(() => {
    let targetY = 0.0
    let targetScale = 1.0

    if (selectedMonth === 1 || selectedMonth === 2 || selectedMonth === 12) {
      // Winter dormancy: underground bulb stage (-20 cm)
      targetY = -0.65
      targetScale = 0.35
    } else if (selectedMonth === 3) {
      // Early spring: shoot emerging through soil surface
      targetY = -0.22
      targetScale = 0.65
    } else if (selectedMonth === 4) {
      // Peak Mass Bloom: full glory above ground (reference photo)
      targetY = 0.0
      targetScale = 1.0
    } else if (selectedMonth === 5) {
      // Late bloom / early capsule formation
      targetY = 0.0
      targetScale = 0.98
    } else if (selectedMonth === 6) {
      // Seed ripening & dispersal
      targetY = -0.04
      targetScale = 0.88
    } else if (selectedMonth >= 7 && selectedMonth <= 9) {
      // Summer aestivation: bulb resting in subterranean depth
      targetY = -0.6
      targetScale = 0.35
    } else if (selectedMonth >= 10 && selectedMonth <= 11) {
      // Autumn root development
      targetY = -0.65
      targetScale = 0.35
    }

    targetTransformRef.current = {
      y: targetY,
      scale: targetScale,
      rotSpeed: selectedMonth === 4 ? 0.006 : 0.003,
    }

    if (tulipMeshRef.current?.userData?.setMonthPhase) {
      tulipMeshRef.current.userData.setMonthPhase(selectedMonth)
    }
  }, [selectedMonth])

  // Initialize Three.js scene
  useEffect(() => {
    const mount = canvasMountRef.current
    if (!mount) return undefined

    const width = mount.clientWidth || 400
    const height = mount.clientHeight || 340

    // 1. Scene with soft atmospheric alpine fog
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x81c7f5)
    scene.fog = new THREE.FogExp2(0xcce8ff, 0.038)
    sceneRef.current = scene

    // 2. Camera: Framed to match the exact eye-level angle of the reference photo
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(0, 0.96, 2.75)
    cameraRef.current = camera

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    while (mount.firstChild) {
      mount.removeChild(mount.firstChild)
    }
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minDistance = 1.2
    controls.maxDistance = 5.5
    controls.maxPolarAngle = Math.PI / 2 + 0.08
    controls.target.set(0, 0.72, 0)
    controlsRef.current = controls

    // 5. Lighting: Warm sunny mountain lighting matching the reference photo
    const ambientLight = new THREE.AmbientLight(0xcde8ff, 1.45)
    scene.add(ambientLight)

    // Warm direct sunlight (upper right in photo)
    const sunLight = new THREE.DirectionalLight(0xfff6e2, 2.7)
    sunLight.position.set(4.2, 7.5, 2.2)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    sunLight.shadow.bias = -0.0005
    scene.add(sunLight)

    // Secondary meadow fill light
    const fillLight = new THREE.DirectionalLight(0xa5d6a7, 0.75)
    fillLight.position.set(-4, 3, -2)
    scene.add(fillLight)

    // Subtle sky rim light
    const rimLight = new THREE.PointLight(0xfff9c4, 1.2, 12)
    rimLight.position.set(0, 4, -3)
    scene.add(rimLight)

    // Glowing Sun Disc in the sky
    const sunGeo = new THREE.SphereGeometry(0.35, 16, 16)
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff9c4 })
    const sunMesh = new THREE.Mesh(sunGeo, sunMat)
    sunMesh.position.set(4.8, 6.2, -4.5)
    scene.add(sunMesh)

    // 6. Central Tulipa greigii Model (User's Meshy AI Crimson Bloom GLB)
    const modelGroup = new THREE.Group()
    modelGroupRef.current = modelGroup
    scene.add(modelGroup)

    setIsLoading(true)
    const loader = new GLTFLoader()

    loader.load(
      '/models/tulip_meshy.glb',
      gltf => {
        const root = gltf.scene

        // Compute bounding box and center model
        const box = new THREE.Box3().setFromObject(root)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())

        // Align stem base to y = 0 and center in X/Z
        root.position.x = -center.x
        root.position.z = -center.z
        root.position.y = -box.min.y

        // Normalize model scale so it fits the diorama scene perfectly
        const maxDim = Math.max(size.x, size.y, size.z) || 1
        const scaleFactor = 1.45 / maxDim
        root.scale.setScalar(scaleFactor)

        root.traverse(child => {
          if (child.isMesh && child.material) {
            child.castShadow = true
            child.receiveShadow = true
            if (child.material.map) {
              child.material.map.colorSpace = THREE.SRGBColorSpace
            }
            child.material.roughness = 0.6
            child.material.metalness = 0.05
          }
        })

        modelGroup.add(root)
        tulipMeshRef.current = root
        setIsLoading(false)
      },
      undefined,
      err => {
        console.error('Error loading Meshy tulip model:', err)
        setLoadError(err?.message || 'Failed to load tulip model')
        setIsLoading(false)
      }
    )

    // Underground soil cutaway ring indicating bulb depth
    const soilPedestalGeo = new THREE.CylinderGeometry(0.65, 0.55, 0.9, 16, 1, true)
    const soilPedestalMat = new THREE.MeshBasicMaterial({
      color: 0x5d4037,
      transparent: true,
      opacity: 0.18,
      wireframe: true,
    })
    const soilPedestal = new THREE.Mesh(soilPedestalGeo, soilPedestalMat)
    soilPedestal.position.y = -0.48
    modelGroup.add(soilPedestal)

    // 7. Surrounding Low-Poly Alpine Landscape & Diorama
    const envGroup = new THREE.Group()
    envGroup.visible = showEnvironmentRef.current
    envGroupRef.current = envGroup
    scene.add(envGroup)

    // Base terrain & winding river
    const landscapeMesh = createLowPolyLandscape()
    envGroup.add(landscapeMesh)

    // Wild alpine flowers (blue forget-me-nots, purple spikes, yellow buttercups)
    const wildflowers = createAlpineWildflowers()
    envGroup.add(wildflowers)

    // Low-poly cumulus clouds
    const clouds = createLowPolyClouds()
    cloudsGroupRef.current = clouds
    envGroup.add(clouds)

    // 8. Load glTF low-poly trees, rocks, and distant mountains from user's assets
    const loadEnvModel = (path, targetConfig) => {
      loader.load(
        path,
        gltf => {
          const model = gltf.scene
          model.traverse(child => {
            if (child.isMesh && child.material) {
              child.castShadow = true
              child.receiveShadow = true
              child.material.flatShading = true
              if (child.material.map) {
                child.material.map.colorSpace = THREE.SRGBColorSpace
              }
            }
          })

          const box = new THREE.Box3().setFromObject(model)
          const size = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z) || 1
          const scale = (targetConfig.targetSize || 1) / maxDim
          model.scale.setScalar(scale)

          model.position.set(
            targetConfig.x ?? 0,
            (targetConfig.y ?? 0) - (box.min.y * scale),
            targetConfig.z ?? 0
          )
          if (targetConfig.rotY) model.rotation.y = targetConfig.rotY

          envGroup.add(model)
        },
        undefined,
        err => {
          console.warn('Env model load notice:', path, err?.message)
        }
      )
    }

    // Left hillside deciduous rounded tree (as in reference photo)
    loadEnvModel('/models/env/Resource_Tree1.gltf', {
      x: -1.75,
      y: 0.42,
      z: -0.7,
      targetSize: 0.95,
      rotY: 0.5,
    })

    // Low-poly pine trees along slopes and ridges
    loadEnvModel('/models/env/Resource_PineTree.gltf', {
      x: -1.15,
      y: 0.32,
      z: -1.5,
      targetSize: 0.75,
      rotY: 1.2,
    })
    loadEnvModel('/models/env/Resource_PineTree.gltf', {
      x: -2.25,
      y: 0.68,
      z: -1.8,
      targetSize: 0.95,
      rotY: 2.1,
    })
    loadEnvModel('/models/env/Resource_PineTree_Group.gltf', {
      x: -3.2,
      y: 1.05,
      z: -3.1,
      targetSize: 1.25,
      rotY: 0.4,
    })
    loadEnvModel('/models/env/Resource_PineTree.gltf', {
      x: 3.1,
      y: -0.15,
      z: -2.3,
      targetSize: 0.88,
      rotY: 0.8,
    })
    loadEnvModel('/models/env/Resource_PineTree_Group.gltf', {
      x: 4.1,
      y: 0.08,
      z: -3.6,
      targetSize: 1.15,
      rotY: 1.7,
    })

    // Rocks and boulders matching the photo
    loadEnvModel('/models/env/Resource_Rock_1.gltf', {
      x: 1.15,
      y: 0.02,
      z: 0.45,
      targetSize: 0.55,
      rotY: 0.8,
    })
    loadEnvModel('/models/env/Rock.gltf', {
      x: -0.82,
      y: 0.02,
      z: 0.38,
      targetSize: 0.42,
      rotY: 2.3,
    })
    loadEnvModel('/models/env/Rock_Group.gltf', {
      x: -0.35,
      y: -0.02,
      z: -0.65,
      targetSize: 0.48,
      rotY: 1.4,
    })

    // Distant mountain peaks with snow caps
    loadEnvModel('/models/env/MountainLarge_Single.gltf', {
      x: -4.8,
      y: 0.65,
      z: -8.8,
      targetSize: 5.2,
      rotY: -0.2,
    })
    loadEnvModel('/models/env/Mountain_Group_1.gltf', {
      x: 1.8,
      y: 0.3,
      z: -9.2,
      targetSize: 6.2,
      rotY: 0.15,
    })

    setIsLoading(false)

    // 9. Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      // Smooth lerp model position & scale based on active phenology month
      if (modelGroupRef.current) {
        const target = targetTransformRef.current
        modelGroupRef.current.position.y +=
          (target.y - modelGroupRef.current.position.y) * 0.06

        const curScale = modelGroupRef.current.scale.x
        const nextScale = curScale + (target.scale - curScale) * 0.06
        modelGroupRef.current.scale.setScalar(nextScale)

        // 360° Auto-rotation around vertical axis if enabled
        if (autoRotateRef.current) {
          modelGroupRef.current.rotation.y += target.rotSpeed
        }
      }

      // Gentle cloud drift
      if (cloudsGroupRef.current) {
        cloudsGroupRef.current.children.forEach(cloud => {
          cloud.position.x += 0.0016
          if (cloud.position.x > 8.0) {
            cloud.position.x = -8.0
          }
        })
      }

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // 10. Resize handler
    const handleResize = () => {
      if (!canvasMountRef.current || !rendererRef.current || !cameraRef.current) return
      const w = canvasMountRef.current.clientWidth
      const h = canvasMountRef.current.clientHeight
      cameraRef.current.aspect = w / h
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (rendererRef.current) {
        const domEl = rendererRef.current.domElement
        if (domEl && mount.contains(domEl)) {
          mount.removeChild(domEl)
        }
        rendererRef.current.dispose()
      }
      if (controlsRef.current) {
        controlsRef.current.dispose()
      }
      if (sceneRef.current) {
        sceneRef.current.clear()
      }
    }
  }, [])

  const handleResetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.reset()
      cameraRef.current.position.set(0, 0.96, 2.75)
      controlsRef.current.target.set(0, 0.72, 0)
      controlsRef.current.update()
    }
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.y = 0
    }
  }

  // Month elevation/depth summary badge
  const depthText =
    selectedMonth === 4
      ? copy.depthLevels.surface
      : selectedMonth === 3
        ? copy.depthLevels.sprout
        : selectedMonth >= 5 && selectedMonth <= 6
          ? copy.depthLevels.capsule
          : copy.depthLevels.bulb

  return (
    <div
      className={`tulip-3d-stage-card ${isFullscreen ? 'is-fullscreen' : ''}`}
      style={{ '--bloom-accent': currentMonthData.accent }}
    >
      <div className="tulip-3d-topbar">
        <div className="tulip-3d-title-group">
          <span className="tulip-3d-pill">
            <Sparkles size={13} />
            3D WebGL
          </span>
          <span className="tulip-3d-stage-name">
            {copy.model3DTitle}
          </span>
        </div>

        <div className="tulip-3d-actions">
          <button
            type="button"
            className={`tulip-3d-btn ${showEnvironment ? 'active' : ''}`}
            onClick={() => setShowEnvironment(prev => !prev)}
            title={copy.model3DEnvironment}
          >
            <Trees size={14} />
            <span>{copy.model3DEnvironment}</span>
          </button>

          <button
            type="button"
            className={`tulip-3d-btn ${autoRotate ? 'active' : ''}`}
            onClick={() => setAutoRotate(prev => !prev)}
            title={copy.model3DAutoRotate}
          >
            <Compass size={14} />
            <span>{copy.model3DAutoRotate}</span>
          </button>

          <button
            type="button"
            className="tulip-3d-btn"
            onClick={handleResetCamera}
            title={copy.model3DResetView}
          >
            <RotateCcw size={14} />
            <span>{copy.model3DResetView}</span>
          </button>

          <button
            type="button"
            className="tulip-3d-btn"
            onClick={() => setIsFullscreen(prev => !prev)}
            title={isFullscreen ? 'Minimize' : 'Maximize'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <div className="tulip-3d-canvas-wrapper">
        <div className="tulip-3d-canvas-mount" ref={canvasMountRef} />
        {isLoading && (
          <div className="tulip-3d-loading">
            <div className="tulip-3d-spinner" />
            <p>{copy.model3DLoading}</p>
          </div>
        )}

        {loadError && (
          <div className="tulip-3d-error">
            <p>{copy.model3DFallback}</p>
            <small>{loadError}</small>
          </div>
        )}
      </div>

      <div className="tulip-3d-bottom-info">
        <div className="tulip-3d-meta-row">
          <span className="tulip-3d-depth-badge">
            <Layers size={13} />
            <strong>{copy.model3DDepthLabel}:</strong> {depthText}
          </span>
          <span className="tulip-3d-hint">
            <Info size={13} />
            {copy.model3DHint}
          </span>
        </div>
      </div>
    </div>
  )
}

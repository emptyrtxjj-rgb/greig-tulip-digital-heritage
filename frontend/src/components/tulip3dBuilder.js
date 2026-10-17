import * as THREE from 'three'

/**
 * Creates the signature Tulipa greigii flame petal canvas texture
 * Rich scarlet red center with vibrant golden-yellow flame borders and tip.
 */
export function createTulipPetalTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  // 1. Golden yellow base for outer margins and flame crown
  ctx.fillStyle = '#fecb2e'
  ctx.fillRect(0, 0, 512, 512)

  // 2. Draw organic flame body in the center
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(175, 512)
  // Left flame border with natural scalloped waves
  ctx.bezierCurveTo(130, 390, 100, 260, 150, 150)
  ctx.bezierCurveTo(175, 95, 215, 60, 256, 32)
  // Right flame border
  ctx.bezierCurveTo(297, 60, 337, 95, 362, 150)
  ctx.bezierCurveTo(412, 260, 382, 390, 337, 512)
  ctx.closePath()

  // Gradient from deep carmine base to brilliant scarlet flame
  const grad = ctx.createLinearGradient(256, 512, 256, 32)
  grad.addColorStop(0.0, '#a30000')
  grad.addColorStop(0.25, '#c62828')
  grad.addColorStop(0.65, '#e53935')
  grad.addColorStop(0.9, '#f44336')
  grad.addColorStop(1.0, '#ff5722')
  ctx.fillStyle = grad
  ctx.fill()

  // Subtle interior vascular shading
  ctx.strokeStyle = 'rgba(128, 0, 0, 0.22)'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(256, 512)
  ctx.quadraticCurveTo(256, 260, 256, 55)
  ctx.stroke()

  ctx.restore()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * Creates a low-poly faceted petal geometry with non-indexed flat normals
 */
function createPetalGeometry() {
  const geom = new THREE.BufferGeometry()

  // 9 vertices defining the curved, boat-like 3D petal
  const vertices = new Float32Array([
    0, 0, 0,              // 0: base
    -0.14, 0.22, 0.08,    // 1: lower left
    0, 0.26, 0.16,        // 2: lower center spine
    0.14, 0.22, 0.08,     // 3: lower right
    -0.24, 0.54, 0.13,    // 4: mid left (widest)
    0, 0.60, 0.26,        // 5: mid center spine
    0.24, 0.54, 0.13,     // 6: mid right (widest)
    0, 0.84, 0.17,        // 7: upper center
    0, 0.99, 0.03,        // 8: apex tip
  ])

  const uvs = new Float32Array([
    0.5, 0.0,
    0.2, 0.22,
    0.5, 0.26,
    0.8, 0.22,
    0.06, 0.54,
    0.5, 0.60,
    0.94, 0.54,
    0.5, 0.84,
    0.5, 1.0,
  ])

  const indices = [
    0, 1, 2,  0, 2, 3,
    1, 4, 5,  1, 5, 2,
    2, 5, 6,  2, 6, 3,
    4, 8, 7,  4, 7, 5,
    5, 7, 6,  6, 7, 8,
  ]

  geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geom.setIndex(indices)

  const nonIndexed = geom.toNonIndexed()
  nonIndexed.computeVertexNormals()
  return nonIndexed
}

/**
 * Creates a low-poly curved broad Tulipa greigii leaf
 */
function createLeafGeometry(isLeft = true) {
  const geom = new THREE.BufferGeometry()
  const sign = isLeft ? -1 : 1

  const vertices = new Float32Array([
    0, 0, 0,                                 // 0 base
    sign * 0.10, 0.16, 0.06,                 // 1
    0, 0.19, 0.12,                           // 2
    -sign * 0.08, 0.16, 0.05,                // 3
    sign * 0.22, 0.42, 0.18,                 // 4 mid-wing
    sign * 0.05, 0.48, 0.25,                 // 5 mid-spine
    -sign * 0.15, 0.42, 0.16,                // 6 inner-wing
    sign * 0.26, 0.72, 0.32,                 // 7 upper-wing
    sign * 0.08, 0.78, 0.38,                 // 8 upper-spine
    -sign * 0.10, 0.72, 0.28,                // 9 inner-upper
    sign * 0.14, 0.98, 0.42,                 // 10 apex tip
  ])

  const indices = [
    0, 1, 2,  0, 2, 3,
    1, 4, 5,  1, 5, 2,
    2, 5, 6,  2, 6, 3,
    4, 7, 8,  4, 8, 5,
    5, 8, 9,  5, 9, 6,
    7, 10, 8, 8, 10, 9,
  ]

  geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geom.setIndex(indices)

  const nonIndexed = geom.toNonIndexed()
  nonIndexed.computeVertexNormals()
  return nonIndexed
}

/**
 * Builds the complete low-poly Tulipa greigii model
 */
export function createLowPolyTulipModel() {
  const tulip = new THREE.Group()
  tulip.name = 'LowPolyTulipaGreigii'

  const petalTexture = createTulipPetalTexture()

  // 1. Faceted Stem
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x4e8529,
    roughness: 0.65,
    metalness: 0.05,
    flatShading: true,
  })
  const stemGeo = new THREE.CylinderGeometry(0.042, 0.052, 1.15, 6)
  stemGeo.translate(0, 0.575, 0)
  const stemMesh = new THREE.Mesh(stemGeo, stemMat)
  stemMesh.castShadow = true
  stemMesh.receiveShadow = true
  tulip.add(stemMesh)

  // 2. Broad Low-Poly Leaves
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x3d7426,
    roughness: 0.72,
    metalness: 0.02,
    flatShading: true,
    side: THREE.DoubleSide,
  })

  // Left leaf (prominent arching leaf in reference photo)
  const leftLeafGeo = createLeafGeometry(true)
  const leftLeafMesh = new THREE.Mesh(leftLeafGeo, leafMat)
  leftLeafMesh.position.set(-0.02, 0.06, 0.03)
  leftLeafMesh.rotation.set(0.12, 0.25, -0.32)
  leftLeafMesh.scale.set(1.15, 1.05, 1.15)
  leftLeafMesh.castShadow = true
  tulip.add(leftLeafMesh)

  // Right leaf (balancing arch in reference photo)
  const rightLeafGeo = createLeafGeometry(false)
  const rightLeafMesh = new THREE.Mesh(rightLeafGeo, leafMat)
  rightLeafMesh.position.set(0.02, 0.09, 0.02)
  rightLeafMesh.rotation.set(-0.08, -0.35, 0.38)
  rightLeafMesh.scale.set(1.05, 0.98, 1.05)
  rightLeafMesh.castShadow = true
  tulip.add(rightLeafMesh)

  // Basal sheath leaf
  const sheathGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.22, 6, 1, true)
  sheathGeo.translate(0, 0.11, 0)
  const sheathMesh = new THREE.Mesh(sheathGeo, leafMat)
  tulip.add(sheathMesh)

  // 3. Flower Head (Corolla) with 6 Petals
  const corollaGroup = new THREE.Group()
  corollaGroup.name = 'Corolla'
  corollaGroup.position.set(0, 1.12, 0)
  tulip.add(corollaGroup)

  const petalMat = new THREE.MeshStandardMaterial({
    map: petalTexture,
    roughness: 0.48,
    metalness: 0.04,
    flatShading: true,
    side: THREE.DoubleSide,
  })

  const petalGeo = createPetalGeometry()
  const petalPivots = []

  // 3 outer petals
  for (let i = 0; i < 3; i++) {
    const pivot = new THREE.Group()
    pivot.rotation.y = (i * 2 * Math.PI) / 3
    const mesh = new THREE.Mesh(petalGeo, petalMat)
    mesh.position.set(0, 0, 0.06)
    mesh.rotation.x = 0.26 // default open goblet tilt
    mesh.castShadow = true
    mesh.receiveShadow = true
    pivot.add(mesh)
    corollaGroup.add(pivot)
    petalPivots.push(mesh)
  }

  // 3 inner alternating petals
  for (let i = 0; i < 3; i++) {
    const pivot = new THREE.Group()
    pivot.rotation.y = (i * 2 * Math.PI) / 3 + Math.PI / 3
    const mesh = new THREE.Mesh(petalGeo, petalMat)
    mesh.position.set(0, 0, 0.045)
    mesh.scale.set(0.96, 0.98, 0.96)
    mesh.rotation.x = 0.16 // nestled inside
    mesh.castShadow = true
    mesh.receiveShadow = true
    pivot.add(mesh)
    corollaGroup.add(pivot)
    petalPivots.push(mesh)
  }

  // 4. Pistil and Stamens
  const interiorGroup = new THREE.Group()
  interiorGroup.name = 'FlowerInterior'
  interiorGroup.position.set(0, 1.14, 0)
  tulip.add(interiorGroup)

  // Central 3-lobed pale green pistil
  const pistilMat = new THREE.MeshStandardMaterial({
    color: 0xaed581,
    roughness: 0.5,
    flatShading: true,
  })
  const pistilGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.35, 6)
  pistilGeo.translate(0, 0.175, 0)
  const pistil = new THREE.Mesh(pistilGeo, pistilMat)
  interiorGroup.add(pistil)

  // 6 dark stamens with golden anther tips
  const stamenMat = new THREE.MeshStandardMaterial({
    color: 0x1f1917,
    roughness: 0.6,
    flatShading: true,
  })
  const antherMat = new THREE.MeshStandardMaterial({
    color: 0xffd54f,
    roughness: 0.4,
    flatShading: true,
  })

  for (let i = 0; i < 6; i++) {
    const ang = (i * Math.PI) / 3
    const stamenPivot = new THREE.Group()
    stamenPivot.rotation.y = ang

    const filament = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.007, 0.26, 4),
      stamenMat
    )
    filament.position.set(0, 0.13, 0.045)
    filament.rotation.x = 0.15
    stamenPivot.add(filament)

    const anther = new THREE.Mesh(
      new THREE.BoxGeometry(0.016, 0.07, 0.025),
      antherMat
    )
    anther.position.set(0, 0.26, 0.065)
    stamenPivot.add(anther)

    interiorGroup.add(stamenPivot)
  }

  // 5. Seed capsule (for June / post-bloom dispersal)
  const capsuleMat = new THREE.MeshStandardMaterial({
    color: 0x689f38,
    roughness: 0.65,
    flatShading: true,
  })
  const capsuleGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.38, 6)
  capsuleGeo.translate(0, 0.19, 0)
  const capsuleMesh = new THREE.Mesh(capsuleGeo, capsuleMat)
  capsuleMesh.visible = false
  interiorGroup.add(capsuleMesh)

  // 6. Underground Bulb with Tunic (for winter & summer dormancy)
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0x5d4037,
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true,
  })
  const bulbGeo = new THREE.DodecahedronGeometry(0.24, 1)
  bulbGeo.scale(1.0, 1.35, 1.0)
  bulbGeo.translate(0, -0.65, 0)
  const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat)
  tulip.add(bulbMesh)

  // Contractive roots under bulb
  const rootMat = new THREE.MeshBasicMaterial({ color: 0x8d6e63, wireframe: true })
  const rootGeo = new THREE.ConeGeometry(0.18, 0.45, 6, 1, true)
  rootGeo.translate(0, -0.92, 0)
  const rootMesh = new THREE.Mesh(rootGeo, rootMat)
  tulip.add(rootMesh)

  // Expose state update method for phenological interactivity
  tulip.userData = {
    corollaGroup,
    petalPivots,
    capsuleMesh,
    bulbMesh,
    stemMesh,
    leftLeafMesh,
    rightLeafMesh,
    interiorGroup,
    setMonthPhase(month) {
      if (month === 4) {
        // Peak Mass Bloom (April) - Reference photo glory!
        corollaGroup.visible = true
        interiorGroup.visible = true
        capsuleMesh.visible = false
        petalPivots.forEach((p, idx) => {
          p.rotation.x = idx < 3 ? 0.26 : 0.16
        })
      } else if (month === 3) {
        // Emerging Sprout / Closed Bud (March)
        corollaGroup.visible = true
        interiorGroup.visible = false
        capsuleMesh.visible = false
        petalPivots.forEach(p => {
          p.rotation.x = 0.05
        })
      } else if (month === 5) {
        // Late Bloom / Early Capsule (May)
        corollaGroup.visible = true
        interiorGroup.visible = true
        capsuleMesh.visible = true
        petalPivots.forEach((p, idx) => {
          p.rotation.x = idx < 3 ? 0.42 : 0.32
        })
      } else if (month === 6) {
        // Seed Dispersal (June) - Petals fall, capsule prominent
        corollaGroup.visible = false
        interiorGroup.visible = true
        capsuleMesh.visible = true
      } else {
        // Dormancy (Winter / Summer)
        corollaGroup.visible = false
        interiorGroup.visible = false
      }
    },
  }

  return tulip
}

/**
 * Creates the low-poly alpine mountain landscape matching the reference photo:
 * Rolling mountain trail, grassy slopes, valley with winding river.
 */
export function createLowPolyLandscape() {
  const landscape = new THREE.Group()
  landscape.name = 'LowPolyLandscape'

  // 1. Terrain Mesh
  const gridX = 32
  const gridZ = 32
  const terrainGeo = new THREE.PlaneGeometry(16, 16, gridX, gridZ)
  terrainGeo.rotateX(-Math.PI / 2)

  const pos = terrainGeo.attributes.position
  const colors = []

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)

    let y = 0
    // Left hillside rising up
    if (x < -0.6) {
      y += Math.pow((-x - 0.6) * 0.42, 1.35) * 0.88
    }
    // Right valley dipping down towards river
    if (x > 1.1) {
      const riverCenter = 2.4 + Math.sin(z * 0.4) * 0.45
      const distToRiver = Math.abs(x - riverCenter)
      if (distToRiver < 0.65) {
        y -= 0.42
      } else {
        y += (x - 2.8) * 0.22 - 0.2
      }
    }
    // Gentle natural landscape undulation
    y += Math.sin(x * 1.4) * Math.cos(z * 1.2) * 0.07

    pos.setY(i, y)

    // Palette matching the reference photo
    const isTrail = Math.abs(x) < 0.85 && z > -2.2
    const isRiverBed = x > 1.7 && x < 3.2

    if (isRiverBed) {
      colors.push(0.65, 0.60, 0.52)
    } else if (isTrail) {
      // Warm rocky gravel trail
      const r = 0.52 + Math.random() * 0.08
      const g = 0.40 + Math.random() * 0.06
      const b = 0.28
      colors.push(r, g, b)
    } else {
      // Lush grassy hillside
      const r = 0.36 + Math.random() * 0.06
      const g = 0.56 + Math.random() * 0.07
      const b = 0.20
      colors.push(r, g, b)
    }
  }

  terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  const flatTerrain = terrainGeo.toNonIndexed()
  flatTerrain.computeVertexNormals()

  const terrainMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.88,
    metalness: 0.05,
    flatShading: true,
  })
  const terrainMesh = new THREE.Mesh(flatTerrain, terrainMat)
  terrainMesh.receiveShadow = true
  landscape.add(terrainMesh)

  // 2. Winding Mountain River Ribbon in Valley
  const riverCurvePts = []
  for (let z = 6; z >= -8; z -= 0.5) {
    const x = 2.4 + Math.sin(z * 0.4) * 0.45
    riverCurvePts.push(new THREE.Vector3(x, -0.37, z))
  }
  const riverCurve = new THREE.CatmullRomCurve3(riverCurvePts)
  const riverSegments = 28
  const riverWidth = 0.58
  const riverVerts = []

  for (let i = 0; i <= riverSegments; i++) {
    const t = i / riverSegments
    const pt = riverCurve.getPoint(t)
    const tangent = riverCurve.getTangent(t)
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize()

    riverVerts.push(pt.x - normal.x * riverWidth * 0.5, pt.y, pt.z - normal.z * riverWidth * 0.5)
    riverVerts.push(pt.x + normal.x * riverWidth * 0.5, pt.y, pt.z + normal.z * riverWidth * 0.5)
  }

  const riverIndices = []
  for (let i = 0; i < riverSegments; i++) {
    const a = i * 2
    const b = a + 1
    const c = a + 2
    const d = a + 3
    riverIndices.push(a, b, c, b, d, c)
  }

  const riverGeo = new THREE.BufferGeometry()
  riverGeo.setAttribute('position', new THREE.Float32BufferAttribute(riverVerts, 3))
  riverGeo.setIndex(riverIndices)
  const flatRiver = riverGeo.toNonIndexed()
  flatRiver.computeVertexNormals()

  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.12,
    metalness: 0.35,
    transparent: true,
    opacity: 0.88,
    flatShading: true,
  })
  const riverMesh = new THREE.Mesh(flatRiver, riverMat)
  landscape.add(riverMesh)

  return landscape
}

/**
 * Creates low-poly cumulus clouds that gently float in the sky
 */
export function createLowPolyClouds() {
  const cloudsGroup = new THREE.Group()
  cloudsGroup.name = 'LowPolyClouds'

  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.92,
    metalness: 0.02,
    flatShading: true,
  })

  const cloudConfigs = [
    { x: -3.8, y: 3.8, z: -6.5, scale: 0.95 },
    { x: -0.6, y: 4.2, z: -7.8, scale: 1.15 },
    { x: 3.5, y: 4.0, z: -6.2, scale: 0.85 },
  ]

  cloudConfigs.forEach(cfg => {
    const cloud = new THREE.Group()
    const spheres = [
      { r: 0.45, x: 0, y: 0, z: 0 },
      { r: 0.36, x: -0.34, y: -0.06, z: 0.05 },
      { r: 0.38, x: 0.35, y: -0.05, z: -0.05 },
      { r: 0.28, x: -0.62, y: -0.12, z: 0 },
      { r: 0.26, x: 0.62, y: -0.10, z: 0.02 },
      { r: 0.32, x: 0.15, y: 0.22, z: 0.06 },
    ]
    spheres.forEach(s => {
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(s.r, 1), cloudMat)
      mesh.position.set(s.x, s.y, s.z)
      cloud.add(mesh)
    })
    cloud.position.set(cfg.x, cfg.y, cfg.z)
    cloud.scale.setScalar(cfg.scale)
    cloudsGroup.add(cloud)
  })

  return cloudsGroup
}

/**
 * Creates clusters of wild alpine flowers (blue forget-me-nots, purple spikes, yellow buttercups)
 * as seen in the foreground of the reference photo.
 */
export function createAlpineWildflowers() {
  const floraGroup = new THREE.Group()
  floraGroup.name = 'AlpineWildflowers'

  const blueMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    roughness: 0.5,
    flatShading: true,
  })
  const purpleMat = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    roughness: 0.5,
    flatShading: true,
  })
  const yellowMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.4,
    flatShading: true,
  })
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xfff59d,
    roughness: 0.3,
    flatShading: true,
  })

  function makeFlower(colorMat, scale = 0.06) {
    const f = new THREE.Group()
    for (let i = 0; i < 5; i++) {
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 4), colorMat)
      petal.rotation.z = Math.PI / 2
      petal.rotation.y = (i * 2 * Math.PI) / 5
      petal.position.set(0, 0, 0)
      f.add(petal)
    }
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.2, 5, 4), eyeMat)
    eye.position.y = 0.1
    f.add(eye)
    f.scale.setScalar(scale)
    return f
  }

  // Clusters of blue alpine flowers (left foreground in reference photo)
  const blueCoords = [
    { x: -0.85, y: 0.08, z: 0.45 },
    { x: -0.92, y: 0.09, z: 0.52 },
    { x: -0.78, y: 0.07, z: 0.38 },
    { x: -1.05, y: 0.14, z: 0.62 },
    { x: 0.75, y: 0.03, z: 0.25 },
  ]
  blueCoords.forEach(c => {
    const fl = makeFlower(blueMat, 0.065)
    fl.position.set(c.x, c.y, c.z)
    floraGroup.add(fl)
  })

  // Clusters of purple bellflowers (right foreground)
  const purpleCoords = [
    { x: 0.88, y: 0.04, z: 0.55 },
    { x: 0.95, y: 0.06, z: 0.62 },
    { x: -0.55, y: 0.05, z: 0.15 },
  ]
  purpleCoords.forEach(c => {
    const fl = makeFlower(purpleMat, 0.07)
    fl.position.set(c.x, c.y, c.z)
    floraGroup.add(fl)
  })

  // Clusters of yellow buttercups
  const yellowCoords = [
    { x: -0.45, y: 0.04, z: 0.55 },
    { x: 0.65, y: 0.02, z: 0.45 },
    { x: 0.35, y: 0.01, z: 0.7 },
  ]
  yellowCoords.forEach(c => {
    const fl = makeFlower(yellowMat, 0.06)
    fl.position.set(c.x, c.y, c.z)
    floraGroup.add(fl)
  })

  return floraGroup
}

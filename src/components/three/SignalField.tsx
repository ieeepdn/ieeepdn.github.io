'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * "Signal field" — a WebGL sea of points rippling like a propagating wave.
 * Reacts to the cursor (a local disturbance) and scroll (camera tilt).
 * Pauses when off-screen; renders one still frame for reduced-motion users.
 */
const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseStrength;
  uniform float uScroll;
  uniform float uPointScale;
  attribute float aRand;
  varying float vHeight;
  varying float vFade;
  varying float vRand;

  // 2D simplex noise — Ian McEwan / Ashima Arts (MIT)
  vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec3 p = position;
    float t = uTime * 0.18;
    float wave = snoise(vec2(p.x * 0.09 + t, p.z * 0.12 - t * 0.6)) * 1.35;
    wave += snoise(vec2(p.x * 0.23 - t * 1.4, p.z * 0.21 + t)) * 0.35;
    // travelling carrier wave — a nod to signals & communications
    wave += sin(p.x * 0.35 + uTime * 1.1) * 0.18 * smoothstep(-20.0, 10.0, p.z);

    float d = distance(p.xz, uMouse);
    float ripple = sin(d * 1.3 - uTime * 4.0) * exp(-d * 0.22) * 1.2 * uMouseStrength;
    p.y += wave + ripple;

    vHeight = p.y;
    vRand = aRand;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = (1.25 + aRand * 1.6 + max(p.y, 0.0) * 0.9);
    gl_PointSize = size * (46.0 / -mv.z) * uPointScale;
    vFade = smoothstep(62.0, 12.0, -mv.z);
  }
`

const fragment = /* glsl */ `
  uniform float uTime;
  varying float vHeight;
  varying float vFade;
  varying float vRand;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, r);
    vec3 deep = vec3(0.0, 0.29, 0.55);   // IEEE blue
    vec3 cyan = vec3(0.26, 0.78, 0.96);
    vec3 hot  = vec3(1.0, 0.71, 0.28);   // signal amber sparks
    vec3 col = mix(deep, cyan, smoothstep(-1.2, 1.4, vHeight));
    float spark = step(0.985, vRand) * (0.5 + 0.5 * sin(uTime * 3.0 + vRand * 100.0));
    col = mix(col, hot, spark);
    gl_FragColor = vec4(col, alpha * vFade * (0.35 + 0.65 * smoothstep(-1.5, 1.5, vHeight)));
  }
`

export default function SignalField({ className }: { className?: string }) {
  const mount = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mount.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const small = window.innerWidth < 768
    // phones and low-end laptops get a lighter field: fewer points, 1× resolution and ~30 fps
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
    const weak = small || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4
    const still = reduce || Boolean(nav.connection?.saveData)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: weak ? 'low-power' : 'high-performance' })
    } catch {
      return // no WebGL — the CSS gradient behind stays visible
    }
    const fullRatio = Math.min(window.devicePixelRatio, small ? 1.5 : 1.75)
    const ratio = weak ? 1 : fullRatio
    renderer.setPixelRatio(ratio)
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200)
    camera.position.set(0, 7.5, 22)
    camera.lookAt(0, 0, -6)

    const cols = weak ? 110 : 220
    const rows = weak ? 64 : 120
    const w = 80
    const d = 60
    const positions = new Float32Array(cols * rows * 3)
    const rands = new Float32Array(cols * rows)
    let i = 0
    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < cols; x++) {
        positions[i * 3] = (x / (cols - 1) - 0.5) * w
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = (z / (rows - 1) - 0.5) * d - 8
        rands[i] = Math.random()
        i++
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aRand', new THREE.BufferAttribute(rands, 1))

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(999, 999) },
      uMouseStrength: { value: 0 },
      uScroll: { value: 0 },
      // points are sized in device pixels: keep them the same size on screen at the lower resolution
      uPointScale: { value: ratio / fullRatio },
    }
    const mat = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const points = new THREE.Points(geo, mat)
    scene.add(points)

    const resize = () => {
      const { clientWidth, clientHeight } = el
      renderer.setSize(clientWidth, clientHeight, false)
      camera.aspect = clientWidth / Math.max(1, clientHeight)
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    // Mouse → ground-plane intersection
    const raycaster = new THREE.Raycaster()
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const ndc = new THREE.Vector2()
    const hit = new THREE.Vector3()
    const target = new THREE.Vector2(999, 999)
    let strengthTarget = 0
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      if (e.clientY > r.bottom) return
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      if (raycaster.ray.intersectPlane(plane, hit)) {
        target.set(hit.x, hit.z)
        strengthTarget = 1
      }
    }
    const onLeave = () => (strengthTarget = 0)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    let visible = true
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0 })
    io.observe(el)

    const clock = new THREE.Clock()
    let raf = 0
    const baseY = camera.position.y
    let lastFrame = 0
    const tick = (now = 0) => {
      raf = requestAnimationFrame(tick)
      if (!visible || document.hidden) return
      if (weak && now - lastFrame < 32) return
      lastFrame = now
      const t = clock.getElapsedTime()
      uniforms.uTime.value = t
      uniforms.uMouse.value.lerp(target, 0.08)
      uniforms.uMouseStrength.value += (strengthTarget - uniforms.uMouseStrength.value) * 0.04
      const scroll = Math.min(1, window.scrollY / window.innerHeight)
      camera.position.y = baseY + scroll * 4
      camera.position.x = Math.sin(t * 0.07) * 1.6
      camera.lookAt(0, -scroll * 3, -6)
      renderer.render(scene, camera)
    }
    if (still) {
      uniforms.uTime.value = 12
      renderer.render(scene, camera)
    } else {
      tick()
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={mount} aria-hidden className={className} />
}

import { useRef, useEffect } from 'react'
import { useSettings } from '../../../contexts/SettingsContext'
import styles from './StarCanvas.module.css'

const TWO_PI = Math.PI * 2

// Color palette — weighted towards white/cool but with visible variety
const STAR_COLORS = [
  { color: [255, 210,  95], weight: 6  }, // warm gold
  { color: [255, 175,  80], weight: 4  }, // amber
  { color: [200, 150, 255], weight: 6  }, // violet
  { color: [150, 185, 255], weight: 7  }, // sky blue
  { color: [120, 225, 210], weight: 4  }, // teal
  { color: [255, 175, 195], weight: 3  }, // rose
  { color: [220, 215, 240], weight: 40 }, // near-white (majority)
  { color: [200, 210, 255], weight: 20 }, // cool white
  { color: [235, 230, 255], weight: 10 }, // bright white
]

// Build a weighted random picker once
const COLOR_TABLE = STAR_COLORS.flatMap(({ color, weight }) =>
  Array(weight).fill(color)
)

function pickColor() {
  return COLOR_TABLE[Math.floor(Math.random() * COLOR_TABLE.length)]
}

function StarCanvas() {
  const canvasRef = useRef(null)
  const { settings } = useSettings()
  const showStars = settings.showStars !== false
  const reduceStars = settings.reduceStars === true

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (!showStars) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const count = reduceStars ? 80 : 120
    const radiusRange = reduceStars ? 1.0 : 2.0
    const radiusBase = reduceStars ? 0.3 : 0.6

    const stars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * radiusRange + radiusBase,
      baseOpacity: Math.random() * 0.5 + 0.2,
      range: Math.random() * 0.4 + 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 2.0 + 0.8,
      color: pickColor(),
    }))

    let paused = false
    const onVisibility = () => { paused = document.hidden }
    document.addEventListener('visibilitychange', onVisibility)

    const draw = (time) => {
      animId = requestAnimationFrame(draw)
      if (paused) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const t = time / 1000

      for (const star of stars) {
        const opacity = star.baseOpacity + Math.sin(t * star.speed + star.phase) * star.range
        const [r, g, b] = star.color
        ctx.beginPath()
        ctx.arc(
          star.x * canvas.width,
          star.y * canvas.height,
          star.radius,
          0,
          TWO_PI
        )
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0, Math.min(1, opacity))})`
        ctx.fill()
      }
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [showStars, reduceStars])

  return <canvas ref={canvasRef} className={styles.canvas} />
}

export default StarCanvas

import { useRef, useEffect } from 'react'
import { useSettings } from '../../../contexts/SettingsContext'
import styles from './StarCanvas.module.css'

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

    // Resize canvas to fill window
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const count = reduceStars ? 80 : 120
    const radiusRange = reduceStars ? 1.0 : 2.0
    const radiusBase = reduceStars ? 0.3 : 0.6

    // Generate stars
    const stars = Array.from({ length: count }, () => {
      const rand = Math.random()
      let color
      if (rand < 0.08) {
        color = [240, 200, 140]
      } else if (rand < 0.14) {
        color = [180, 160, 240]
      } else {
        color = [220, 215, 240]
      }

      return {
        x: Math.random(),
        y: Math.random(),
        radius: Math.random() * radiusRange + radiusBase,
        baseOpacity: Math.random() * 0.5 + 0.2,
        range: Math.random() * 0.4 + 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 2.0 + 0.8,
        color,
      }
    })

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
          Math.PI * 2
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

'use client'

import React, { useEffect, useRef } from 'react'

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drawBackground()
    }

    window.addEventListener('resize', resizeCanvas)

    const drawCloud = (x: number, y: number, size: number) => {
      ctx.beginPath()
      ctx.arc(x, y, size, Math.PI * 0.5, Math.PI * 1.5)
      ctx.arc(x + size, y - size * 0.5, size * 0.75, Math.PI * 1, Math.PI * 2)
      ctx.arc(x + size * 2, y, size, Math.PI * 1.5, Math.PI * 0.5)
      ctx.closePath()
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.fill()
    }

    const drawPoop = (x: number, y: number, size: number) => {
      ctx.beginPath()
      ctx.moveTo(x, y + size)
      ctx.quadraticCurveTo(x + size, y + size, x + size, y + size * 0.5)
      ctx.quadraticCurveTo(x + size, y, x + size * 0.5, y)
      ctx.quadraticCurveTo(x, y, x, y + size * 0.5)
      ctx.closePath()
      ctx.fillStyle = 'rgba(101, 67, 33, 0.8)'
      ctx.fill()
    }

    const drawBackground = () => {
      // Draw sky
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#87CEEB')
      gradient.addColorStop(1, '#E0F6FF')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw clouds and poops
      const totalObjects = 30
      for (let i = 0; i < totalObjects; i++) {
        let x, y
        const size = Math.random() * 30 + 20

        if (i < totalObjects * 0.3) { // 30% of objects on the left side
          x = Math.random() * (canvas.width * 0.3)
          y = Math.random() * canvas.height
        } else if (i < totalObjects * 0.6) { // 30% of objects on the right side
          x = canvas.width - (Math.random() * (canvas.width * 0.3))
          y = Math.random() * canvas.height
        } else { // 40% of objects in the middle
          x = Math.random() * canvas.width
          y = Math.random() * canvas.height
        }

        if (Math.random() > 0.6) { // Increased probability of poops (40% clouds, 60% poops)
          drawPoop(x, y, size)
        } else {
          drawCloud(x, y, size)
        }
      }
    }

    drawBackground()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />
}

export default Background
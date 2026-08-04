'use client'

import { useEffect } from 'react'

const SECTION_IDS = ['features', 'pricing']

export function useScrollSpy() {
  useEffect(() => {
    const visible = new Set<string>()

    const updateHash = () => {
      const active = SECTION_IDS.find(id => visible.has(id))
      const newHash = active ? `#${active}` : ''
      if (window.location.hash === newHash) return
      history.replaceState(null, '', window.location.pathname + newHash)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            visible.add(entry.target.id)
          } else {
            visible.delete(entry.target.id)
          }
        })
        updateHash()
      },
      { threshold: 0.25, rootMargin: '-64px 0px 0px 0px' },
    )

    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])
}

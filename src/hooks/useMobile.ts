import { useState, useEffect } from 'react'

/**
 * Hook to detect if the user is on a mobile device
 * Uses multiple detection methods for reliability
 */
export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (globalThis.window === undefined) return false
    return checkIsMobile()
  })

  useEffect(() => {
    // Re-check on resize (e.g., device rotation or responsive debugging)
    const handleResize = () => {
      setIsMobile(checkIsMobile())
    }

    globalThis.addEventListener('resize', handleResize)
    return () => globalThis.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}

function checkIsMobile(): boolean {
  if (globalThis.window === undefined) return false

  // Check for touch capability
  const hasTouchScreen = 'ontouchstart' in globalThis || navigator.maxTouchPoints > 0

  // Check user agent for mobile devices
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    'android',
    'webos',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'mobile',
  ]
  const isMobileUA = mobileKeywords.some((keyword) => userAgent.includes(keyword))

  // Check viewport width (mobile devices typically < 768px, but tablets can be larger)
  const isNarrowViewport = window.innerWidth <= 1024

  // Consider mobile if has touch AND (mobile UA OR narrow viewport)
  return hasTouchScreen && (isMobileUA || isNarrowViewport)
}

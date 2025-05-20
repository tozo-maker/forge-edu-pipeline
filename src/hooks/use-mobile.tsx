
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query)
      
      const onChange = () => {
        setMatches(media.matches)
      }
      
      // Set initial value
      setMatches(media.matches)
      
      // Use the correct event listener method based on browser support
      media.addEventListener("change", onChange)
      
      // Clean up
      return () => media.removeEventListener("change", onChange)
    }
    
    return undefined
  }, [query])

  return matches
}

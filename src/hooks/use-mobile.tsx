
import * as React from "react"

export const SCREEN_SIZES = {
  sm: 640,   // Small screens, mobile
  md: 768,   // Medium screens, tablets
  lg: 1024,  // Large screens, laptops
  xl: 1280,  // Extra large screens, desktops
  xxl: 1536  // Extra extra large screens
};

// Deprecated, use useMediaQuery instead
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${SCREEN_SIZES.md - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < SCREEN_SIZES.md)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < SCREEN_SIZES.md)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

/**
 * React hook for responsive design using media queries
 * @param query Media query string or predefined key (sm, md, lg, xl, xxl)
 * @param direction Optional direction for predefined keys (default: "max" for (max-width))
 * @returns Boolean indicating if the media query matches
 * 
 * @example
 * // Check if screen is at least medium size
 * const isMediumAndUp = useMediaQuery("md", "min") 
 * 
 * @example
 * // Check if screen is smaller than large size
 * const isSmallerThanLarge = useMediaQuery("lg")
 * 
 * @example
 * // Use a custom media query string
 * const isLandscape = useMediaQuery("(orientation: landscape)")
 */
export function useMediaQuery(
  query: string | keyof typeof SCREEN_SIZES, 
  direction: "max" | "min" = "max"
) {
  // Convert predefined keys to actual media queries
  const mediaQuery = React.useMemo(() => {
    if (query in SCREEN_SIZES) {
      const breakpoint = SCREEN_SIZES[query as keyof typeof SCREEN_SIZES];
      return direction === "max" 
        ? `(max-width: ${breakpoint - 1}px)` 
        : `(min-width: ${breakpoint}px)`;
    }
    return query;
  }, [query, direction]);

  const [matches, setMatches] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(mediaQuery)
      
      // Initial check
      setMatches(media.matches)
      
      // Add change listener
      const onChange = () => setMatches(media.matches)
      media.addEventListener("change", onChange)
      
      // Clean up
      return () => media.removeEventListener("change", onChange)
    }
    
    return undefined
  }, [mediaQuery])

  return matches
}

// Convenience hooks for common screen sizes
export function useIsMobileDevice() {
  return useMediaQuery("sm");
}

export function useIsTablet() {
  return useMediaQuery("md") && !useMediaQuery("sm");
}

export function useIsDesktop() {
  return useMediaQuery("lg", "min");
}

'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const baseVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
}

const easing: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const [hasMounted, setHasMounted] = React.useState(false)

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  const variants = prefersReducedMotion
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
    : baseVariants

  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={pathname}
        variants={variants}
        initial={hasMounted && !prefersReducedMotion ? 'initial' : false}
        animate="animate"
        exit={{ opacity: 0, y: -4 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.22,
          ease: easing,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

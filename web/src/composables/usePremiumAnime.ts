import { animate, createScope, random, type Scope } from 'animejs'
import { onMounted, onUnmounted, type Ref } from 'vue'

/** Floating ambient orbs — Kokonut/Bklit-style background motion */
export function usePremiumAnime(containerRef: Ref<HTMLElement | null>) {
  let scope: Scope | null = null

  onMounted(() => {
    const root = containerRef.value
    if (!root) return

    scope = createScope({ root }).add(() => {
      animate('.premium-orb', {
        translateX: () => random(-28, 28),
        translateY: () => random(-22, 22),
        scale: () => random(0.92, 1.08),
        duration: () => random(8000, 14000),
        easing: 'easeInOutSine',
        loop: true,
        alternate: true,
        delay: (_, i) => (i ?? 0) * 400,
      })

      animate('.premium-grid-line', {
        opacity: [0.03, 0.08, 0.03],
        duration: 6000,
        easing: 'easeInOutQuad',
        loop: true,
      })
    })
  })

  onUnmounted(() => {
    scope?.revert()
  })
}

/** Shimmer sweep for premium buttons/cards */
export function runShimmer(el: HTMLElement | null) {
  if (!el) return
  animate(el, {
    backgroundPosition: ['200% center', '-200% center'],
    duration: 2200,
    easing: 'easeInOutQuad',
  })
}

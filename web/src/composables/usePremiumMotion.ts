import { animate, stagger } from 'animejs'
import type { MaybeRefOrGetter } from 'vue'
import { toValue, onMounted, onUnmounted } from 'vue'

type MotionTarget = Element | Element[] | null | undefined

export function usePremiumMotion() {
  const instances: ReturnType<typeof animate>[] = []

  function fadeInUp(
    target: MaybeRefOrGetter<MotionTarget>,
    options?: { delay?: number; duration?: number; y?: number },
  ) {
    onMounted(() => {
      const el = toValue(target)
      if (!el) return
      instances.push(
        animate(el, {
          opacity: [0, 1],
          translateY: [options?.y ?? 18, 0],
          duration: options?.duration ?? 550,
          delay: options?.delay ?? 0,
          ease: 'outCubic',
        }),
      )
    })
  }

  function staggerChildren(
    container: MaybeRefOrGetter<HTMLElement | null | undefined>,
    selector = '[data-premium-reveal]',
    options?: { delay?: number; stagger?: number },
  ) {
    onMounted(() => {
      const root = toValue(container)
      if (!root) return
      const items = root.querySelectorAll(selector)
      if (!items.length) return
      instances.push(
        animate(items, {
          opacity: [0, 1],
          translateY: [14, 0],
          duration: 500,
          delay: stagger(options?.stagger ?? 60, { start: options?.delay ?? 80 }),
          ease: 'outCubic',
        }),
      )
    })
  }

  function hoverLift(target: MaybeRefOrGetter<HTMLElement | null | undefined>) {
    let hoverAnim: ReturnType<typeof animate> | null = null

    onMounted(() => {
      const el = toValue(target)
      if (!el) return

      const onEnter = () => {
        hoverAnim?.pause()
        hoverAnim = animate(el, {
          translateY: -2,
          scale: 1.01,
          duration: 220,
          ease: 'outQuad',
        })
      }
      const onLeave = () => {
        hoverAnim?.pause()
        hoverAnim = animate(el, {
          translateY: 0,
          scale: 1,
          duration: 280,
          ease: 'outQuad',
        })
      }

      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)

      onUnmounted(() => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    })
  }

  onUnmounted(() => {
    for (const anim of instances) anim.pause()
  })

  return { fadeInUp, staggerChildren, hoverLift }
}

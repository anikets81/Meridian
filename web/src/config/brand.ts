export const brand = {
  name: 'Meridian',
  logoSrc: '/logo.svg',
  description:
    'Meridian is a self-hosted project and task management platform focused on clarity, ownership, and control.',
} as const

export type BrandConfig = typeof brand

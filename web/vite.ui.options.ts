import type { NuxtUIOptions } from '@nuxt/ui/vite'

export const uiPluginOptions: NuxtUIOptions = {
  ui: {
    // Nuxt UI reads `ui.tv` at runtime (createTV) but omits it from the AppConfigUI type.
    // Teach tailwind-merge our custom radius scale so `rounded-10`/`rounded-14` are
    // recognized and properly dedupe the component default radius inside `:ui` overrides
    // (no `!` needed). See main.css @theme --radius-10 / --radius-14.
    ...({
      tv: { twMergeConfig: { extend: { theme: { radius: ['10', '14'] } } } },
    } as object),
    inputTime: {
      slots: { base: 'text-base! rounded-10' },
      defaultVariants: {
        variant: 'soft',
      },
    },
    drawer: {
      slots: {
        container: 'pb-[calc(var(--tv-safe-area-inset-bottom)+16px)]',
      },
    },
    slideover: {
      slots: {
        content: 'py-safe',
      },
    },
    dashboardGroup: {
      base: 'py-safe',
    },
    dashboardPanel: {
      slots: {
        root: 'bg-transparent',
        // iPad
        body: 'p-2! pb-[calc(var(--tv-safe-area-inset-bottom)+var(--tv-safe-area-inset-top)+64px)]! lg:pb-[calc(var(--tv-safe-area-inset-bottom)+8px)]!',
      },
    },
    dashboardSidebar: {
      slots: {
        root: 'border-r border-[color:var(--tv-premium-border)] bg-[color:var(--tv-premium-surface)]/80 backdrop-blur-xl shadow-[var(--tv-premium-shadow)]',
        // iPad
        footer: 'lg:pb-[calc(var(--tv-safe-area-inset-bottom)+8px)] lg:border-t lg:border-[color:var(--tv-premium-border)]',
      },
    },
    modal: {
      slots: {
        header: 'relative',
      },
      variants: {
        fullscreen: {
          true: {
            content: 'py-safe',
          },
          false: {
            content: 'rounded-3xl ring-0',
          },
        },
      },
    },
    popover: {
      slots: {
        content: 'rounded-2xl',
      },
    },
    dashboardSearchButton: {
      slots: {
        base: 'rounded-xl',
      },
    },
    dashboardSearch: {
      variants: {
        fullscreen: {
          true: {
            // was too much close to the top with safe area
            input: 'mt-4',
          },
        },
      },
    },
    dashboardNavbar: {
      slots: {
        title: 'text-lg!',
      },
    },
    button: {
      slots: {
        base: 'cursor-pointer rounded-14 font-medium tracking-tight shadow-sm transition-[transform,box-shadow,background] duration-200 hover:shadow-md active:scale-[0.98]',
      },
      defaultVariants: {
        size: 'xl',
      },
      variants: {
        size: {
          xl: {
            leadingIcon: 'size-4.5',
          },
          lg: {
            leadingIcon: 'size-4',
          },
          md: {
            leadingIcon: 'size-3.5',
          },
        },
      },
    },
    inputNumber: {
      slots: {
        base: 'text-base',
      },
      defaultVariants: {
        variant: 'soft',
      },
    },
    input: {
      slots: {
        base: 'rounded-xl bg-[color:var(--tv-premium-surface)] border-[color:var(--tv-premium-border)] shadow-[var(--tv-premium-shadow)] backdrop-blur-sm',
      },
      defaultVariants: {
        size: 'xl',
        variant: 'soft',
      },
      variants: {
        size: {
          xl: {
            base: 'px-3.5',
            leadingIcon: 'size-4.5',
            leading: 'ps-3.5',
          },
        },
      },
    },
    textarea: {
      defaultVariants: {
        size: 'xl',
      },
    },
    colors: {
      primary: 'amber',
      neutral: 'stone',
    },
    collapsible: {
      slots: {
        content: 'p-2',
      },
    },
    card: {
      slots: {
        root: 'rounded-3xl border border-[color:var(--tv-premium-border)] shadow-[var(--tv-premium-shadow)] bg-[color:var(--tv-premium-surface)] backdrop-blur-md',
      },
    },
    pageCard: {
      slots: {
        container: 'sm:p-4',
      },
      variants: {
        variant: {
          taskview: {
            root: 'cursor-pointer shadow-[var(--tv-premium-shadow)] bg-[color:var(--tv-ui-bg-elevated)] border border-[color:var(--tv-premium-border)] backdrop-blur-md transition-[transform,box-shadow,border-color] duration-200 hover:shadow-[var(--tv-premium-shadow-lg)] hover:-translate-y-px',
            container: 'p-2 px-4 sm:p-2 sm:px-4',
          },
          premium: {
            root: 'cursor-pointer shadow-[var(--tv-premium-shadow-lg)] bg-[color:var(--tv-premium-surface)] border border-[color:var(--tv-premium-border)] backdrop-blur-xl',
            container: 'p-3 px-4',
          },
        },

      },
    },
    select: {
      defaultVariants: {
        size: 'xl',
      },
      slots: {
        content: 'rounded-2xl',
        item: 'before:rounded-xl',
        base: 'rounded-xl',
      },
    },
    selectMenu: {
      slots: {
        content: 'rounded-2xl',
        item: 'rounded-xl hover:bg-accented/40 before:rounded-xl',
        base: 'rounded-xl',
        input: 'text-base',
      },
      defaultVariants: {
        variant: 'soft',
      },
    },
    checkbox: {
      slots: {
        base: 'ring-2',
        root: 'cursor-pointer',
      },
      variants: {
        size: {
          xl: {
            base: 'size-5',
            container: 'h-5',
          },
          lg: {
            base: 'size-4',
          },
        },
      },
      defaultVariants: {
        size: 'xl',
        color: 'primary',
      },
    },
  },
}

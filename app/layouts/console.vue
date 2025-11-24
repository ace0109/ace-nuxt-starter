<template>
  <UPage>
    <UHeader :ui="{ container: 'max-w-full' }">
      <template #title>
        <NuxtLogo class="h-6 w-auto" />
      </template>

      <template #right>
        <p>{{ t('welcome') }}</p>
        <UPopover mode="hover">
          <UButton
            icon="i-meteor-icons:language"
            color="neutral"
            variant="link"
            :block="false"
          />

          <template #content>
            <div class="flex flex-col gap-2 p-2">
              <NuxtLink
                v-for="item in i18nLocales"
                :key="item.code"
                :to="switchLocalePath(item.code)"
              >
                {{ item.name }}
              </NuxtLink>
            </div>
          </template>
        </UPopover>

        <UColorModeButton />

        <UTooltip
          text="Open on GitHub"
          :kbds="['meta', 'G']"
        >
          <UButton
            color="neutral"
            variant="ghost"
            to="https://github.com/nuxt/ui"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
          />
        </UTooltip>
      </template>
    </UHeader>
    <UMain class="flex items-stretch h-[calc(100vh-var(--ui-header-height))]">
      <UNavigationMenu
        orientation="vertical"
        :items="items"
        class="w-[260px] p-4"
        :ui="{ link: 'h-[40px]' }"
      />
      <USeparator
        orientation="vertical"
        class="h-full"
      />
      <slot />
    </UMain>
  </UPage>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const { t, locales: i18nLocales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: 'Guide',
      icon: 'i-lucide-book-open',
      children: [
        {
          label: 'Introduction',
          description: 'Fully styled and customizable components for Nuxt.',
          icon: 'i-lucide-house',
        },
        {
          label: 'Installation',
          description: 'Learn how to install and configure Nuxt UI in your application.',
          icon: 'i-lucide-cloud-download',
        },
        {
          label: 'Icons',
          icon: 'i-lucide-smile',
          description: 'You have nothing to do, @nuxt/icon will handle it automatically.',
        },
        {
          label: 'Colors',
          icon: 'i-lucide-swatch-book',
          description: 'Choose a primary and a neutral color from your Tailwind CSS theme.',
        },
        {
          label: 'Theme',
          icon: 'i-lucide-cog',
          description: 'You can customize components by using the `class` / `ui` props or in your app.config.ts.',
        },
      ],
    },
    {
      label: 'Composables',
      icon: 'i-lucide-database',
      children: [
        {
          label: 'defineShortcuts',
          icon: 'i-lucide-file-text',
          description: 'Define shortcuts for your application.',
          to: '/docs/composables/define-shortcuts',
        },
        {
          label: 'useOverlay',
          icon: 'i-lucide-file-text',
          description: 'Display a modal/slideover within your application.',
          to: '/docs/composables/use-overlay',
        },
        {
          label: 'useToast',
          icon: 'i-lucide-file-text',
          description: 'Display a toast within your application.',
          to: '/docs/composables/use-toast',
        },
      ],
    },
    {
      label: 'Components',
      icon: 'i-lucide-box',
      to: '/docs/components',
      active: true,
      defaultOpen: true,
      children: [
        {
          label: 'Link',
          icon: 'i-lucide-file-text',
          description: 'Use NuxtLink with superpowers.',
          to: '/docs/components/link',
        },
        {
          label: 'Modal',
          icon: 'i-lucide-file-text',
          description: 'Display a modal within your application.',
          to: '/docs/components/modal',
        },
        {
          label: 'NavigationMenu',
          icon: 'i-lucide-file-text',
          description: 'Display a list of links.',
          to: '/docs/components/navigation-menu',
        },
        {
          label: 'Pagination',
          icon: 'i-lucide-file-text',
          description: 'Display a list of pages.',
          to: '/docs/components/pagination',
        },
        {
          label: 'Popover',
          icon: 'i-lucide-file-text',
          description: 'Display a non-modal dialog that floats around a trigger element.',
          to: '/docs/components/popover',
        },
        {
          label: 'Progress',
          icon: 'i-lucide-file-text',
          description: 'Show a horizontal bar to indicate task progression.',
          to: '/docs/components/progress',
        },
      ],
    },
  ],
])
</script>

<style>

</style>

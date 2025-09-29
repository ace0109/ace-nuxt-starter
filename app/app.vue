<template>
  <UApp>
    <UHeader mode="slideover">
      <template #title>
        <NuxtLogo class="h-6 w-auto" />
      </template>

      <UNavigationMenu :items="items" />

      <template #right>
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

      <template #body>
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          class="-mx-2.5"
        />
      </template>
    </UHeader>

    <NuxtPage />
  </UApp>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Blog',
    to: '/blog',
    icon: 'i-carbon-blog',
    active: route.path.startsWith('/blog'),
  },
  {
    label: 'Projects',
    to: '/projects',
    icon: 'i-ix-projects',
    active: route.path.startsWith('/projects'),
  },
  {
    label: 'W-notes',
    to: 'https://wangcaiyuan.cn',
    target: '_blank',
    icon: 'i-mdi-onenote',
  },
])
</script>

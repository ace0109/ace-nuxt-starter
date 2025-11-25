<template>
  <UPage>
    <UHeader>
      <template #title>
        <NuxtLink
          to="/console"
          class="flex items-center gap-2"
        >
          <UIcon
            name="i-heroicons-cog-6-tooth"
            class="size-5"
          />
          <span class="font-semibold">Console</span>
        </NuxtLink>
      </template>

      <UNavigationMenu :items="items" />

      <template #right>
        <UColorModeButton />

        <UButton
          icon="i-heroicons-arrow-left"
          color="neutral"
          variant="ghost"
          to="/"
          aria-label="Back to Home"
        />
      </template>

      <template #body>
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          class="-mx-2.5"
        />
      </template>
    </UHeader>

    <UPageBody class="pb-[54px] m-0">
      <UContainer>
        <slot />
      </UContainer>
    </UPageBody>
  </UPage>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Dashboard',
    to: '/console',
    icon: 'i-heroicons-home',
    active: route.path === '/console',
  },
])
</script>

<template>
  <UApp :locale="locales[locale]">
    <UHeader mode="slideover">
      <template #title>
        <NuxtLogo class="h-6 w-auto" />
      </template>

      <UNavigationMenu :items="items" />

      <template #right>
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
                v-for="locale in i18nLocales"
                :key="locale.code"
                :to="$switchLocalePath(locale.code)"
              >
                {{ locale.name }}
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
import * as locales from '@nuxt/ui/locale'

const { locales: i18nLocales } = useI18n()

const { locale } = useI18n()

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: '导航1',
    to: '/nav/1',
    icon: 'i-carbon-blog',
    active: route.path.startsWith('/nav/1'),
  },
  {
    label: '导航2',
    to: '/nav/2',
    icon: 'i-ix-projects',
    active: route.path.startsWith('/nav/2'),
  },
  {
    label: '外部链接',
    to: 'https://nuxt.com/',
    target: '_blank',
    icon: 'i-mdi-onenote',
  },
])
</script>

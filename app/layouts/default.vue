<template>
  <UPage>
    <UHeader mode="slideover">
      <template #title>
        <NuxtLogo class="h-6 w-auto" />
      </template>

      <UNavigationMenu :items="items" />

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

      <template #body>
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          class="-mx-2.5"
        />
      </template>
    </UHeader>
    <UPageBody class="pb-16">
      <UContainer>
        <slot />
      </UContainer>
    </UPageBody>

    <UFooter class="fixed bottom-0 inset-x-0 bg-default/80 backdrop-blur border-t border-default">
      <div class="flex items-center justify-center gap-4 text-muted text-sm">
        <span>&copy; {{ new Date().getFullYear() }} Ace</span>
        <span>·</span>
        <NuxtLink
          to="https://beian.miit.gov.cn/"
          target="_blank"
          class="hover:text-highlighted transition-colors"
        >
          闽ICP备17004041号-7
        </NuxtLink>
      </div>
    </UFooter>
  </UPage>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const { t, locales: i18nLocales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Chat',
    to: '/chat',
    icon: 'i-heroicons-chat-bubble-left-right',
    active: route.path.startsWith('/chat'),
  },
  {
    label: 'Knowledge Base',
    to: '/console/knowledge-base',
    icon: 'i-heroicons-book-open',
    active: route.path.startsWith('/console/knowledge-base'),
  },
  {
    label: 'Nuxt Docs',
    to: 'https://nuxt.com/',
    target: '_blank',
    icon: 'i-simple-icons-nuxtdotjs',
  },
])
</script>

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
        :ui="{ link: 'h-10' }"
      />
      <USeparator
        orientation="vertical"
        class="h-full"
      />
      <div class="flex-1 p-4">
        <slot />
      </div>
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
      label: '知识库',
      icon: 'i-lucide-library',
      defaultOpen: true,
      children: [
        {
          label: '文档列表',
          icon: 'i-lucide-list',
          to: '/console/knowledge-base',
        },
        {
          label: '入库与维护',
          icon: 'i-lucide-archive-restore',
          to: '/console/knowledge-base/manage',
        },
      ],
    },
  ],
])
</script>

<style>

</style>

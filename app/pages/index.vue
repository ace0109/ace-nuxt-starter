<template>
  <div class="flex flex-col gap-2 p-4">
    <div>
      <UPopover mode="hover">
        <UButton
          icon="i-meteor-icons:language"
          color="neutral"
          variant="link"
          :block="false"
        >
          切换语言
        </UButton>

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
    </div>
    <p>当前语言key：{{ currentLocale }}</p>
    <p>nuxt ui 语言包Keys</p>
    <p>{{ Object.keys(uiLocales) }}</p>

    <p>{{ i18nLocales }}</p>
    <h1>{{ $t('welcome') }}</h1>
    <UCalendar />
  </div>
</template>

<script lang="ts" setup>
import * as uiLocales from '@nuxt/ui/locale'

const { locale: currentLocale, locales: i18nLocales } = useI18n()
</script>

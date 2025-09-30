<template>
  <div>
    <ULocaleSelect
      v-model="locale"
      :locales="locales"
      class="w-48"
      @update:model-value="localeChange"
    />
    <h1>{{ $t('welcome') }}</h1>
    <UCalendar />
  </div>
</template>

<script lang="ts" setup>
import * as uiLocales from '@nuxt/ui/locale'

const { locale, locales: i18nLocales, setLocale } = useI18n()

const locales = computed(() => {
  return i18nLocales.value.map(l => uiLocales[l.code])
})

const localeChange = (value: string | undefined) => {
  setLocale(value as 'en' | 'zh_cn')
}
</script>

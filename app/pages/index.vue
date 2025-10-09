<template>
  <div class="flex flex-col gap-2 p-4">
    <p>当前语言key：{{ currentLocale }}</p>
    <h1>{{ $t('welcome') }}</h1>
  </div>
</template>

<script lang="ts" setup>
const { locale: currentLocale } = useI18n()
</script>

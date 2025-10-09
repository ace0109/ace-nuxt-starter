<template>
  <div>
    <h1>导航 {{ id }}</h1>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()

const id = computed(() => route.params.id)
</script>

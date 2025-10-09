<template>
  <div class="slide-enter-content">
    <p v-if="error">
      error: {{ error }}
    </p>
    <div v-if="status === 'success' && data?.resume?.content">
      <MDC
        class="max-w-[600px] m-auto mdc-renderer"
        :value="data.resume.content"
        tag="article"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Resume } from '~~/types/api'

const { data, status, error } = await useFetch<Resume>('/api/home/resume')
</script>

<style scoped>
@keyframes slide-enter {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

[data-animate] {
  --stagger: 0;
  --delay: 60ms;
  --start: 0ms;
}

@media (prefers-reduced-motion: no-preference) {
  [data-animate] {
    animation: slide-enter 0.3s both;
    animation-delay: calc(var(--stagger) * var(--delay) + var(--start));
  }
}

[data-animation-controller='false'] [data-animate] {
  animation: none;
}

.slide-enter-content :deep(.mdc-renderer) > * {
  --stagger: 0;
  --delay: 60ms;
  --start: 0ms;
  animation: slide-enter 0.3s both 1;
  animation-delay: calc(var(--start) + var(--stagger) * var(--delay));
}

.slide-enter-content :deep(.mdc-renderer) > *:nth-child(1) {
  --stagger: 1;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(2) {
  --stagger: 2;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(3) {
  --stagger: 3;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(4) {
  --stagger: 4;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(5) {
  --stagger: 5;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(6) {
  --stagger: 6;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(7) {
  --stagger: 7;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(8) {
  --stagger: 8;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(9) {
  --stagger: 9;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(10) {
  --stagger: 10;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(11) {
  --stagger: 11;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(12) {
  --stagger: 12;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(13) {
  --stagger: 13;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(14) {
  --stagger: 14;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(15) {
  --stagger: 15;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(16) {
  --stagger: 16;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(17) {
  --stagger: 17;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(18) {
  --stagger: 18;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(19) {
  --stagger: 19;
}
.slide-enter-content :deep(.mdc-renderer) > *:nth-child(20) {
  --stagger: 20;
}
</style>

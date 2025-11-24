// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxtjs/mdc',
  ],
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  ui: {
    fonts: false,
  },

  runtimeConfig: {
    aiApiBase: process.env.NUXT_AI_API_BASE || 'http://127.0.0.1:8000',
    aiApiPrefix: process.env.NUXT_AI_API_PREFIX || 'api',
    aiApiKey: process.env.NUXT_API_KEY || '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://nest.wangcaiyuan.com',
      apiPrefix: process.env.NUXT_PUBLIC_API_PREFIX || 'api',
    },
  },
  compatibilityDate: '2025-07-15',

  eslint: {
    config: {
      stylistic: true,
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'zh_cn', name: '简体中文', file: 'zh-cn.json' },
    ],
  },
})

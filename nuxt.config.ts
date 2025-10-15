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
    public: {
      apiHost: 'http://localhost:8000',
      apiPrefix: 'api',
      // 真实后端 API 地址
      BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
      NODE_ENV: process.env.NODE_ENV || 'development',
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

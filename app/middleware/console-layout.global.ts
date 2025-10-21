export default defineNuxtRouteMiddleware((to) => {
  // 为所有 /console 开头的路由自动设置 console layout
  // 支持 i18n 路由前缀: /console 或 /{locale}/console
  const pathWithoutLocale = to.path.replace(/^\/(en|zh_cn)/, '')

  if (to.path.startsWith('/console') || pathWithoutLocale.startsWith('/console')) {
    setPageLayout('console')
  }
})

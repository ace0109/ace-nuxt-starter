export default defineNuxtRouteMiddleware((to) => {
  // 为所有 /console 开头的路由自动设置 console layout
  if (to.path.startsWith('/console')) {
    setPageLayout('console')
  }
})

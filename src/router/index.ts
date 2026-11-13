/**
 * router/index.ts
 *
 * Manual routes for ./src/pages/*.vue
 */

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/speech' },
    { path: '/speech', name: 'speech', component: () => import('@/pages/speech.vue') },
  ],
})

export default router

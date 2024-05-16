import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [{
  path: '/',
  redirect: '/lr'
},
{
  path: '/lr',
  name: 'lr',
  component: () => import('@/view/main.vue')
},
  {
    path: '/mlayout_markdown',
    name: 'mlayout_markdown',
    component: () => import('@/view/mlayout_markdown.vue')
  },
  {
    path: '/marker_markdown',
    name: 'marker_markdown',
    component: () => import('@/view/marker_markdown.vue')
  },
  {
    path: '/mupdf_markdown',
    name: 'mupdf_markdown',
    component: () => import('@/view/mupdf_markdown.vue')
  },
// {
//   path: '/login',
//   name: 'Login',
//   component: () => import('@/view/login/index.vue')
// },
// {
//   path: '/:catchAll(.*)',
//   meta: {
//     closeTab: true,
//   },
//   component: () => import('@/view/error/index.vue')
// }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router

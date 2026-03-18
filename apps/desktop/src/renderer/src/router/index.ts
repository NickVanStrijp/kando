import { createRouter, createWebHashHistory } from 'vue-router'
import WelcomeView from '@renderer/views/WelcomeView.vue'
import WorkspaceDashboardView from '@renderer/views/WorkspaceDashboardView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: WelcomeView
    },
    {
      path: '/workspaces/create',
      name: 'create-workspace',
      component: WelcomeView
    },
    {
      path: '/workspaces/open',
      name: 'open-workspace',
      component: WelcomeView
    },
    {
      path: '/workspaces/dashboard',
      name: 'workspace-dashboard',
      component: WorkspaceDashboardView
    }
  ]
})

export default router

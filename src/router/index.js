import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: '登录', guestOnly: true }
    },
    {
      path: '/',
      component: () => import('../layouts/AppLayout.vue'),
      redirect: '/home',
      meta: { requiresAuth: true },
      children: [
        { path: 'home', name: 'home', component: () => import('../views/HomeView.vue'), meta: { title: '首页赛事' } },
        { path: 'search', name: 'search', component: () => import('../views/SearchView.vue'), meta: { title: '搜索' } },
        { path: 'ranking', name: 'ranking', component: () => import('../views/RankingView.vue'), meta: { title: '排行榜' } },
        { path: 'event/:id', name: 'event', component: () => import('../views/EventDetailView.vue'), meta: { title: '赛事详情' } },
        { path: 'profile', name: 'profile', component: () => import('../views/ProfileView.vue'), meta: { title: '我的' } },
        { path: 'user/:uid?', name: 'user-profile', component: () => import('../views/UserProfileView.vue'), meta: { title: '个人主页' } },
        { path: 'following', name: 'following', component: () => import('../views/FollowingView.vue'), meta: { title: '我的关注' } }
      ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/home' }
  ]
})

router.beforeEach((to) => {
  const store = useUserStore()
  if (to.meta.title) {
    document.title = `开球网 PC版 - ${to.meta.title}`
  }
  if (to.meta.requiresAuth && !store.token) {
    return { name: 'login' }
  }
  if (to.meta.guestOnly && store.token) {
    return { name: 'home' }
  }
})

export default router

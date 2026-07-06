import { createRouter, createWebHistory } from 'vue-router'
import IndicatorList from '../views/IndicatorList.vue'
import IndicatorForm from '../views/IndicatorForm.vue'
import IndicatorDetail from '../views/IndicatorDetail.vue'
import GroupManage from '../views/GroupManage.vue'
import SourceManage from '../views/SourceManage.vue'
import LogManage from '../views/LogManage.vue'

const routes = [
  { path: '/', redirect: '/indicators' },
  { path: '/indicators', name: 'IndicatorList', component: IndicatorList },
  { path: '/indicators/new', name: 'IndicatorNew', component: IndicatorForm },
  { path: '/indicators/edit/:id', name: 'IndicatorEdit', component: IndicatorForm },
  { path: '/indicators/detail/:id', name: 'IndicatorDetail', component: IndicatorDetail },
  { path: '/groups', name: 'GroupManage', component: GroupManage },
  { path: '/sources', name: 'SourceManage', component: SourceManage },
  { path: '/logs', name: 'LogManage', component: LogManage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

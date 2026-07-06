<template>
  <div class="page">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>指标详情</span>
          <div>
            <el-button type="primary" @click="goEdit">编辑</el-button>
            <el-button @click="$router.back()">返回</el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="2" border v-if="data">
        <el-descriptions-item label="指标名称">{{ data.name }}</el-descriptions-item>
        <el-descriptions-item label="分组">{{ data.group }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(data.status)">{{ data.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="维护人">{{ data.maintainer || '-' }}</el-descriptions-item>
        <el-descriptions-item label="数据来源">{{ data.dataSource || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上线时间">{{ formatDate(data.goLiveTime) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(data.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(data.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item label="应用平台">{{ data.platforms?.join(', ') || '-' }}</el-descriptions-item>
        <el-descriptions-item label="应用报表">{{ data.reports?.join(', ') || '-' }}</el-descriptions-item>
        <el-descriptions-item label="指标定义" :span="2">
          <pre style="white-space: pre-wrap; margin: 0;">{{ data.definition || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ data.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>操作日志</span>
      </template>
      <el-table :data="logs" size="small">
        <el-table-column prop="operation" label="操作类型" width="120" />
        <el-table-column prop="details" label="详情" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getIndicator, getLogs } from '../api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const data = ref(null)
const logs = ref([])

const statusType = (status) => {
  const map = { '草稿': 'info', '已上线': 'success', '已下线': 'danger' }
  return map[status] || 'info'
}

const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN')
}

const goEdit = () => router.push(`/indicators/edit/${route.params.id}`)

onMounted(async () => {
  loading.value = true
  try {
    const [iRes, lRes] = await Promise.all([
      getIndicator(route.params.id),
      getLogs({ indicatorId: route.params.id, pageSize: 100 })
    ])
    if (iRes.success) data.value = iRes.data
    if (lRes.success) logs.value = lRes.data.list
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page {
  max-width: 1000px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

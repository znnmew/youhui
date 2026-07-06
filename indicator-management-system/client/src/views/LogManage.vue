<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
        </div>
      </template>

      <el-table :data="logs" v-loading="loading" stripe>
        <el-table-column prop="indicatorName" label="指标名称" min-width="150" />
        <el-table-column prop="operation" label="操作类型" width="120" />
        <el-table-column prop="details" label="详情" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @change="fetchData"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getLogs } from '../api'

const loading = ref(false)
const logs = ref([])
const total = ref(0)
const query = reactive({
  page: 1,
  pageSize: 20
})

const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN')
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getLogs(query)
    if (res.success) {
      logs.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
}
.card-header {
  font-weight: bold;
}
.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>

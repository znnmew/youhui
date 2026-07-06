<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>数据来源管理</span>
          <el-button type="primary" @click="dialogVisible = true">新增来源</el-button>
        </div>
      </template>

      <el-table :data="sources.map(s => ({ name: s }))" stripe>
        <el-table-column prop="name" label="来源名称" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="danger" @click="handleDelete(row.name)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增来源" width="400px">
      <el-input v-model="newSource" placeholder="请输入数据来源名称" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSources, getIndicators } from '../api'

const sources = ref([])
const dialogVisible = ref(false)
const newSource = ref('')

const fetchSources = async () => {
  const res = await getSources()
  if (res.success) sources.value = res.data
}

const handleAdd = async () => {
  if (!newSource.value.trim()) {
    ElMessage.warning('请输入来源名称')
    return
  }
  if (sources.value.includes(newSource.value.trim())) {
    ElMessage.warning('来源已存在')
    return
  }
  sources.value.push(newSource.value.trim())
  newSource.value = ''
  dialogVisible.value = false
  ElMessage.success('添加成功（来源将在创建指标时实际写入）')
}

const handleDelete = async (name) => {
  try {
    const { data } = await getIndicators({ dataSource: name, pageSize: 1 })
    if (data.total > 0) {
      ElMessage.warning('该来源下存在指标，无法删除')
      return
    }
    await ElMessageBox.confirm(`确认删除来源 "${name}"？`, '提示', { type: 'warning' })
    sources.value = sources.value.filter(s => s !== name)
    ElMessage.success('删除成功')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message)
  }
}

onMounted(fetchSources)
</script>

<style scoped>
.page {
  max-width: 800px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

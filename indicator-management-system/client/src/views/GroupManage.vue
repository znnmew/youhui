<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分组管理</span>
          <el-button type="primary" @click="dialogVisible = true">新增分组</el-button>
        </div>
      </template>

      <el-table :data="groups.map(g => ({ name: g }))" stripe>
        <el-table-column prop="name" label="分组名称" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="danger" @click="handleDelete(row.name)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增分组" width="400px">
      <el-input v-model="newGroup" placeholder="请输入分组名称" />
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
import { getGroups, getIndicators, updateIndicator } from '../api'

const groups = ref([])
const dialogVisible = ref(false)
const newGroup = ref('')

const fetchGroups = async () => {
  const res = await getGroups()
  if (res.success) groups.value = res.data
}

const handleAdd = async () => {
  if (!newGroup.value.trim()) {
    ElMessage.warning('请输入分组名称')
    return
  }
  if (groups.value.includes(newGroup.value.trim())) {
    ElMessage.warning('分组已存在')
    return
  }
  groups.value.push(newGroup.value.trim())
  newGroup.value = ''
  dialogVisible.value = false
  ElMessage.success('添加成功（分组将在创建指标时实际写入）')
}

const handleDelete = async (name) => {
  try {
    const { data } = await getIndicators({ group: name, pageSize: 1 })
    if (data.total > 0) {
      ElMessage.warning('该分组下存在指标，无法删除')
      return
    }
    await ElMessageBox.confirm(`确认删除分组 "${name}"？`, '提示', { type: 'warning' })
    groups.value = groups.value.filter(g => g !== name)
    ElMessage.success('删除成功')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message)
  }
}

onMounted(fetchGroups)
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

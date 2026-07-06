<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>指标管理</span>
          <el-button type="primary" @click="goNew">新建指标</el-button>
        </div>
      </template>

      <el-form :inline="true" class="search-form">
        <el-form-item label="搜索">
          <el-input v-model="query.keyword" placeholder="指标名称/定义/备注" clearable @keyup.enter="fetchData" />
        </el-form-item>
        <el-form-item label="分组">
          <el-select v-model="query.group" placeholder="全部分组" clearable>
            <el-option v-for="g in groups" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable>
            <el-option label="草稿" value="草稿" />
            <el-option label="已上线" value="已上线" />
            <el-option label="已下线" value="已下线" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据来源">
          <el-select v-model="query.dataSource" placeholder="全部来源" clearable>
            <el-option v-for="s in sources" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="toolbar">
        <el-button type="warning" :disabled="!selected.length" @click="batchDialogVisible = true">批量修改</el-button>
        <el-button type="success" :disabled="!selected.length" @click="batchTimeDialogVisible = true">批量修改上线时间</el-button>
      </div>

      <el-table :data="list" v-loading="loading" @selection-change="handleSelectionChange" stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="指标名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="group" label="分组" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dataSource" label="数据来源" width="120" show-overflow-tooltip />
        <el-table-column prop="maintainer" label="维护人" width="100" />
        <el-table-column prop="goLiveTime" label="上线时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.goLiveTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goDetail(row._id)">查看</el-button>
            <el-button link type="primary" @click="goEdit(row._id)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @change="fetchData"
      />
    </el-card>

    <el-dialog v-model="batchDialogVisible" title="批量修改" width="500px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="分组">
          <el-select v-model="batchForm.group" placeholder="不修改" clearable>
            <el-option v-for="g in groups" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="batchForm.status" placeholder="不修改" clearable>
            <el-option label="草稿" value="草稿" />
            <el-option label="已上线" value="已上线" />
            <el-option label="已下线" value="已下线" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据来源">
          <el-select v-model="batchForm.dataSource" placeholder="不修改" clearable>
            <el-option v-for="s in sources" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="维护人">
          <el-input v-model="batchForm.maintainer" placeholder="不修改" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchUpdate">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="batchTimeDialogVisible" title="批量修改上线时间" width="400px">
      <el-form label-width="100px">
        <el-form-item label="上线时间">
          <el-date-picker v-model="batchTime" type="datetime" placeholder="选择时间" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchTimeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchTime">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getIndicators, deleteIndicator, batchUpdateIndicators, getGroups, getSources } from '../api'

const router = useRouter()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const groups = ref([])
const sources = ref([])
const selected = ref([])
const batchDialogVisible = ref(false)
const batchTimeDialogVisible = ref(false)
const batchTime = ref(null)

const query = reactive({
  keyword: '',
  group: '',
  status: '',
  dataSource: '',
  page: 1,
  pageSize: 20
})

const batchForm = reactive({
  group: '',
  status: '',
  dataSource: '',
  maintainer: ''
})

const statusType = (status) => {
  const map = { '草稿': 'info', '已上线': 'success', '已下线': 'danger' }
  return map[status] || 'info'
}

const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN')
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getIndicators(query)
    if (res.success) {
      list.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}

const fetchMeta = async () => {
  try {
    const [gRes, sRes] = await Promise.all([getGroups(), getSources()])
    if (gRes.success) groups.value = gRes.data
    if (sRes.success) sources.value = sRes.data
  } catch (e) {
    console.error(e)
  }
}

const resetQuery = () => {
  query.keyword = ''
  query.group = ''
  query.status = ''
  query.dataSource = ''
  query.page = 1
  fetchData()
}

const handleSelectionChange = (rows) => {
  selected.value = rows
}

const goNew = () => router.push('/indicators/new')
const goEdit = (id) => router.push(`/indicators/edit/${id}`)
const goDetail = (id) => router.push(`/indicators/detail/${id}`)

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除指标 "${row.name}"？`, '提示', { type: 'warning' })
    const res = await deleteIndicator(row._id)
    if (res.success) {
      ElMessage.success('删除成功')
      fetchData()
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message)
  }
}

const handleBatchUpdate = async () => {
  const data = {}
  if (batchForm.group) data.group = batchForm.group
  if (batchForm.status) data.status = batchForm.status
  if (batchForm.dataSource) data.dataSource = batchForm.dataSource
  if (batchForm.maintainer) data.maintainer = batchForm.maintainer
  if (!Object.keys(data).length) {
    ElMessage.warning('请至少选择一项修改内容')
    return
  }
  try {
    const res = await batchUpdateIndicators({ ids: selected.value.map(i => i._id), data })
    if (res.success) {
      ElMessage.success('批量修改成功')
      batchDialogVisible.value = false
      fetchData()
    }
  } catch (e) {
    ElMessage.error(e.message)
  }
}

const handleBatchTime = async () => {
  if (!batchTime.value) {
    ElMessage.warning('请选择上线时间')
    return
  }
  try {
    const res = await batchUpdateIndicators({
      ids: selected.value.map(i => i._id),
      data: { goLiveTime: batchTime.value }
    })
    if (res.success) {
      ElMessage.success('批量修改成功')
      batchTimeDialogVisible.value = false
      fetchData()
    }
  } catch (e) {
    ElMessage.error(e.message)
  }
}

onMounted(() => {
  fetchData()
  fetchMeta()
})
</script>

<style scoped>
.page {
  max-width: 1400px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-form {
  margin-bottom: 20px;
}
.toolbar {
  margin-bottom: 16px;
}
.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>

<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑指标' : '新建指标' }}</span>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" style="max-width: 800px">
        <el-form-item label="指标名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入指标名称" />
        </el-form-item>
        <el-form-item label="分组" prop="group">
          <el-select v-model="form.group" placeholder="选择或输入分组" allow-create filterable clearable style="width: 100%">
            <el-option v-for="g in groups" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="应用报表">
          <div v-for="(r, idx) in form.reports" :key="idx" class="dynamic-item">
            <el-input v-model="form.reports[idx]" placeholder="报表名称或数据表名" />
            <el-button link type="danger" @click="removeReport(idx)">删除</el-button>
          </div>
          <el-button link type="primary" @click="form.reports.push('')">+ 添加报表</el-button>
        </el-form-item>
        <el-form-item label="应用平台">
          <el-select v-model="form.platforms" multiple placeholder="选择应用平台" style="width: 100%">
            <el-option label="PC端" value="PC端" />
            <el-option label="移动端" value="移动端" />
            <el-option label="大屏" value="大屏" />
            <el-option label="小程序" value="小程序" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据来源">
          <el-select v-model="form.dataSource" placeholder="选择或输入数据来源" allow-create filterable clearable style="width: 100%">
            <el-option v-for="s in sources" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="维护人">
          <el-input v-model="form.maintainer" placeholder="请输入维护人" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="草稿">草稿</el-radio>
            <el-radio label="已上线">已上线</el-radio>
            <el-radio label="已下线">已下线</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="指标定义">
          <el-input v-model="form.definition" type="textarea" :rows="4" placeholder="请输入指标定义" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="上线时间">
          <el-date-picker v-model="form.goLiveTime" type="datetime" placeholder="选择上线时间" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getIndicator, createIndicator, updateIndicator, getGroups, getSources } from '../api'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const isEdit = !!route.params.id
const groups = ref([])
const sources = ref([])

const form = reactive({
  name: '',
  group: '',
  reports: [],
  platforms: [],
  dataSource: '',
  maintainer: '',
  status: '草稿',
  definition: '',
  remark: '',
  goLiveTime: null
})

const rules = {
  name: [{ required: true, message: '请输入指标名称', trigger: 'blur' }],
  group: [{ required: true, message: '请选择或输入分组', trigger: 'change' }]
}

const removeReport = (idx) => {
  form.reports.splice(idx, 1)
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    // filter empty reports
    const payload = { ...form, reports: form.reports.filter(r => r.trim()) }
    const res = isEdit
      ? await updateIndicator(route.params.id, payload)
      : await createIndicator(payload)
    if (res.success) {
      ElMessage.success('保存成功')
      router.push('/indicators')
    }
  } catch (e) {
    ElMessage.error(e.message)
  }
}

onMounted(async () => {
  const [gRes, sRes] = await Promise.all([getGroups(), getSources()])
  if (gRes.success) groups.value = gRes.data
  if (sRes.success) sources.value = sRes.data
  if (isEdit) {
    const res = await getIndicator(route.params.id)
    if (res.success) {
      Object.assign(form, res.data)
    }
  }
})
</script>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
}
.card-header {
  font-weight: bold;
}
.dynamic-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
</style>

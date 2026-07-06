import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000
})

api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.message || err.message || '请求失败'
    return Promise.reject(new Error(msg))
  }
)

export const getIndicators = (params) => api.get('/indicators', { params })
export const getIndicator = (id) => api.get(`/indicators/${id}`)
export const createIndicator = (data) => api.post('/indicators', data)
export const updateIndicator = (id, data) => api.put(`/indicators/${id}`, data)
export const deleteIndicator = (id) => api.delete(`/indicators/${id}`)
export const batchUpdateIndicators = (data) => api.post('/indicators/batch-update', data)
export const getGroups = () => api.get('/indicators/groups')
export const getSources = () => api.get('/indicators/sources')
export const getLogs = (params) => api.get('/logs', { params })

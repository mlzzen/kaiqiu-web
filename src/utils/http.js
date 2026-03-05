import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

http.interceptors.request.use((config) => {
  const store = useUserStore()
  config.headers = config.headers || {}
  if (store.token) {
    config.headers.token = store.token
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    const payload = response.data
    if (payload?.code === 1) {
      return payload
    }
    ElMessage.error(payload?.msg || '请求失败')
    return Promise.reject(payload)
  },
  (error) => {
    if (error?.response?.status === 401) {
      const store = useUserStore()
      store.logout()
      ElMessage.error('登录状态失效，请重新登录')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    ElMessage.error(error?.response?.data?.msg || error?.message || '网络异常')
    return Promise.reject(error)
  }
)

export function get(url, params = {}, config = {}) {
  return http.get(url, { params, ...config })
}

export function post(url, data = {}, config = {}) {
  const form = new URLSearchParams()
  Object.entries(data || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      form.append(key, String(value))
    }
  })
  return http.post(url, form, config)
}

export default http

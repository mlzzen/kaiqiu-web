import { defineStore } from 'pinia'

const TOKEN_KEY = 'kaiqiu.token'
const USER_KEY = 'kaiqiu.user'
const CITY_KEY = 'kaiqiu.city'

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    userInfo: readJSON(USER_KEY, {}),
    city: readJSON(CITY_KEY, { id: '385', name: '成都市' }),
    location: readJSON('kaiqiu.location', { lng: '103.9238', lat: '30.5745' })
  }),
  actions: {
    setToken(token) {
      this.token = token || ''
      if (this.token) {
        localStorage.setItem(TOKEN_KEY, this.token)
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }
    },
    setUserInfo(info = {}) {
      this.userInfo = info
      localStorage.setItem(USER_KEY, JSON.stringify(info))
    },
    setCity(city) {
      this.city = city
      localStorage.setItem(CITY_KEY, JSON.stringify(city))
    },
    setLocation(location) {
      this.location = location
      localStorage.setItem('kaiqiu.location', JSON.stringify(location))
    },
    logout() {
      this.setToken('')
      this.setUserInfo({})
    }
  }
})

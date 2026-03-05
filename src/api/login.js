import { post } from '../utils/http'

export function login(data) {
  return post('/user/login', data)
}

export function logout() {
  return post('/user/logout')
}

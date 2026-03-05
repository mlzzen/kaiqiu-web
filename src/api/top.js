import { get, post } from '../utils/http'

export function getTopView(city) {
  return post('/Top/lists', { city })
}

export function getTop100Data(params) {
  return get('/Top/getTop100Data', params)
}

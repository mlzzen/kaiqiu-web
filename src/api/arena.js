import { get, post } from '../utils/http'

export function getArenaListPageByKey(data) {
  return post('/arena/lists', data)
}

export function getArenaDetail(params) {
  return get('/arena/detail', params)
}

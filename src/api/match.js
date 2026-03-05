import { get, post } from '../utils/http'

export function getMatchListByPage(data) {
  return post('/match/lists', data)
}

export function getMatchListPageByKey(data) {
  return post('/match/lists', data)
}

export function getGameDetailByGameid(gameid) {
  return post('/Match/getGameDetail', { gameid })
}

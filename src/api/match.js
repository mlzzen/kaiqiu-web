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

// 获取小组赛比分
export function getGroupGames(params) {
  return get('/Match/init_h_games', params)
}

// 获取淘汰赛比分
export function getArrangeKnockout(params) {
  return get('/Arrange/knockout', params)
}

// 更新小组赛比分
export function updateScore(params) {
  return get('/Match/update_score', params)
}

// 更新淘汰赛比分
export function updateTtScore(params) {
  return get('/Match/update_tt_score', params)
}

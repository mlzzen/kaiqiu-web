import { get } from '../utils/http'

export function getEventDetaiByIdAndLocation(params) {
  return get('/enter/detail', params)
}

export function getGroups(params) {
  return get('/Match/get_groups', params)
}

export function getAllResult(params) {
  return get('/Match/getResult', params)
}

export function getAllHonors(params) {
  return get('/Match/get_all_honors', params)
}

export function getScoreChangeByEventid(eventid) {
  return get('/Match/getScoreChange2', { eventid })
}

export function getMemberDetail(params) {
  return get('/enter/get_member_detail', params)
}

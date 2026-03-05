import { get, post } from '../utils/http'

export function getUserInfo() {
  return post('/user/get_userinfo')
}

export function getPageGamesByUid(uid, page = 1) {
  return get('/User/getGames', { uid, page })
}

export function getMatchListHisByPage(page = 1) {
  return post('/center/events', { page, index: 0 })
}

export function getUserListPageByKey(params) {
  return get('/user/lists', params)
}

export function getDaySign() {
  return post('/user/sign')
}

export function getAdvProfile(uid) {
  return post('/user/adv_profile', { uid })
}

export function getUserFolloweesList() {
  return get('/User/getUserFolloweesList')
}

export function getFolloweeEnrolledMatch(uid) {
  return get('/User/getFolloweeEnrolledMatch', { uid })
}

export function goCancelFolloweeByUid(uid) {
  return get('/User/cancelFollowee', { uid })
}

export function goFolloweeByUid(uid) {
  return get('/User/followee', { uid })
}

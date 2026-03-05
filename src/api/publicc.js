import { get } from '../utils/http'

export function getCities() {
  return get('/publicc/GetCities')
}

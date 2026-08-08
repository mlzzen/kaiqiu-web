import { get } from '../utils/http';

let citiesRequest = null;

export function getCities() {
  if (!citiesRequest) {
    citiesRequest = get('/publicc/GetCities').catch((error) => {
      citiesRequest = null;
      return Promise.reject(error);
    });
  }
  return citiesRequest;
}

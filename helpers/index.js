import axios from 'axios';

const CALLBACK_NAME = '__googleMapsApiOnLoadCallback';

export const googleMapInit = () =>
  new Promise((resolve, reject) => {
    const timeoutId = setTimeout(function() {
      reject(new Error('Could not load the Google Maps API'));
    }, 10000);

    window[CALLBACK_NAME] = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      resolve(window.google.maps);
      delete window[CALLBACK_NAME];
    };

    const gmapiScript = document.createElement('script');
    gmapiScript.src = `https://maps.googleapis.com/maps/api/js?key=${
      process.env.GEOCODE_KEY
    }&callback=${CALLBACK_NAME}`;

    document.body.appendChild(gmapiScript);
  });

export const appReq = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? process.env.API_BASE_URL
      : 'http://localhost:3001/api',
});

export const isDay = () => {
  const nowHour = new Date().getHours();
  return nowHour < 19 && nowHour >= 7;
};

export const convertTempToC = temp => {
  return Math.round(temp - 273.15);
};

export const WeatherApi = {
  getAllWeather(level) {
    return appReq.get(`/get-all-weather?level=${level}`);
  },
};

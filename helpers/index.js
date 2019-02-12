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
  baseURL: process.env.baseURL || 'http://localhost:3001/api',
});

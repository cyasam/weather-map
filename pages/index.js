import { Component } from 'react';
import { appReq, googleMapInit } from '../helpers';
import cities from '../static/json/cities.json';
import mapStyle from '../static/json/map-style.json';

class App extends Component {
  state = {
    map: null,
    mapCenter: {
      lat: 47.826,
      lon: 11.5551,
    },
    cities: [],
  };
  componentDidMount() {
    this.setState({
      cities,
    });

    if (!this.state.map) {
      googleMapInit()
        .then(() => {
          return this.onLoadGoogleMapsScript();
        })
        .then(responses => {
          responses.forEach(response => {
            if (response) {
              const {
                weather: [{ icon }],
                coord: { lat, lon },
              } = response.data;
              this.createMarkers({ lat, lon, icon });
            }
          });
        });
    }
  }

  createMarkers({ lat, lon, icon }) {
    const iconBase = 'https://openweathermap.org/img/w';
    const iconSize = {
      width: 50,
      height: 50,
    };

    const city = cities.find(city => {
      return (
        Number(city.lat.toFixed(2)) === lat &&
        Number(city.lon.toFixed(2)) === lon &&
        city.markerOffset
      );
    });

    const markerOffset = city ? city.markerOffset : 0;

    const iconObj = {
      url: `${iconBase}/${icon}.png`,
      anchor: new google.maps.Point(
        iconSize.width / 2,
        iconSize.width + 6 + markerOffset,
      ),
    };

    // Create markers.
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lon),
      icon: iconObj,
      map: this.state.map,
    });
  }

  onLoadGoogleMapsScript() {
    const { mapCenter, cities } = this.state;
    const { lat, lon } = mapCenter;

    const nowHour = new Date().getHours();

    this.setState({
      map: new google.maps.Map(document.getElementById('map'), {
        center: { lat, lng: lon },
        zoom: 6,
        minZoom: 6,
        maxZoom: 6,
        streetViewControl: false,
        styles:
          (nowHour >= 19 && nowHour <= 23) || (nowHour >= 0 && nowHour < 7)
            ? mapStyle.night
            : mapStyle.day,
      }),
    });

    const promiseCities = cities.map(city => {
      return appReq.get(`/get-weather?lat=${city.lat}&lon=${city.lon}`);
    });

    return Promise.all(promiseCities);
  }

  render() {
    return (
      <div id="map-wrapper">
        <div id="map" />
        <style global jsx>
          {`
            html,
            body,
            #__next {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
            }
            #map-wrapper,
            #map {
              display: flex;
              width: 100%;
              height: 100%;
            }
          `}
        </style>
      </div>
    );
  }
}

export default App;

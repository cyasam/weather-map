import { Component } from 'react';
import { appReq, googleMapInit } from '../helpers';

class App extends Component {
  state = {
    map: null,
    mapCenter: {
      lat: 54.526,
      lng: 15.2551,
    },
    cities: [
      {
        name: 'Berlin',
        lat: 52.52,
        lng: 13.405,
      },
      {
        name: 'London',
        lat: 51.5074,
        lng: -0.1182,
      },
      {
        name: 'Paris',
        lat: 48.8622,
        lng: 2.3638,
      },
      {
        name: 'Milan',
        lat: 45.4807,
        lng: 9.1713,
      },
      {
        name: 'Vienna',
        lat: 48.2096,
        lng: 16.4113,
      },
      {
        name: 'Stockholm',
        lat: 59.3309,
        lng: 18.0809,
      },
      {
        name: 'Oslo',
        lat: 59.9114,
        lng: 10.7325,
      },
      {
        name: 'Moskow',
        lat: 55.7901,
        lng: 37.6425,
      },
      {
        name: 'Warsaw',
        lat: 52.2297,
        lng: 21.0122,
      },
    ],
  };
  componentDidMount() {
    if (!this.state.map) {
      googleMapInit()
        .then(() => {
          return this.onLoadGoogleMapsScript();
        })
        .then(responses => {
          responses.forEach(response => {
            const {
              currently: { icon },
              latitude,
              longitude,
            } = response.data;
            this.createMarkers(latitude, longitude, icon);
          });
        });
    }
  }

  createMarkers(lat, lng, icon) {
    const iconBase = '/static/images/weather-icons';

    const iconObj = {
      url: `${iconBase}/${icon}.svg`,
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 50),
    };

    // Create markers.
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      icon: iconObj,
      map: this.state.map,
    });
  }

  onLoadGoogleMapsScript() {
    const { mapCenter, cities } = this.state;
    const { lat, lng } = mapCenter;

    this.setState({
      map: new google.maps.Map(document.getElementById('map'), {
        center: { lat, lng },
        zoom: 5,
      }),
    });

    const promiseCities = cities.map(city => {
      return appReq.get(`/get-weather?latlng=${city.lat},${city.lng}`);
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

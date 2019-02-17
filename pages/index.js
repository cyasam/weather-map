import { Component } from 'react';
import { appReq, googleMapInit } from '../helpers';
import mapStyle from '../static/json/map-style.json';

class App extends Component {
  state = {
    level: 1,
    zoom: 5,
    map: null,
    mapCenter: {
      lat: 47.826,
      lon: 11.5551,
    },
    cities: null,
    markers: [],
  };

  componentDidMount() {
    if (!this.state.map) {
      googleMapInit()
        .then(() => {
          return this.onLoadGoogleMapsScript();
        })
        .then(response => {
          const { data } = response;
          this.loadMapData(data);

          this.initZoomChanged();
        });
    }
  }

  loadMapData(data) {
    const levelLabel = this.getLevelLabel();

    if (data[levelLabel]) {
      this.setCitiesData(data);
      this.initMarkers(data);
    }
  }

  getLevelLabel() {
    const { level } = this.state;
    return `level${level}`;
  }

  setCitiesData(data) {
    const levelLabel = this.getLevelLabel();
    this.setState(({ cities }) => ({
      cities: {
        [levelLabel]: data[levelLabel],
        ...cities,
      },
    }));
  }

  initMarkers(data) {
    const levelLabel = this.getLevelLabel();
    const createdMarkers = data[this.getLevelLabel()].map(city => {
      if (city) {
        const {
          weather: [{ icon }],
          coord: { lat, lon },
        } = city;

        return this.createMarkers({ lat, lon, icon });
      }
    });

    this.setState(({ markers }) => ({
      markers: {
        [levelLabel]: createdMarkers,
        ...markers,
      },
    }));
  }

  createMarkers({ lat, lon, icon }) {
    const iconBase = 'https://openweathermap.org/img/w';
    const iconSize = {
      width: 50,
      height: 50,
    };

    const iconObj = {
      url: `${iconBase}/${icon}.png`,
      anchor: new google.maps.Point(iconSize.width / 2, iconSize.width + 6),
    };

    // Create markers.
    return new google.maps.Marker({
      position: new google.maps.LatLng(lat, lon),
      icon: iconObj,
      map: this.state.map,
    });
  }

  setStatusMarkers(map) {
    const { markers, level } = this.state;

    const difference = map ? -1 : 0;

    for (let i = level + difference; i < Object.keys(markers).length; i++) {
      const nextLevel = i + 1;

      for (let j = 0; j < markers[`level${nextLevel}`].length; j++) {
        markers[`level${nextLevel}`][j].setMap(map);
      }
    }
  }

  onLoadGoogleMapsScript() {
    const { mapCenter, zoom } = this.state;
    const { lat, lon } = mapCenter;

    const nowHour = new Date().getHours();

    this.setState({
      map: new google.maps.Map(document.getElementById('map'), {
        center: { lat, lng: lon },
        zoom,
        minZoom: zoom,
        maxZoom: zoom + 2,
        streetViewControl: false,
        styles:
          (nowHour >= 19 && nowHour <= 23) || (nowHour >= 0 && nowHour < 7)
            ? mapStyle.night
            : mapStyle.day,
      }),
    });

    return this.getAllWeather();
  }

  getAllWeather() {
    const { level } = this.state;
    return appReq.get(`/get-all-weather?level=${level}`);
  }

  initZoomChanged() {
    const { map } = this.state;

    map.addListener('zoom_changed', () => {
      const zoom = map.getZoom();
      const difference = zoom - this.state.zoom;

      this.setState(
        prevState => ({
          zoom,
          level: prevState.level + difference,
        }),
        () => {
          const { cities } = this.state;

          if (!cities || !cities[this.getLevelLabel()]) {
            this.getAllWeather().then(response => {
              const { data } = response;
              this.loadMapData(data);
            });
          } else {
            if (difference < 0) {
              this.setStatusMarkers(null);
            } else {
              this.setStatusMarkers(map);
            }
          }
        },
      );
    });
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

import { Component, Fragment } from 'react';
import { appReq, googleMapInit } from '../helpers';
import MarkerWithLabel from 'markerwithlabel';
import mapStyle from '../static/json/map-style.json';
import { isDay, convertTempToC } from '../helpers';

import Loading from '../components/Loading';
import Head from '../components/Head';

const MarkerLabel = (icon, temp, name) => {
  const iconBase = 'https://openweathermap.org/img/w';
  return `<div class="inner">
    <img
      src="${`${iconBase}/${icon.name}.png`}"
      width="${icon.width}"
      height="${icon.height}"
      alt="${icon.name}"
    />
    <span>${convertTempToC(temp)}°C - ${name}</span>
  </div>`;
};

class App extends Component {
  state = {
    loading: false,
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
    this.setState({
      loading: true,
    });
    if (!this.state.map) {
      googleMapInit()
        .then(() => {
          return this.onLoadGoogleMapsScript();
        })
        .then(response => {
          const { data } = response;
          this.loadMapData(data);

          this.initZoomChanged();

          this.completeLoad();
        })
        .catch(() => {
          this.completeLoad();
        });
    }
  }

  completeLoad() {
    setTimeout(() => {
      this.setState({
        loading: false,
      });
    });
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
          main: { temp },
          weather: [{ icon }],
          coord: { lat, lon },
          name,
        } = city;

        return this.createMarkers({ lat, lon, temp, icon, name });
      }
    });

    this.setState(({ markers }) => ({
      markers: {
        [levelLabel]: createdMarkers,
        ...markers,
      },
    }));
  }

  createMarkers({ lat, lon, temp, icon, name }) {
    const weatherIcon = {
      name: icon,
      width: 32,
      height: 32,
    };

    const iconObj = {
      shape: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 4,
        fillColor: isDay() ? '#000' : '#fff',
        fillOpacity: 0.8,
        strokeWeight: 0.4,
      },
      anchor: new google.maps.Point(
        -weatherIcon.width / 4,
        weatherIcon.height / 2,
      ),
    };

    const { map } = this.state;
    const MarkerWithLabelIns = MarkerWithLabel(google.maps);

    return new MarkerWithLabelIns({
      position: new google.maps.LatLng(lat, lon),
      map,
      icon: iconObj.shape,
      labelContent: MarkerLabel(weatherIcon, temp, name),
      labelAnchor: iconObj.anchor,
      labelClass: `weather-labels ${isDay() ? 'day' : 'night'}`,
      labelStyle: { opacity: 0.85 },
    });
  }

  setStatusMarkers(map) {
    const { markers, level } = this.state;
    const difference = map ? 0 : 1;
    const nextLevel = level + difference;
    console.log(nextLevel, difference);

    if (nextLevel <= Object.keys(markers).length) {
      markers[`level${nextLevel}`].forEach(marker => marker.setMap(map));
    }
  }

  onLoadGoogleMapsScript() {
    const { mapCenter, zoom } = this.state;
    const { lat, lon } = mapCenter;

    this.setState({
      map: new google.maps.Map(document.getElementById('map'), {
        center: { lat, lng: lon },
        zoom,
        minZoom: zoom,
        maxZoom: zoom + 2,
        streetViewControl: false,
        styles: isDay() ? mapStyle.day : mapStyle.night,
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

      this.setState(prevState => ({
        zoom,
        level: prevState.level + difference,
      }));

      const { cities } = this.state;

      if (!cities || !cities[this.getLevelLabel()]) {
        this.getAllWeather().then(response => {
          const { data } = response;
          this.loadMapData(data);
        });
      } else {
        if (difference < 0) {
          this.setStatusMarkers(null);
        } else if (difference > 0) {
          this.setStatusMarkers(map);
        }
      }
    });
  }

  render() {
    return (
      <Fragment>
        <Head title="Weather Map" />
        <Loading open={this.state.loading} />
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

              .weather-labels .inner {
                display: flex;
                align-items: center;
                padding: 0 10px 0 5px;
                border-radius: 5px;
                background-color: #fff;
                color: #000;
                font-weight: bold;
                font-size: 13px;
                border: 1px solid #ccc;
              }

              .weather-labels.night .inner {
                border-color: transparent;
                background-color: #000;
                color: #fff;
              }
            `}
          </style>
        </div>
      </Fragment>
    );
  }
}

export default App;

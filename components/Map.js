import { Component } from 'react';
import MarkerWithLabel from 'markerwithlabel';
import mapStyle from '../static/json/map-style.json';
import { googleMapInit } from '../helpers';
import { isDay, convertTempToC } from '../helpers';

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

class Map extends Component {
  state = {
    level: 1,
    map: null,
    markers: [],
    zoomChangeDirection: 0,
  };

  componentDidMount() {
    if (!this.state.map) {
      googleMapInit()
        .then(() => {
          return this.props.getAllWeather(this.state.level);
        })
        .then(() => {
          this.onLoadGoogleMapsScript();
        });
    }
  }

  getLevelLabel(level) {
    const initialLevel = level || this.state.level;
    return `level${initialLevel}`;
  }

  changeZoom() {
    const { map } = this.state;
    const newZoom = map.getZoom();

    const zoomChangeDirection = newZoom - this.props.zoom;
    this.setState(prevState => ({
      level: prevState.level + zoomChangeDirection,
      zoomChangeDirection,
    }));

    this.props.handleChangeZoom(newZoom);
  }

  initZoomChanged() {
    this.changeZoom();

    const { level } = this.state;

    const { zoomChangeDirection } = this.state;

    if (
      !Object.keys(this.props.cities).length ||
      !this.props.cities[this.getLevelLabel(level)]
    ) {
      this.props.getAllWeather(level).then(() => {
        this.initMarkers(this.props.cities);
      });
    } else {
      if (zoomChangeDirection < 0) {
        this.toggleMarkers('hide');
      } else if (zoomChangeDirection > 0) {
        this.toggleMarkers('show');
      }
    }
  }

  toggleMarkers(status) {
    const { level, markers } = this.state;
    const selectLevel = status === 'hide' ? level + 1 : level;

    const map = status === 'hide' ? null : this.state.map;
    markers[this.getLevelLabel(selectLevel)].forEach(marker => {
      marker.setMap(map);
    });
  }

  initMarkers(data) {
    let createdMarkers;
    Object.keys(data).forEach(level => {
      createdMarkers = data[level].map(city => {
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
    });

    this.setState(({ markers }) => ({
      markers: {
        [this.getLevelLabel()]: createdMarkers,
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

  createMap() {
    const { mapCenter, zoom, minZoom } = this.props;
    const { lat, lon } = mapCenter;

    const map = new google.maps.Map(document.getElementById('map'), {
      center: { lat, lng: lon },
      zoom,
      minZoom: minZoom || zoom,
      maxZoom: zoom + 2,
      streetViewControl: false,
      styles: isDay() ? mapStyle.day : mapStyle.night,
    });
    map.addListener('zoom_changed', () => this.initZoomChanged());

    this.setState({
      map,
    });

    this.initMarkers(this.props.cities);
  }

  onLoadGoogleMapsScript() {
    this.createMap();
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
              background-color: #17263c;
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
    );
  }
}

export default Map;

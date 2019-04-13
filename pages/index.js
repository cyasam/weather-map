import { Component, Fragment } from 'react';
import { WeatherApi } from '../helpers';

import Loading from '../components/Loading';
import Head from '../components/Head';
import Map from '../components/Map';

class App extends Component {
  state = {
    loading: false,
    zoom: 5,
    mapCenter: {
      lat: 47.826,
      lon: 11.5551,
    },
    cities: {},
  };

  componentDidMount() {
    this.setState({
      loading: true,
    });
  }

  completeLoad() {
    this.setState({
      loading: false,
    });
  }

  loadMapData(data) {
    this.setCitiesData(data);
  }

  setCitiesData(cities) {
    this.setState(prevState => {
      return {
        cities: {
          ...prevState.cities,
          ...cities,
        },
      };
    });

    this.completeLoad();
  }

  handleChangeZoom = newZoom => {
    this.setState({
      zoom: newZoom,
    });
  };

  getAllWeather = level => {
    return WeatherApi.getAllWeather(level)
      .then(response => {
        const { data } = response;
        this.loadMapData(data);
      })
      .catch(() => {
        this.completeLoad();
      });
  };

  render() {
    const { loading, mapCenter, level, zoom, cities } = this.state;

    return (
      <Fragment>
        <Head title="Weather Map" />
        <Loading open={loading} />
        <Map
          mapCenter={mapCenter}
          level={level}
          zoom={zoom}
          cities={cities}
          getAllWeather={this.getAllWeather}
          handleChangeZoom={this.handleChangeZoom}
        />
      </Fragment>
    );
  }
}

export default App;

import { WeatherLocation, WeatherSnapshot } from '../../shared/models/weather.model';

export interface WeatherAdapter {
  loadWeather(location: WeatherLocation): Promise<WeatherSnapshot>;
  resolveCity(cityName: string): Promise<WeatherLocation>;
}

export class BackendWeatherAdapter implements WeatherAdapter {
  async loadWeather(location: WeatherLocation): Promise<WeatherSnapshot> {
    const response = await fetch(this.createWeatherUrl(location), { credentials: 'include' });

    if (!response.ok) {
      throw new Error(`Backend antwortete mit Status ${response.status}`);
    }

    return (await response.json()) as WeatherSnapshot;
  }

  async resolveCity(cityName: string): Promise<WeatherLocation> {
    const url = new URL('/api/weather/location', globalThis.location?.origin ?? 'http://localhost');
    url.searchParams.set('city', cityName);

    const response = await fetch(toBackendPath(url), { credentials: 'include' });

    if (!response.ok) {
      throw new Error(`Backend Geocoding antwortete mit Status ${response.status}`);
    }

    return (await response.json()) as WeatherLocation;
  }

  private createWeatherUrl(location: WeatherLocation): string {
    const url = new URL('/api/weather/current', globalThis.location?.origin ?? 'http://localhost');
    url.searchParams.set('latitude', String(location.latitude));
    url.searchParams.set('longitude', String(location.longitude));
    url.searchParams.set('label', location.label);

    return toBackendPath(url);
  }
}

function toBackendPath(url: URL): string {
  return `${url.pathname}${url.search}`;
}

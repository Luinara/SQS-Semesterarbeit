import {
  parseWeatherSnapshot,
  WeatherApiResponse,
} from '../state/weather-appearance.logic';
import {
  WeatherLocation,
  WeatherSnapshot,
} from '../../shared/models/weather.model';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

interface GeocodingResult {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

export interface WeatherAdapter {
  loadWeather(location: WeatherLocation): Promise<WeatherSnapshot>;
  resolveCity(cityName: string): Promise<WeatherLocation>;
}

export class OpenMeteoWeatherAdapter implements WeatherAdapter {
  async loadWeather(location: WeatherLocation): Promise<WeatherSnapshot> {
    const response = await fetch(this.createWeatherUrl(location));

    if (!response.ok) {
      throw new Error(`Open-Meteo antwortete mit Status ${response.status}`);
    }

    const payload = (await response.json()) as WeatherApiResponse;
    return parseWeatherSnapshot(payload, location.label);
  }

  async resolveCity(cityName: string): Promise<WeatherLocation> {
    const url = new URL(OPEN_METEO_GEOCODING_URL);
    url.searchParams.set('name', cityName);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', 'de');
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Open-Meteo Geocoding antwortete mit Status ${response.status}`);
    }

    const payload = (await response.json()) as GeocodingResponse;
    const result = payload.results?.[0];

    if (!result) {
      throw new Error('Stadt nicht gefunden');
    }

    return {
      latitude: result.latitude,
      longitude: result.longitude,
      label: [result.name, result.admin1, result.country].filter(Boolean).join(', '),
    };
  }

  private createWeatherUrl(location: WeatherLocation): string {
    const url = new URL(OPEN_METEO_URL);
    url.searchParams.set('latitude', String(location.latitude));
    url.searchParams.set('longitude', String(location.longitude));
    url.searchParams.set('current', 'temperature_2m,weather_code,is_day');
    url.searchParams.set('timezone', 'auto');

    return url.toString();
  }
}

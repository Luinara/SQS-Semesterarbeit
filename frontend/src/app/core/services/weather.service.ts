import { computed, Injectable, signal } from '@angular/core';
import {
  parseWeatherSnapshot,
  resolveWeatherScene,
  WeatherApiResponse,
} from '../state/weather-appearance.logic';
import { WeatherSnapshot } from '../../shared/models/weather.model';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const DEFAULT_LOCATION: WeatherLocation = {
  latitude: 52.52,
  longitude: 13.41,
  label: 'Berlin',
};

interface WeatherLocation {
  latitude: number;
  longitude: number;
  label: string;
}

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

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  readonly location = signal<WeatherLocation>(DEFAULT_LOCATION);
  readonly snapshot = signal<WeatherSnapshot | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly scene = computed(() => resolveWeatherScene(this.snapshot()));

  constructor() {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    await this.loadWeatherForLocation(this.location());
  }

  async searchCity(cityName: string): Promise<void> {
    const normalizedCityName = cityName.trim();

    if (!normalizedCityName) {
      this.errorMessage.set('Bitte gib eine Stadt ein.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const location = await this.resolveCity(normalizedCityName);
      this.location.set(location);
      await this.loadWeatherForLocation(location, false);
    } catch {
      this.errorMessage.set(`Für "${normalizedCityName}" wurden keine Wetterdaten gefunden.`);
      this.isLoading.set(false);
    }
  }

  private async loadWeatherForLocation(
    location: WeatherLocation,
    shouldToggleLoading = true
  ): Promise<void> {
    if (shouldToggleLoading) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
    }

    try {
      const response = await fetch(this.createWeatherUrl(location));

      if (!response.ok) {
        throw new Error(`Open-Meteo antwortete mit Status ${response.status}`);
      }

      const payload = (await response.json()) as WeatherApiResponse;
      this.snapshot.set(parseWeatherSnapshot(payload, location.label));
    } catch {
      this.errorMessage.set('Wetterdaten sind gerade nicht verfügbar.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async resolveCity(cityName: string): Promise<WeatherLocation> {
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

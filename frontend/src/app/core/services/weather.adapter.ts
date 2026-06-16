import { parseWeatherSnapshot, WeatherApiResponse } from '../state/weather-appearance.logic';
import { WeatherLocation, WeatherSnapshot } from '../../shared/models/weather.model';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

interface GeocodingResult {
  name: string;
  country?: string;
  admin1?: string;
  country_code?: string;
  feature_code?: string;
  elevation?: number;
  population?: number;
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
    return parseWeatherSnapshot(payload, location.label, new Date().toISOString());
  }

  async resolveCity(cityName: string): Promise<WeatherLocation> {
    const url = new URL(OPEN_METEO_GEOCODING_URL);
    url.searchParams.set('name', cityName);
    url.searchParams.set('count', '10');
    url.searchParams.set('language', 'de');
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Open-Meteo Geocoding antwortete mit Status ${response.status}`);
    }

    const payload = (await response.json()) as GeocodingResponse;
    const result = selectBestGeocodingResult(payload.results ?? [], cityName);

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

const POPULATED_PLACE_FEATURE_CODES = new Set([
  'PPL',
  'PPLA',
  'PPLA2',
  'PPLA3',
  'PPLA4',
  'PPLC',
  'PPLX',
]);

function selectBestGeocodingResult(
  results: GeocodingResult[],
  searchTerm: string
): GeocodingResult | undefined {
  const normalizedSearchTerm = normalizeGeocodingText(searchTerm);
  const compactSearchTerm = compactGeocodingText(normalizedSearchTerm);

  return results
    .map((result, index) => ({
      result,
      score: scoreGeocodingResult(result, normalizedSearchTerm, compactSearchTerm, index),
    }))
    .sort((left, right) => right.score - left.score)[0]?.result;
}

function scoreGeocodingResult(
  result: GeocodingResult,
  normalizedSearchTerm: string,
  compactSearchTerm: string,
  index: number
): number {
  const featureCode = result.feature_code?.toUpperCase();
  const isPopulatedPlace = featureCode ? POPULATED_PLACE_FEATURE_CODES.has(featureCode) : false;
  const normalizedName = normalizeGeocodingText(result.name);
  const normalizedAdmin1 = normalizeGeocodingText(result.admin1 ?? '');
  const compactName = compactGeocodingText(normalizedName);
  let score = isPopulatedPlace ? 1000 : -500;

  if (normalizedName === normalizedSearchTerm) {
    score += isPopulatedPlace ? 700 : 80;
  } else if (compactName.startsWith(compactSearchTerm)) {
    score += 180;
  } else if (compactName.includes(compactSearchTerm)) {
    score += 90;
  }

  if (normalizedAdmin1 === normalizedSearchTerm) {
    score += 650;
  }

  if (typeof result.elevation === 'number') {
    score += Math.max(0, 1000 - result.elevation) / 10;
  }

  if (typeof result.population === 'number') {
    score += Math.min(result.population, 1_000_000) / 10_000;
  }

  return score - index;
}

function normalizeGeocodingText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function compactGeocodingText(value: string): string {
  return value.replace(/\s+/g, '');
}

import {
  WeatherCondition,
  WeatherScene,
  WeatherSnapshot,
  WeatherTimeOfDay,
} from '../../shared/models/weather.model';

export interface WeatherApiCurrent {
  temperature_2m?: number;
  weather_code?: number;
  is_day?: number;
  time?: string;
}

export interface WeatherApiResponse {
  current?: WeatherApiCurrent;
}

export const DEFAULT_WEATHER_SCENE: WeatherScene = {
  className: 'clear-day',
  badge: 'Klarer Tag',
  headline: 'Heller Fokusplatz',
  description:
    'Der Standard-Hintergrund bleibt freundlich, wenn noch keine Wetterdaten geladen sind.',
};

const WEATHER_LABELS: Record<WeatherCondition, string> = {
  clear: 'Klar',
  cloudy: 'Bewölkt',
  rain: 'Regen',
  storm: 'Gewitter',
  snow: 'Schnee',
  hail: 'Hagel',
  fog: 'Nebel',
};

export function mapWeatherCodeToCondition(weatherCode: number): WeatherCondition {
  if (weatherCode === 0) {
    return 'clear';
  }

  if ([1, 2, 3].includes(weatherCode)) {
    return 'cloudy';
  }

  if ([45, 48].includes(weatherCode)) {
    return 'fog';
  }

  if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return 'rain';
  }

  if (weatherCode >= 71 && weatherCode <= 77) {
    return 'snow';
  }

  if ([96, 99].includes(weatherCode)) {
    return 'hail';
  }

  if (weatherCode === 95) {
    return 'storm';
  }

  return 'cloudy';
}

export function parseWeatherSnapshot(
  response: WeatherApiResponse,
  locationLabel: string,
  updatedAt: string | null = null
): WeatherSnapshot {
  const current = response.current ?? {};
  const weatherCode = current.weather_code ?? 3;
  const condition = mapWeatherCodeToCondition(weatherCode);
  const timeOfDay: WeatherTimeOfDay = current.is_day === 0 ? 'night' : 'day';

  return {
    condition,
    timeOfDay,
    temperatureC: current.temperature_2m ?? 0,
    weatherCode,
    label: WEATHER_LABELS[condition],
    locationLabel,
    updatedAt,
  };
}

export function resolveWeatherScene(snapshot: WeatherSnapshot | null): WeatherScene {
  if (!snapshot) {
    return DEFAULT_WEATHER_SCENE;
  }

  const sceneKey = `${snapshot.condition}-${snapshot.timeOfDay}`;
  const dayOrNight = snapshot.timeOfDay === 'day' ? 'Tag' : 'Nacht';

  const scenes: Record<string, WeatherScene> = {
    'clear-day': {
      className: 'clear-day',
      badge: `Sonniger ${dayOrNight}`,
      headline: 'Warmer Sonnenplatz',
      description: `${snapshot.temperatureC}°C in ${snapshot.locationLabel}. Dein Pet sitzt im hellen Tageslicht.`,
    },
    'clear-night': {
      className: 'clear-night',
      badge: `Klare ${dayOrNight}`,
      headline: 'Ruhiger Mondplatz',
      description: `${snapshot.temperatureC}°C in ${snapshot.locationLabel}. Der Hintergrund wechselt in eine Nachtstimmung.`,
    },
    'cloudy-day': {
      className: 'cloudy-day',
      badge: `Bewölkter ${dayOrNight}`,
      headline: 'Weiche Wolkendecke',
      description: `${snapshot.temperatureC}°C in ${snapshot.locationLabel}. Heute ist es ein wolkiger Tag. `,
    },
    'cloudy-night': {
      className: 'cloudy-night',
      badge: `Bewölkte ${dayOrNight}`,
      headline: 'Gedämpfte Nachtluft',
      description: `${snapshot.temperatureC}°C in ${snapshot.locationLabel}. Wolken dämpfen das Mondlicht.`,
    },
    'rain-day': {
      className: 'rain-day',
      badge: `Regnerischer ${dayOrNight}`,
      headline: 'Gemütlicher Regenblick',
      description: `${snapshot.temperatureC}°C in ${snapshot.locationLabel}. Es wird frisch und regnerisch. Schim nicht vergessen! Dein Pet könnte ein bisschen nass werden.`,
    },
    'rain-night': {
      className: 'rain-night',
      badge: `Regnerische ${dayOrNight}`,
      headline: 'Leiser Nachtregen',
      description: `${snapshot.temperatureC}°C in ${snapshot.locationLabel}. Draußen regnet es leise. Nimm einen Schrim mit! Vorsichtig, dein Pet könnte nass werden!`,
    },
    'storm-day': {
      className: 'storm-day',
      badge: `Gewitter am ${dayOrNight}`,
      headline: 'Dramatischer Himmel',
      description: `${snapshot.temperatureC}°C in ${snapshot.locationLabel}. Vorsicht! Heute herrscht Gewitterstimmung!`,
    },
    'storm-night': {
      className: 'storm-night',
      badge: `Gewitter in der ${dayOrNight}`,
      headline: 'Blitzlicht am Fenster',
      description: `${snapshot.temperatureC}°C in ${snapshot.locationLabel}. Die Nacht wird dunkel und elektrisch.`,
    },
    'hail-day': {
      className: 'hail-day',
      badge: `Hagel am ${dayOrNight}`,
      headline: 'Klarer Unterschlupf',
      description: `${snapshot.temperatureC}°C in ${snapshot.locationLabel}. Hagelkörner prasseln draußen. Dein Pet sucht Schutz vor dem Hagel.`,
    },
    'hail-night': {
      className: 'hail-night',
      badge: `Hagel in der ${dayOrNight}`,
      headline: 'Funkelnde Hagelnacht',
      description: `${snapshot.temperatureC}°C in ${snapshot.locationLabel}. Die Nacht wird dunkel, kühl und hagelig.`,
    },
    'snow-day': {
      className: 'snow-day',
      badge: `Schnee am ${dayOrNight}`,
      headline: 'Heller Schneegarten',
      description: `${snapshot.temperatureC}°C in ${snapshot.locationLabel}. Heute ist es schneefallend. Rutscht nicht aus! Dein Pet könnte ein bisschen Schnee abbekommen.`,
    },
    'snow-night': {
      className: 'snow-night',
      badge: `Schnee in der ${dayOrNight}`,
      headline: 'Leuchtende Schneenacht',
      description: `${snapshot.temperatureC}°C in ${snapshot.locationLabel}. Der Schnee hellt die Nacht rund um dein Pet auf.`,
    },
    'fog-day': {
      className: 'fog-day',
      badge: `Nebliger ${dayOrNight}`,
      headline: 'Sanfter Nebel',
      description: `${snapshot.temperatureC}°C in ${snapshot.locationLabel}. Der Nebel hüllt die Umgebung in eine sanfte, mystische Atmosphäre. Dein Pet steht in einem ruhigen Nebelmeer.`,
    },
    'fog-night': {
      className: 'fog-night',
      badge: `Neblige ${dayOrNight}`,
      headline: 'Stille Nebelnacht',
      description: `${snapshot.temperatureC}°C in ${snapshot.locationLabel}. Die Nacht ist von dichtem Nebel umhüllt, der die Umgebung in eine geheimnisvolle Stille hüllt. Dein Pet steht in einem ruhigen Nebelmeer.`,
    },
  };

  return scenes[sceneKey] ?? DEFAULT_WEATHER_SCENE;
}

export type WeatherCondition = 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'hail' | 'fog';

export type WeatherTimeOfDay = 'day' | 'night';

export interface WeatherSnapshot {
  condition: WeatherCondition;
  timeOfDay: WeatherTimeOfDay;
  temperatureC: number;
  weatherCode: number;
  label: string;
  locationLabel: string;
  updatedAt: string;
}

export interface WeatherScene {
  className: string;
  badge: string;
  headline: string;
  description: string;
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DEFAULT_WEATHER_SCENE } from '../../../../core/state/weather-appearance.logic';
import { WeatherScene } from '../../../../shared/models/weather.model';

@Component({
  selector: 'sqs-pet-visual',
  standalone: true,
  templateUrl: './pet-visual.component.html',
  styleUrl: './pet-visual.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetVisualComponent {
  readonly petName = input.required<string>();
  readonly level = input.required<number>();
  readonly weatherScene = input<WeatherScene>(DEFAULT_WEATHER_SCENE);
  readonly sceneClass = computed(() => `pet-visual pet-visual--${this.weatherScene().className}`);
}

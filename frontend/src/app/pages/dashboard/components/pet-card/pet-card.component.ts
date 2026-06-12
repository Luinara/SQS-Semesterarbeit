import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DEFAULT_WEATHER_SCENE } from '../../../../core/state/weather-appearance.logic';
import { PET_RULES } from '../../../../shared/mock/mock-data';
import { PetState } from '../../../../shared/models/pet.model';
import { WeatherScene, WeatherSnapshot } from '../../../../shared/models/weather.model';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';
import { ProgressBarComponent } from '../../../../shared/ui/progress-bar/progress-bar.component';
import { StatBadgeComponent } from '../../../../shared/ui/stat-badge/stat-badge.component';
import { PetVisualComponent } from '../pet-visual/pet-visual.component';

@Component({
  selector: 'sqs-pet-card',
  standalone: true,
  imports: [PetVisualComponent, ProgressBarComponent, StatBadgeComponent, UiButtonComponent],
  templateUrl: './pet-card.component.html',
  styleUrl: './pet-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetCardComponent {
  readonly pet = input<PetState | null>(null);
  readonly completedTasks = input(0);
  readonly totalTasks = input(0);
  readonly weatherScene = input<WeatherScene>(DEFAULT_WEATHER_SCENE);
  readonly weatherSnapshot = input<WeatherSnapshot | null>(null);
  readonly weatherLoading = input(false);
  readonly weatherError = input<string | null>(null);
  readonly feedRequested = output<void>();
  readonly weatherRefreshRequested = output<void>();
  readonly weatherCitySubmitted = output<string>();

  readonly feedCost = PET_RULES.feedCost;
  readonly canFeed = computed(() => (this.pet()?.availableFoodPoints ?? 0) >= this.feedCost);
  readonly weatherStatus = computed(() => {
    if (this.weatherLoading()) {
      return 'Wetter wird geladen';
    }

    return this.weatherError() ?? this.weatherScene().description;
  });

  requestFeeding(): void {
    this.feedRequested.emit();
  }

  requestWeatherRefresh(): void {
    this.weatherRefreshRequested.emit();
  }

  submitWeatherCity(event: SubmitEvent, cityName: string): void {
    event.preventDefault();
    this.weatherCitySubmitted.emit(cityName);
  }
}

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DEFAULT_WEATHER_SCENE } from '../../../../core/state/weather-appearance.logic';
import { PET_RULES } from '../../../../shared/mock/mock-data';
import { GameFeedback } from '../../../../shared/models/app-state.model';
import { PetCareState, PokemonSnapshot, PetState } from '../../../../shared/models/pet.model';
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
  readonly petCareState = input<PetCareState>('calm');
  readonly gameFeedback = input<GameFeedback | null>(null);
  readonly pokemon = input<PokemonSnapshot | null>(null);
  readonly pokemonLoading = input(false);
  readonly pokemonSourceLabel = input('Lokaler Fallback');
  readonly feedRequested = output<void>();
  readonly weatherRefreshRequested = output<void>();
  readonly weatherCitySubmitted = output<string>();

  readonly feedCost = PET_RULES.feedCost;
  readonly canFeed = computed(() => (this.pet()?.availableFoodPoints ?? 0) >= this.feedCost);
  readonly careStateLabel = computed(() => {
    switch (this.petCareState()) {
      case 'needs-care':
        return 'Braucht Quality-Nachweise';
      case 'ready-to-feed':
        return 'Bereit fuer Training';
      case 'growing':
        return 'Kurz vor Level-Up';
      case 'thriving':
        return 'Abgabebereit';
      default:
        return 'Stabil';
    }
  });
  readonly careStateHint = computed(() => {
    switch (this.petCareState()) {
      case 'needs-care':
        return 'Schliesse einen Quality-Nachweis ab oder trainiere dein Pokemon.';
      case 'ready-to-feed':
        return 'Du hast genug Quality-Punkte fuer die naechste Trainingseinheit.';
      case 'growing':
        return 'Der naechste Level ist schon in Reichweite.';
      case 'thriving':
        return 'Das Quality Gate ist stark genug fuer die Demo.';
      default:
        return 'Ein guter Moment fuer den naechsten SQS-Nachweis.';
    }
  });
  readonly pokemonStatus = computed(() => {
    if (this.pokemonLoading()) {
      return 'Pokemon-Daten werden geladen';
    }

    const pokemon = this.pokemon();
    return pokemon
      ? `${pokemon.displayName} aus ${this.pokemonSourceLabel()}`
      : 'Pokemon-Fallback bereit';
  });
  readonly weatherStatus = computed(() => {
    if (this.weatherLoading()) {
      return 'Wetter wird geladen';
    }

    return this.weatherError() ?? this.weatherScene().description;
  });
  readonly weatherUpdatedAtLabel = computed(() => {
    const weatherSnapshot = this.weatherSnapshot();

    if (!weatherSnapshot) {
      return 'Noch nicht aktualisiert';
    }

    const updatedAt = weatherSnapshot.updatedAt;

    if (!updatedAt) {
      return 'API-Zeit unbekannt';
    }

    const apiTimeLabel = formatWeatherApiTime(updatedAt);

    if (!apiTimeLabel) {
      return 'Aktualisierungszeit unbekannt';
    }

    return `Letzte Aktualisierung: ${apiTimeLabel}`;
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

export function formatWeatherApiTime(updatedAt: string): string | null {
  const apiTimestampMatch =
    /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2})/.exec(
      updatedAt
    );

  if (apiTimestampMatch?.groups) {
    return `${apiTimestampMatch.groups['hour']}:${apiTimestampMatch.groups['minute']} Uhr`;
  }

  const updatedAtDate = new Date(updatedAt);

  if (Number.isNaN(updatedAtDate.getTime())) {
    return null;
  }

  return `${new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(updatedAtDate)} Uhr`;
}

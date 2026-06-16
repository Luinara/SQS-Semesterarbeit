import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  input,
  signal,
} from '@angular/core';
import { DEFAULT_WEATHER_SCENE } from '../../../../core/state/weather-appearance.logic';
import { PetCareState, PokemonSource } from '../../../../shared/models/pet.model';
import { WeatherScene } from '../../../../shared/models/weather.model';

export const CARE_TOOLTIP_HIDE_DELAY_MS = 10_000;

@Component({
  selector: 'sqs-pet-visual',
  standalone: true,
  templateUrl: './pet-visual.component.html',
  styleUrl: './pet-visual.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetVisualComponent implements OnDestroy {
  readonly petName = input.required<string>();
  readonly level = input.required<number>();
  readonly weatherScene = input<WeatherScene>(DEFAULT_WEATHER_SCENE);
  readonly careState = input<PetCareState>('calm');
  readonly spriteUrl = input('pet-placeholder.svg');
  readonly pokemonTypes = input<string[]>([]);
  readonly pokemonSource = input<PokemonSource>('fallback');
  readonly isLevelingUp = input(false);
  readonly sceneClass = computed(
    () => `pet-visual pet-visual--${this.weatherScene().className} pet-visual--${this.careState()}`
  );
  readonly careStatus = computed(() => getCareStatusCopy(this.careState()));
  readonly isCareTooltipVisible = signal(false);
  private careTooltipHideTimeout: ReturnType<typeof setTimeout> | null = null;

  showCareTooltip(): void {
    this.isCareTooltipVisible.set(true);
    this.scheduleCareTooltipHide();
  }

  hideCareTooltip(): void {
    this.clearCareTooltipHideTimeout();
    this.isCareTooltipVisible.set(false);
  }

  ngOnDestroy(): void {
    this.clearCareTooltipHideTimeout();
  }

  private scheduleCareTooltipHide(): void {
    this.clearCareTooltipHideTimeout();
    this.careTooltipHideTimeout = setTimeout(() => {
      this.isCareTooltipVisible.set(false);
      this.careTooltipHideTimeout = null;
    }, CARE_TOOLTIP_HIDE_DELAY_MS);
  }

  private clearCareTooltipHideTimeout(): void {
    if (!this.careTooltipHideTimeout) {
      return;
    }

    clearTimeout(this.careTooltipHideTimeout);
    this.careTooltipHideTimeout = null;
  }
}

interface CareStatusCopy {
  label: string;
  description: string;
}

function getCareStatusCopy(careState: PetCareState): CareStatusCopy {
  switch (careState) {
    case 'needs-care':
      return {
        label: 'Braucht Pflege',
        description: 'Dein Pokémon braucht Wasser, Futter oder erledigte Quests.',
      };
    case 'ready-to-feed':
      return {
        label: 'Fütterung bereit',
        description: 'Du hast genug Punkte gesammelt und kannst dein Pokémon trainieren.',
      };
    case 'growing':
      return {
        label: 'Wächst gerade',
        description: 'Dein Pokémon macht Fortschritt Richtung nächstes Level.',
      };
    case 'thriving':
      return {
        label: 'Sehr gut versorgt',
        description: 'Pflege, Stimmung und Tagesfortschritt sehen stark aus.',
      };
    case 'calm':
      return {
        label: 'Pflege stabil',
        description: 'Der Punkt zeigt den aktuellen Pflegezustand deines Pokémon.',
      };
  }
}

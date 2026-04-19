import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { PET_RULES } from '../../../../shared/mock/mock-data';
import { PetState } from '../../../../shared/models/pet.model';
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
  readonly feedRequested = output<void>();

  readonly feedCost = PET_RULES.feedCost;
  readonly canFeed = computed(() => (this.pet()?.availableFoodPoints ?? 0) >= this.feedCost);

  requestFeeding(): void {
    this.feedRequested.emit();
  }
}

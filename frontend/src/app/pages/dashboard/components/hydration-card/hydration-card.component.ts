import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { HYDRATION_RULES } from '../../../../shared/mock/mock-data';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';

@Component({
  selector: 'sqs-hydration-card',
  standalone: true,
  imports: [UiButtonComponent],
  templateUrl: './hydration-card.component.html',
  styleUrl: './hydration-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HydrationCardComponent {
  readonly currentMl = input<number>(0);
  readonly goalMl = input<number>(3000);
  readonly hydrationAdded = output<number>();

  readonly quickAddMl = HYDRATION_RULES.quickAddMl;
  readonly progressPercent = computed(() => {
    const goalMl = Math.max(1, this.goalMl());
    return Math.min(100, Math.round((this.currentMl() / goalMl) * 100));
  });
  readonly waterLevel = computed(() => `${this.progressPercent()}%`);
  readonly remainingMl = computed(() => Math.max(0, this.goalMl() - this.currentMl()));

  addWater(amountMl: number): void {
    this.hydrationAdded.emit(amountMl);
  }
}

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TaskItem } from '../../../../shared/models/task.model';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';

export const HYDRATION_GOAL_ML = 3000;

@Component({
  selector: 'sqs-hydration-gauge',
  standalone: true,
  imports: [UiButtonComponent],
  templateUrl: './hydration-gauge.component.html',
  styleUrl: './hydration-gauge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HydrationGaugeComponent {
  readonly task = input.required<TaskItem>();
  readonly waterLevel = input(0);
  readonly goalMl = input(HYDRATION_GOAL_ML);
  readonly isBusy = input(false);
  readonly waterAdded = output<number>();

  readonly cappedWaterLevel = computed(() => Math.min(this.waterLevel(), this.goalMl()));
  readonly remainingMl = computed(() => getRemainingHydrationMl(this.waterLevel(), this.goalMl()));
  readonly progressPercent = computed(() =>
    getHydrationProgressPercent(this.waterLevel(), this.goalMl())
  );
  readonly isDone = computed(() => this.task().isCompleted || this.waterLevel() >= this.goalMl());

  addWater(amountMl: number): void {
    if (this.isBusy() || this.isDone()) {
      return;
    }

    this.waterAdded.emit(amountMl);
  }
}

export function getHydrationProgressPercent(
  waterLevel: number,
  goalMl = HYDRATION_GOAL_ML
): number {
  return Math.min(100, Math.round((Math.min(waterLevel, goalMl) / Math.max(1, goalMl)) * 100));
}

export function getRemainingHydrationMl(waterLevel: number, goalMl = HYDRATION_GOAL_ML): number {
  return Math.max(0, goalMl - waterLevel);
}

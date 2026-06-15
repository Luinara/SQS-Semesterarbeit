import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TaskItem } from '../../../../shared/models/task.model';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';

@Component({
  selector: 'sqs-quality-gate-card',
  standalone: true,
  imports: [UiButtonComponent],
  templateUrl: './quality-gate-card.component.html',
  styleUrl: './quality-gate-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QualityGateCardComponent {
  readonly tasks = input.required<TaskItem[]>();
  readonly qualityScore = input(0);
  readonly qualityTarget = input(80);
  readonly waterLevel = input(0);
  readonly foodLevel = input(0);
  readonly streak = input(0);
  readonly waterAdded = output<number>();

  readonly progressPercent = computed(() => {
    const target = Math.max(1, this.qualityTarget());
    return Math.min(100, Math.round((this.qualityScore() / target) * 100));
  });
  readonly requiredTasks = computed(() => this.tasks().filter((task) => task.isRequired));
  readonly completedRequiredTasks = computed(
    () => this.requiredTasks().filter((task) => task.isCompleted).length
  );
  readonly missingRequiredTasks = computed(() =>
    this.requiredTasks().filter((task) => !task.isCompleted).slice(0, 3)
  );
  readonly gateReached = computed(() => this.qualityScore() >= this.qualityTarget());
  readonly visibleTasks = computed(() => this.tasks().slice(0, 5));

  addWater(amountMl: number): void {
    this.waterAdded.emit(amountMl);
  }
}

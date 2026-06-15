import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TaskCategory, TaskItem } from '../../../../shared/models/task.model';

interface QualityStage {
  label: string;
  category: TaskCategory;
}

@Component({
  selector: 'sqs-quality-gate-card',
  standalone: true,
  templateUrl: './quality-gate-card.component.html',
  styleUrl: './quality-gate-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QualityGateCardComponent {
  readonly tasks = input.required<TaskItem[]>();
  readonly qualityScore = input(0);
  readonly qualityTarget = input(80);

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
  readonly stages: QualityStage[] = [
    { label: 'Unit', category: 'testing' },
    { label: 'Integration', category: 'integration' },
    { label: 'E2E', category: 'delivery' },
    { label: 'Security', category: 'security' },
    { label: 'Architecture', category: 'architecture' },
  ];

  isStageCovered(stage: QualityStage): boolean {
    return this.tasks().some((task) => task.category === stage.category && task.isCompleted);
  }
}

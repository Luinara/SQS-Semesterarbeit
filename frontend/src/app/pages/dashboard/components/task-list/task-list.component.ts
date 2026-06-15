import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TaskItem } from '../../../../shared/models/task.model';
import { HydrationGaugeComponent } from '../hydration-gauge/hydration-gauge.component';
import { TaskCardComponent } from '../task-card/task-card.component';

interface QualityQuestProgress {
  completed: number;
  total: number;
  pending: number;
  completedRequired: number;
  totalRequired: number;
  percentage: number;
}

@Component({
  selector: 'sqs-task-list',
  standalone: true,
  imports: [TaskCardComponent, HydrationGaugeComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListComponent {
  readonly tasks = input.required<TaskItem[]>();
  readonly availableFoodPoints = input(0);
  readonly waterLevel = input(0);
  readonly qualityQuestProgress = input<QualityQuestProgress | null>(null);
  readonly taskCompleted = output<string>();
  readonly waterAdded = output<number>();

  readonly completedTasks = computed(() => this.tasks().filter((task) => task.isCompleted).length);
  readonly pendingTasks = computed(() => this.tasks().filter((task) => !task.isCompleted).length);
  readonly waterTask = computed(
    () => this.tasks().find((task) => task.title === 'Wasser trinken') ?? null
  );
  readonly visibleTasks = computed(() =>
    this.tasks().filter((task) => task.id !== this.waterTask()?.id)
  );
  readonly questPercentage = computed(
    () =>
      this.qualityQuestProgress()?.percentage ??
      (this.tasks().length <= 0
        ? 0
        : Math.round((this.completedTasks() / this.tasks().length) * 100))
  );

  finishTask(taskId: string): void {
    this.taskCompleted.emit(taskId);
  }

  addWater(amountMl: number): void {
    this.waterAdded.emit(amountMl);
  }

  isTaskLocked(_task: TaskItem): boolean {
    return false;
  }

  getTaskLockedReason(task: TaskItem): string {
    return this.isTaskLocked(task) ? 'Noch nicht bereit' : '';
  }
}

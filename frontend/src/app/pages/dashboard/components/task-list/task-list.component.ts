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

export const WATER_TASK_TITLE = 'Wasser trinken';

export function findWaterTask(tasks: TaskItem[]): TaskItem | null {
  return tasks.find((task) => task.title === WATER_TASK_TITLE) ?? null;
}

export function getVisibleQuestTasks(tasks: TaskItem[]): TaskItem[] {
  const waterTask = findWaterTask(tasks);

  return waterTask ? tasks.filter((task) => task.id !== waterTask.id) : tasks;
}

export function calculateQuestProgressPercentage(
  tasks: TaskItem[],
  progress: QualityQuestProgress | null = null
): number {
  if (progress) {
    return clampPercentage(progress.percentage);
  }

  if (tasks.length <= 0) {
    return 0;
  }

  const completedTasks = tasks.filter((task) => task.isCompleted).length;
  return clampPercentage(Math.round((completedTasks / tasks.length) * 100));
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
  readonly waterLevel = input(0);
  readonly qualityQuestProgress = input<QualityQuestProgress | null>(null);
  readonly isBusy = input(false);
  readonly taskCompleted = output<string>();
  readonly waterAdded = output<number>();

  readonly completedTasks = computed(() => this.tasks().filter((task) => task.isCompleted).length);
  readonly pendingTasks = computed(() => this.tasks().filter((task) => !task.isCompleted).length);
  readonly waterTask = computed(() => findWaterTask(this.tasks()));
  readonly visibleTasks = computed(() => getVisibleQuestTasks(this.tasks()));
  readonly questPercentage = computed(() =>
    calculateQuestProgressPercentage(this.tasks(), this.qualityQuestProgress())
  );

  finishTask(taskId: string): void {
    if (this.isBusy()) {
      return;
    }

    this.taskCompleted.emit(taskId);
  }

  addWater(amountMl: number): void {
    if (this.isBusy()) {
      return;
    }

    this.waterAdded.emit(amountMl);
  }

  isTaskLocked(_task: TaskItem): boolean {
    return false;
  }

  getTaskLockedReason(task: TaskItem): string {
    return this.isTaskLocked(task) ? 'Noch nicht bereit' : '';
  }
}

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, value));
}

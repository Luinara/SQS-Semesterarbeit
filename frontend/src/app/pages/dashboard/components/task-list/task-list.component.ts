import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TaskItem } from '../../../../shared/models/task.model';
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
  imports: [TaskCardComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListComponent {
  readonly tasks = input.required<TaskItem[]>();
  readonly availableFoodPoints = input(0);
  readonly qualityQuestProgress = input<QualityQuestProgress | null>(null);
  readonly taskCompleted = output<string>();

  readonly completedTasks = computed(() => this.tasks().filter((task) => task.isCompleted).length);
  readonly pendingTasks = computed(() => this.tasks().filter((task) => !task.isCompleted).length);
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

  isTaskLocked(_task: TaskItem): boolean {
    return false;
  }

  getTaskLockedReason(task: TaskItem): string {
    return this.isTaskLocked(task) ? 'Noch nicht bereit' : '';
  }
}

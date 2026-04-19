import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TaskItem } from '../../../../shared/models/task.model';
import { TaskCardComponent } from '../task-card/task-card.component';

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
  readonly taskCompleted = output<string>();

  readonly completedTasks = computed(() => this.tasks().filter((task) => task.isCompleted).length);
  readonly pendingTasks = computed(() => this.tasks().filter((task) => !task.isCompleted).length);

  finishTask(taskId: string): void {
    this.taskCompleted.emit(taskId);
  }
}

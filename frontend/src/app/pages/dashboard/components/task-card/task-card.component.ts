import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TaskItem } from '../../../../shared/models/task.model';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';

@Component({
  selector: 'sqs-task-card',
  standalone: true,
  imports: [UiButtonComponent],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
  readonly task = input.required<TaskItem>();
  readonly completeRequested = output<string>();

  markTaskAsCompleted(): void {
    this.completeRequested.emit(this.task().id);
  }
}

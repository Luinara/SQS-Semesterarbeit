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
  readonly isLocked = input(false);
  readonly lockedReason = input('');
  readonly isBusy = input(false);
  readonly completeRequested = output<string>();

  markTaskAsCompleted(): void {
    if (this.isBusy() || this.isLocked() || this.task().isCompleted) {
      return;
    }

    this.completeRequested.emit(this.task().id);
  }
}

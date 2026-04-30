import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';

@Component({
  selector: 'sqs-top-bar',
  standalone: true,
  imports: [UiButtonComponent],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  readonly userName = input.required<string>();
  readonly availableFoodPoints = input(0);
  readonly completedTasks = input(0);
  readonly totalTasks = input(0);

  readonly resetRequested = output<void>();
  readonly logoutRequested = output<void>();

  readonly userInitial = computed(() => this.userName().trim().charAt(0).toUpperCase() || 'S');

  requestReset(): void {
    this.resetRequested.emit();
  }

  requestLogout(): void {
    this.logoutRequested.emit();
  }
}

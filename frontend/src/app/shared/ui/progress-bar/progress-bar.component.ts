import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'sqs-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  readonly label = input.required<string>();
  readonly hint = input<string>('');
  readonly value = input(0);
  readonly max = input(100);

  readonly percentage = computed(() => {
    const max = this.max();

    if (max <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(100, (this.value() / max) * 100));
  });
}

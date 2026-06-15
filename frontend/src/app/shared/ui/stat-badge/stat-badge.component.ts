import { ChangeDetectionStrategy, Component, input } from '@angular/core';

type StatTone = 'blue' | 'green' | 'amber' | 'rose' | 'slate';
type StatIcon = 'points' | 'hearts' | 'berries' | 'tasks' | 'pokemon';

@Component({
  selector: 'sqs-stat-badge',
  standalone: true,
  templateUrl: './stat-badge.component.html',
  styleUrl: './stat-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatBadgeComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input<StatIcon>('points');
  readonly tone = input<StatTone>('blue');
}

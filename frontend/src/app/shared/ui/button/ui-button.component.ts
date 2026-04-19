import { ChangeDetectionStrategy, Component, input } from '@angular/core';

type UiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'soft';
type UiButtonSize = 'sm' | 'md';
type UiButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'sqs-button',
  standalone: true,
  templateUrl: './ui-button.component.html',
  styleUrl: './ui-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiButtonComponent {
  readonly variant = input<UiButtonVariant>('primary');
  readonly size = input<UiButtonSize>('md');
  readonly type = input<UiButtonType>('button');
  readonly disabled = input(false);
  readonly fullWidth = input(false);
}

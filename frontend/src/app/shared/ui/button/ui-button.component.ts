import { ChangeDetectionStrategy, Component, input } from '@angular/core';

type UiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'soft';
type UiButtonSize = 'sm' | 'md';
type UiButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'button[sqsButton]',
  standalone: true,
  templateUrl: './ui-button.component.html',
  styleUrl: './ui-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ui-button',
    '[attr.type]': 'type()',
    '[disabled]': 'disabled()',
    '[class.ui-button--secondary]': "variant() === 'secondary'",
    '[class.ui-button--ghost]': "variant() === 'ghost'",
    '[class.ui-button--soft]': "variant() === 'soft'",
    '[class.ui-button--small]': "size() === 'sm'",
    '[class.ui-button--full-width]': 'fullWidth()',
  },
})
export class UiButtonComponent {
  readonly variant = input<UiButtonVariant>('primary');
  readonly size = input<UiButtonSize>('md');
  readonly type = input<UiButtonType>('button');
  readonly disabled = input(false);
  readonly fullWidth = input(false);
}

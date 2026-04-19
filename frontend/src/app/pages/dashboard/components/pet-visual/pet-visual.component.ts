import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'sqs-pet-visual',
  standalone: true,
  templateUrl: './pet-visual.component.html',
  styleUrl: './pet-visual.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetVisualComponent {
  readonly petName = input.required<string>();
  readonly level = input.required<number>();
}

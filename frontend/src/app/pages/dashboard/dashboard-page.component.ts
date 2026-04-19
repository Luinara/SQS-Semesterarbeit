import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from '../../core/services/app-state.service';
import { PetCardComponent } from './components/pet-card/pet-card.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';

@Component({
  selector: 'sqs-dashboard-page',
  standalone: true,
  imports: [TopBarComponent, TaskListComponent, PetCardComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly router = inject(Router);
  readonly appState = inject(AppStateService);

  completeTask(taskId: string): void {
    this.appState.completeTask(taskId);
  }

  feedPet(): void {
    this.appState.feedPet();
  }

  resetDemoData(): void {
    this.appState.resetCurrentProgress();
  }

  async logout(): Promise<void> {
    this.appState.logout();
    await this.router.navigateByUrl('/auth');
  }
}

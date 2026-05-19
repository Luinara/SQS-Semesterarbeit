import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from '../../core/services/app-state.service';
import { WeatherService } from '../../core/services/weather.service';
import { HydrationCardComponent } from './components/hydration-card/hydration-card.component';
import { PetCardComponent } from './components/pet-card/pet-card.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';

@Component({
  selector: 'sqs-dashboard-page',
  standalone: true,
  imports: [TopBarComponent, TaskListComponent, PetCardComponent, HydrationCardComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly router = inject(Router);
  readonly appState = inject(AppStateService);
  readonly weather = inject(WeatherService);

  completeTask(taskId: string): void {
    this.appState.completeTask(taskId);
  }

  feedPet(): void {
    this.appState.feedPet();
  }

  addHydration(amountMl: number): void {
    this.appState.addHydration(amountMl);
  }

  refreshWeather(): void {
    void this.weather.refresh();
  }

  searchWeatherCity(cityName: string): void {
    void this.weather.searchCity(cityName);
  }

  resetDemoData(): void {
    this.appState.resetCurrentProgress();
  }

  async logout(): Promise<void> {
    this.appState.logout();
    await this.router.navigateByUrl('/auth');
  }
}

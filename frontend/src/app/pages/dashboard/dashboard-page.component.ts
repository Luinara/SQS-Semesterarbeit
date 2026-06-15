import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from '../../core/services/app-state.service';
import { PokemonService } from '../../core/services/pokemon.service';
import { WeatherService } from '../../core/services/weather.service';
import { PetCardComponent } from './components/pet-card/pet-card.component';
import { QualityGateCardComponent } from './components/quality-gate-card/quality-gate-card.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';

@Component({
  selector: 'sqs-dashboard-page',
  standalone: true,
  imports: [TopBarComponent, TaskListComponent, PetCardComponent, QualityGateCardComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly router = inject(Router);
  readonly appState = inject(AppStateService);
  readonly weather = inject(WeatherService);
  readonly pokemon = inject(PokemonService);

  constructor() {
    effect(() => {
      const level = this.appState.pet()?.level ?? 1;
      void this.pokemon.loadForLevel(level);
    });
  }

  completeTask(taskId: string): void {
    this.appState.completeTask(taskId);
  }

  feedPet(): void {
    this.appState.feedPet();
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

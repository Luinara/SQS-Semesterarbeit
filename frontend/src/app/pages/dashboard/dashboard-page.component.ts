import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from '../../core/services/app-state.service';
import { PokemonService } from '../../core/services/pokemon.service';
import { WeatherService } from '../../core/services/weather.service';
import { DEMO_ACCOUNT } from '../../shared/mock/mock-data';
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
  readonly demoAccount = DEMO_ACCOUNT;

  constructor() {
    effect(() => {
      const pet = this.appState.pet();

      if (!pet) {
        return;
      }

      if (pet.isEgg) {
        return;
      }

      void this.pokemon.loadSpecies(pet.pokemonSpecies);
    });
  }

  completeTask(taskId: string): void {
    void this.appState.completeTask(taskId);
  }

  feedPet(): void {
    void this.appState.feedPet();
  }

  testLevelUpPet(): void {
    void this.appState.testLevelUp();
  }

  addWater(amountMl: number): void {
    void this.appState.addWater(amountMl);
  }

  refreshWeather(): void {
    void this.weather.refresh();
  }

  searchWeatherCity(cityName: string): void {
    void this.weather.searchCity(cityName);
  }

  resetDemoData(): void {
    void this.appState.resetCurrentProgress();
  }

  async logout(): Promise<void> {
    await this.appState.logout();
    await this.router.navigateByUrl('/auth');
  }

  async deleteAccount(): Promise<void> {
    const confirmed = globalThis.confirm(
      'Profil wirklich löschen? Dein Spielstand und alle Quest-Fortschritte werden dauerhaft entfernt.'
    );

    if (!confirmed) {
      return;
    }

    const result = await this.appState.deleteAccount();

    if (!result.success) {
      globalThis.alert(result.message);
      return;
    }

    await this.router.navigateByUrl('/auth');
  }
}

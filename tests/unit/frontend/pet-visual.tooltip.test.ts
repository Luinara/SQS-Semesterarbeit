import "@angular/compiler";
import {
  createEnvironmentInjector,
  EnvironmentInjector,
  runInInjectionContext,
} from "@angular/core";
import {
  CARE_TOOLTIP_HIDE_DELAY_MS,
  PetVisualComponent,
} from "../../../frontend/src/app/pages/dashboard/components/pet-visual/pet-visual.component";

describe("pet visual care tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("blendet die Pflegepunkt-Beschreibung nach zehn Sekunden wieder aus", () => {
    const component = createComponentInInjectionContext();

    component.showCareTooltip();

    expect(component.isCareTooltipVisible()).toBe(true);

    vi.advanceTimersByTime(CARE_TOOLTIP_HIDE_DELAY_MS - 1);
    expect(component.isCareTooltipVisible()).toBe(true);

    vi.advanceTimersByTime(1);
    expect(component.isCareTooltipVisible()).toBe(false);
  });
});

function createComponentInInjectionContext(): PetVisualComponent {
  const injector = createEnvironmentInjector(
    [],
    undefined as unknown as EnvironmentInjector,
  );

  return runInInjectionContext(injector, () => new PetVisualComponent());
}

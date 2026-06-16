import "@angular/compiler";
import {
  createEnvironmentInjector,
  runInInjectionContext,
} from "@angular/core";
import { Router, UrlTree } from "@angular/router";
import { authGuard } from "../../../frontend/src/app/core/guards/auth.guard";
import { guestGuard } from "../../../frontend/src/app/core/guards/guest.guard";
import { AppStateService } from "../../../frontend/src/app/core/services/app-state.service";

describe("route guards", () => {
  it("authGuard erlaubt bereits angemeldete Nutzer", async () => {
    const context = configureGuardTest({ authenticated: true });

    await expect(runGuard(authGuard, context)).resolves.toBe(true);
    expect(context.router.createUrlTree).not.toHaveBeenCalled();
  });

  it("authGuard restauriert eine vorhandene Session", async () => {
    const context = configureGuardTest({
      authenticated: false,
      restored: true,
    });

    await expect(runGuard(authGuard, context)).resolves.toBe(true);
    expect(context.appState.restoreSession).toHaveBeenCalledOnce();
    expect(context.router.createUrlTree).not.toHaveBeenCalled();
  });

  it("authGuard leitet ohne Session zur Anmeldung", async () => {
    const context = configureGuardTest({
      authenticated: false,
      restored: false,
    });

    await expect(runGuard(authGuard, context)).resolves.toBe(context.urlTree);
    expect(context.router.createUrlTree).toHaveBeenCalledWith(["/auth"]);
  });

  it("guestGuard leitet angemeldete Nutzer zum Dashboard", async () => {
    const context = configureGuardTest({
      authenticated: true,
    });

    await expect(runGuard(guestGuard, context)).resolves.toBe(context.urlTree);
    expect(context.appState.restoreSession).not.toHaveBeenCalled();
    expect(context.router.createUrlTree).toHaveBeenCalledWith(["/dashboard"]);
  });

  it("guestGuard erlaubt Gäste ohne wiederherstellbare Session", async () => {
    const context = configureGuardTest({
      authenticated: false,
      restored: false,
    });

    await expect(runGuard(guestGuard, context)).resolves.toBe(true);
    expect(context.appState.restoreSession).toHaveBeenCalledOnce();
    expect(context.router.createUrlTree).not.toHaveBeenCalled();
  });
});

interface GuardTestContext {
  appState: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    restoreSession: ReturnType<typeof vi.fn>;
  };
  router: {
    createUrlTree: ReturnType<typeof vi.fn>;
  };
  urlTree: UrlTree;
}

function configureGuardTest(options: {
  authenticated: boolean;
  restored?: boolean;
}): GuardTestContext {
  const urlTree = {} as UrlTree;
  const appState = {
    isAuthenticated: vi.fn(() => options.authenticated),
    restoreSession: vi.fn(async () => options.restored ?? false),
  };
  const router = {
    createUrlTree: vi.fn(() => urlTree),
  };

  return { appState, router, urlTree };
}

function runGuard(
  guard: typeof authGuard | typeof guestGuard,
  context: GuardTestContext,
) {
  const injector = createEnvironmentInjector(
    [
      { provide: AppStateService, useValue: context.appState },
      { provide: Router, useValue: context.router },
    ],
    undefined,
  );

  return runInInjectionContext(injector, () => guard());
}

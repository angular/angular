/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DestroyRef,
  ENVIRONMENT_INITIALIZER,
  EnvironmentInjector,
  Injectable,
  Injector,
  Provider,
  ProviderToken,
  Type,
  createEnvironmentInjector,
  inject,
} from '@angular/core';

/**
 * inject a service asynchronously
 *
 * @param: injector. If the injector is a NodeInjector the loaded module will be destroyed alonside its injector
 */
export async function injectAsync<T>(
  injector: Injector,
  providerLoader: () => Promise<ProviderToken<T>>,
): Promise<T> {
  const injectImpl = injector.get(InjectAsyncImpl);
  return injectImpl.get(injector, providerLoader);
}

@Injectable({providedIn: 'root'})
class InjectAsyncImpl<T> {
  private overrides = new WeakMap(); // no need to cleanup
  override<T>(type: Type<T>, mock: Type<unknown>) {
    this.overrides.set(type, mock);
  }

  async get(injector: Injector, providerLoader: () => Promise<ProviderToken<T>>): Promise<T> {
    const type = await providerLoader();

    // Check if we have overrides, O(1), low overhead
    if (this.overrides.has(type)) {
      const override = this.overrides.get(type);
      return new override();
    }

    if (!(injector instanceof EnvironmentInjector)) {
      // this is the DestroyRef of the component
      const destroyRef = injector.get(DestroyRef);

      // This is the parent injector of the injector we're creating
      const environmentInjector = injector.get(EnvironmentInjector);

      // Creating an environment injector to destroy it afterwards
      const newInjector = createEnvironmentInjector([type as Provider], environmentInjector);

      // Destroy the injector to trigger DestroyRef.onDestroy on our service
      destroyRef.onDestroy(() => {
        newInjector.destroy();
      });

      // We want to create the new instance of our service with our new injector
      injector = newInjector;
    }

    return injector.get(type)!;
  }
}

/**
 * Helper function to mock the lazy loaded module in `injectAsync`
 *
 * @usage
 * TestBed.configureTestingModule({
 *     providers: [
 *     mockAsyncProvider(SandboxService, fakeSandboxService)
 *   ]
 * });
 */
export function mockAsyncProvider<T>(type: Type<T>, mock: Type<unknown>) {
  return [
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        inject(InjectAsyncImpl).override(type, mock);
      },
    },
  ];
}

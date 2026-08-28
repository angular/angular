/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

@Injectable({providedIn: 'root'})
class FooService {
  foo = 0;
}

class MyMockedFooService implements FooService {
  foo = 42;
}

import {
  Component,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  onIdle,
  onTimer,
  onHover,
  onInteraction,
  ProviderToken,
  runInInjectionContext,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {IDLE_SERVICE, IdleService} from '../../../src/defer/idle_service';
import {injectAsync} from '../../../src/di/inject_async';
import DefaultExportedFooService from './test_service';

describe('injectAsync', () => {
  it('should inject asynchronously', async () => {
    await TestBed.runInInjectionContext(async () => {
      const foo = await injectAsync(() => Promise.resolve(FooService))();
      expect(foo).toBeInstanceOf(FooService);
    });
  });

  it('should inject asynchronously a mock', async () => {
    TestBed.configureTestingModule({
      providers: [{provide: FooService, useClass: MyMockedFooService}],
    });
    await TestBed.runInInjectionContext(async () => {
      const foo = await injectAsync(() => Promise.resolve(FooService))();

      expect(foo).toBeInstanceOf(MyMockedFooService);
    });
  });

  it('should inject asynchronously from a default import shape', async () => {
    await TestBed.runInInjectionContext(async () => {
      const foo = await injectAsync(() => import('./test_service'))();
      expect(foo).toBeInstanceOf(DefaultExportedFooService);
    });
  });

  it('should inject asynchronously with custom prefetch', async () => {
    TestBed.configureTestingModule({
      providers: [{provide: FooService, useClass: MyMockedFooService}],
    });

    await TestBed.runInInjectionContext(async () => {
      let prefetchResolve!: () => void;
      const prefetchPromise = new Promise<void>((resolve) => {
        prefetchResolve = resolve;
      });

      let prefetchCalled = false;
      const loader = () => {
        prefetchCalled = true;
        return Promise.resolve(FooService);
      };

      const fooPromise = injectAsync(loader, {
        prefetch: () => prefetchPromise,
      });

      // Loader must NOT have been called yet — trigger hasn't fired
      expect(prefetchCalled).toBe(false);

      // Fire the trigger
      prefetchResolve();
      await Promise.resolve();

      // The Promise hasn't been yet but the prefetch has fired.
      expect(prefetchCalled).toBe(true);

      const foo = await fooPromise();
      expect(foo).toBeInstanceOf(MyMockedFooService);
    });
  });

  it('Async injected service should have access to symbols available higher up in the DI tree', async () => {
    const TOKEN = new InjectionToken<string>('TOKEN');

    @Injectable({providedIn: 'root'})
    class ServiceThatNeedsToken {
      value = inject(TOKEN);
    }

    TestBed.configureTestingModule({
      providers: [{provide: TOKEN, useValue: 'hello from parent'}],
    });

    await TestBed.runInInjectionContext(async () => {
      const service = injectAsync(() => Promise.resolve(ServiceThatNeedsToken));

      expect((await service()).value).toBe('hello from parent');
    });
  });

  it('should not destroy the service if the component is destroyed (because its owned by the root injector', async () => {
    let destroyed = false;

    // providedIn: 'root' — owned by the root injector, not the component
    @Injectable({providedIn: 'root'})
    class RootService {
      ngOnDestroy() {
        destroyed = true;
      }
    }

    @Component({template: ''})
    class TestComponent {
      service = injectAsync(() => Promise.resolve(RootService))();
    }

    TestBed.configureTestingModule({imports: [TestComponent]});

    await TestBed.runInInjectionContext(async () => {
      const fixture = TestBed.createComponent(TestComponent);
      await fixture.whenStable();

      expect(await fixture.componentInstance.service).toBeInstanceOf(RootService);
      expect(destroyed).toBe(false);

      fixture.destroy();

      // Root-owned service must NOT be destroyed when the component is destroyed
      expect(destroyed).toBe(false);
    });
  });

  it("should throw if the service wasn't provided in root", async () => {
    class UnprovidedService {}

    await TestBed.runInInjectionContext(async () => {
      let error!: Error;
      try {
        await injectAsync(() => Promise.resolve(UnprovidedService))();
      } catch (e: any) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.message).toContain('No provider found for `UnprovidedService`');
    });
  });

  it('should load after prefetch timeout fires', async () => {
    jasmine.clock().install();
    jasmine.clock().autoTick();

    let prefetchCalled = false;
    const loader = () => {
      prefetchCalled = true;
      return Promise.resolve(FooService);
    };

    const prefetchTrigger = (timeout: number) =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, timeout);
      });

    await TestBed.runInInjectionContext(async () => {
      const fooPromise = injectAsync(loader, {prefetch: () => prefetchTrigger(100)});

      jasmine.clock().tick(50);
      await Promise.resolve(); // wait for the loader promise to resolve (if it was called)
      expect(prefetchCalled).toBe(false);

      jasmine.clock().tick(100);
      await Promise.resolve(); // wait for the loader promise to resolve
      expect(prefetchCalled).toBe(true);

      return fooPromise().then((foo) => {
        expect(foo).toBeInstanceOf(FooService);
      });
    });

    jasmine.clock().uninstall();
  });

  it('should report failure correctly (eg on Injector destroyed)', async () => {
    const myInjector = Injector.create({parent: TestBed.inject(Injector), providers: []});

    await runInInjectionContext(myInjector, async () => {
      const fooPromise = injectAsync(() => Promise.resolve(FooService));

      myInjector.destroy();

      let error!: Error;
      try {
        await fooPromise();
      } catch (e: any) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.message).toContain('Injector has already been destroyed.');
    });
  });

  it('should not wait for the prefetch to complete if the service is requested before that', async () => {
    let prefetchCalled = false;
    const loader = () =>
      new Promise<ProviderToken<FooService>>((resolve) => {
        prefetchCalled = true;
        resolve(FooService);
      });

    const prefetchTrigger = () =>
      new Promise<void>((resolve) => {
        // never resolve, to simulate a long-running prefetch
      });

    await TestBed.runInInjectionContext(async () => {
      const fooPromise = injectAsync(loader, {prefetch: prefetchTrigger});

      // Request the service before the prefetch trigger fires
      const foo = await fooPromise();

      expect(prefetchCalled).toBe(true);
      expect(foo).toBeInstanceOf(FooService);
    });
  });

  it('should not cause an unhandled promise rejection if prefetch trigger rejects', async () => {
    await TestBed.runInInjectionContext(async () => {
      const fooPromise = injectAsync(() => Promise.resolve(FooService), {
        prefetch: () => Promise.reject(new Error('prefetch error')),
      });

      await Promise.resolve();

      const foo = await fooPromise();
      expect(foo).toBeInstanceOf(FooService);
    });
  });

  it('should not cause an unhandled promise rejection if loader rejects during prefetch', async () => {
    await TestBed.runInInjectionContext(async () => {
      const fooPromise = injectAsync(() => Promise.reject(new Error('loader error')), {
        prefetch: () => Promise.resolve(),
      });

      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      let error!: Error;
      try {
        await fooPromise();
      } catch (e: any) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.message).toBe('loader error');
    });
  });

  describe('built-in prefetch triggers', () => {
    describe('onIdle', () => {
      it('should inject asynchronously with onIdle trigger', async () => {
        await TestBed.runInInjectionContext(async () => {
          const fooPromise = injectAsync(() => Promise.resolve(FooService), {prefetch: onIdle});

          const foo = await fooPromise();
          expect(foo).toBeInstanceOf(FooService);
        });
      });

      it('should fire on onIdle timeout', async () => {
        jasmine.clock().install();
        jasmine.clock().autoTick();

        const idleService: IdleService = {
          requestOnIdle(
            callback: (deadline?: IdleDeadline) => void,
            options?: IdleRequestOptions,
          ): number {
            // Do not run idle callbacks eagerly in tests; only honor explicit timeout path.
            if (options?.timeout == null) {
              return -1;
            }

            return setTimeout(callback, options.timeout) as unknown as number;
          },
          cancelOnIdle(id: number): void {
            if (id !== -1) {
              clearTimeout(id);
            }
          },
        };

        TestBed.configureTestingModule({
          providers: [{provide: IDLE_SERVICE, useValue: idleService}],
        });

        let loaderCalled = false;
        const loader = () =>
          new Promise<ProviderToken<FooService>>((resolve) => {
            loaderCalled = true;
            resolve(FooService);
          });

        await TestBed.runInInjectionContext(async () => {
          const fooPromise = injectAsync(loader, {prefetch: () => onIdle({timeout: 500})});

          jasmine.clock().tick(300);
          await Promise.resolve(); // wait for the loader promise to resolve
          expect(loaderCalled).toBe(false);

          // Simulate the passage of time until the onIdle timeout fires
          jasmine.clock().tick(600);
          await Promise.resolve(); // wait for the loader promise to resolve

          expect(loaderCalled).toBe(true);

          const foo = await fooPromise();
          expect(foo).toBeInstanceOf(FooService);
        });

        jasmine.clock().uninstall();
      });
    });

    describe('onTimer', () => {
      it('should trigger prefetching after specified delay', async () => {
        jasmine.clock().install();
        jasmine.clock().autoTick();

        let loaderCalled = false;
        const loader = () => {
          loaderCalled = true;
          return Promise.resolve(FooService);
        };

        await TestBed.runInInjectionContext(async () => {
          const fooPromise = injectAsync(loader, {prefetch: () => onTimer(200)});

          jasmine.clock().tick(100);
          await Promise.resolve();
          expect(loaderCalled).toBe(false);

          jasmine.clock().tick(150);
          await Promise.resolve();
          expect(loaderCalled).toBe(true);

          const foo = await fooPromise();
          expect(foo).toBeInstanceOf(FooService);
        });

        jasmine.clock().uninstall();
      });
    });

    describe('onHover', () => {
      it('should trigger prefetching on pointerenter event', async () => {
        const button = document.createElement('button');
        let loaderCalled = false;
        const loader = () => {
          loaderCalled = true;
          return Promise.resolve(FooService);
        };

        await TestBed.runInInjectionContext(async () => {
          const fooPromise = injectAsync(loader, {prefetch: () => onHover(button)});

          expect(loaderCalled).toBe(false);

          button.dispatchEvent(new Event('pointerenter'));
          await Promise.resolve();

          expect(loaderCalled).toBe(true);
          const foo = await fooPromise();
          expect(foo).toBeInstanceOf(FooService);
        });
      });

      it('should unsubscribe event listener after triggering', async () => {
        const button = document.createElement('button');
        let loaderCallCount = 0;

        await TestBed.runInInjectionContext(async () => {
          injectAsync(
            () => {
              loaderCallCount++;
              return Promise.resolve(FooService);
            },
            {prefetch: () => onHover(button)},
          );

          // Fire first hover to trigger prefetch
          button.dispatchEvent(new Event('pointerenter'));
          await Promise.resolve();

          expect(loaderCallCount).toBe(1);

          // Fire subsequent hovers - listener must be detached
          button.dispatchEvent(new Event('pointerenter'));
          button.dispatchEvent(new Event('pointerenter'));
          await Promise.resolve();

          // Loader should still only have been called once
          expect(loaderCallCount).toBe(1);
        });
      });
    });

    describe('onInteraction', () => {
      it('should trigger prefetching on pointerenter', async () => {
        const button = document.createElement('button');
        let loaderCalled = false;

        await TestBed.runInInjectionContext(async () => {
          const fooPromise = injectAsync(
            () => {
              loaderCalled = true;
              return Promise.resolve(FooService);
            },
            {prefetch: () => onInteraction(button)},
          );

          button.dispatchEvent(new Event('pointerenter'));
          await Promise.resolve();

          expect(loaderCalled).toBe(true);
          expect(await fooPromise()).toBeInstanceOf(FooService);
        });
      });

      it('should trigger prefetching on focus', async () => {
        const button = document.createElement('button');
        let loaderCalled = false;

        await TestBed.runInInjectionContext(async () => {
          const fooPromise = injectAsync(
            () => {
              loaderCalled = true;
              return Promise.resolve(FooService);
            },
            {prefetch: () => onInteraction(button)},
          );

          button.dispatchEvent(new Event('focus'));
          await Promise.resolve();

          expect(loaderCalled).toBe(true);
          expect(await fooPromise()).toBeInstanceOf(FooService);
        });
      });

      it('should trigger prefetching on click', async () => {
        const button = document.createElement('button');
        let loaderCalled = false;

        await TestBed.runInInjectionContext(async () => {
          const fooPromise = injectAsync(
            () => {
              loaderCalled = true;
              return Promise.resolve(FooService);
            },
            {prefetch: () => onInteraction(button)},
          );

          button.dispatchEvent(new Event('click'));
          await Promise.resolve();

          expect(loaderCalled).toBe(true);
          expect(await fooPromise()).toBeInstanceOf(FooService);
        });
      });

      it('should clean up all listeners once any single event triggers', async () => {
        const button = document.createElement('button');
        let loaderCallCount = 0;

        await TestBed.runInInjectionContext(async () => {
          injectAsync(
            () => {
              loaderCallCount++;
              return Promise.resolve(FooService);
            },
            {prefetch: () => onInteraction(button)},
          );

          // Fire 'focus' to trigger the prefetch and abort remaining listeners
          button.dispatchEvent(new Event('focus'));
          await Promise.resolve();

          expect(loaderCallCount).toBe(1);

          // Fire more events - they should be detached and ignored
          button.dispatchEvent(new Event('pointerenter'));
          button.dispatchEvent(new Event('click'));
          await Promise.resolve();

          // Loader should still have only been executed once
          expect(loaderCallCount).toBe(1);
        });
      });
    });
  });
});

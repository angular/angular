/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule, ɵPLATFORM_BROWSER_ID as PLATFORM_BROWSER_ID} from '@angular/common';
import {
  ApplicationRef,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  createComponent,
  Directive,
  EnvironmentInjector,
  ErrorHandler,
  inject,
  Injectable,
  InjectionToken,
  Input,
  NgModule,
  NgZone,
  Pipe,
  PipeTransform,
  PLATFORM_ID,
  QueryList,
  Type,
  ViewChildren,
  ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR,
  ɵRuntimeError as RuntimeError,
  Injector,
  ElementRef,
  ViewChild,
} from '../../src/core';
import {getComponentDef} from '../../src/render3/def_getters';
import {ComponentFixture, DeferBlockBehavior, fakeAsync, flush, TestBed, tick} from '../../testing';
import {getInjectorResolutionPath} from '../../src/render3/util/injector_discovery_utils';
import {ActivatedRoute, provideRouter, Router, RouterOutlet} from '@angular/router';
import {ChainedInjector} from '../../src/render3/chained_injector';
import {global} from '../../src/util/global';
import {TimerScheduler} from '../../src/defer/timer_scheduler';
import {Console} from '../../src/console';
import {formatRuntimeErrorCode, RuntimeErrorCode} from '../../src/errors';
import {isBrowser} from '@angular/private/testing';

/**
 * Clears all associated directive defs from a given component class.
 *
 * This is a *hack* for TestBed, which compiles components in JIT mode
 * and can not remove dependencies and their imports in the same way as AOT.
 * From JIT perspective, all dependencies inside a defer block remain eager.
 * We need to clear this association to run tests that verify loading and
 * prefetching behavior.
 */
function clearDirectiveDefs(type: Type<unknown>): void {
  const cmpDef = getComponentDef(type);
  cmpDef!.dependencies = [];
  cmpDef!.directiveDefs = null;
}

/**
 * Emulates a dynamic import promise.
 *
 * Note: `setTimeout` is used to make `fixture.whenStable()` function
 * wait for promise resolution, since `whenStable()` relies on the state
 * of a macrotask queue.
 */
function dynamicImportOf<T>(type: T, timeout = 0): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(type), timeout);
  });
}

/**
 * Emulates a failed dynamic import promise.
 */
function failedDynamicImport(): Promise<void> {
  return new Promise((_, reject) => {
    setTimeout(() => reject());
  });
}

/**
 * Helper function to await all pending dynamic imports
 * emulated using `dynamicImportOf` function.
 */
function allPendingDynamicImports() {
  return dynamicImportOf(null, 10);
}

/**
 * Allows to verify behavior of defer blocks by providing a set of
 * [time, expected output] pairs. Also allows to provide a function
 * instead of an expected output string, in which case the function
 * is invoked at a specified time.
 */
async function verifyTimeline(
  fixture: ComponentFixture<unknown>,
  ...slots: Array<[time: number, expected: string | VoidFunction]>
) {
  for (let i = 0; i < slots.length; i++) {
    const timeToWait = i === 0 ? slots[0][0] : slots[i][0] - slots[i - 1][0];
    const slotValue = slots[i][1];
    // This is an action, just invoke a function.
    if (typeof slotValue === 'function') {
      slotValue();
    }
    tick(timeToWait);
    fixture.detectChanges();
    if (typeof slotValue === 'string') {
      const actual = fixture.nativeElement.textContent.trim();
      expect(actual).withContext(`${slots[i][0]}ms`).toBe(slotValue);
    }
  }
}

class FakeTimerScheduler {
  cbs: VoidFunction[] = [];
  add(delay: number, callback: VoidFunction) {
    this.cbs.push(callback);
  }
  remove(callback: VoidFunction) {
    /* noop */
  }

  invoke() {
    for (const cb of this.cbs) {
      cb();
    }
  }
}

@Injectable()
export class DebugConsole extends Console {
  logs: string[] = [];
  override log(message: string) {
    this.logs.push(message);
  }
  override warn(message: string) {
    this.logs.push(message);
  }
}

/**
 * Provides a debug console instance that allows to capture all
 * produces messages for testing purposes.
 */
export function withDebugConsole() {
  return [{provide: Console, useClass: DebugConsole}];
}

/**
 * Given a template, creates a component fixture and returns
 * a set of helper functions to trigger rendering of prefetching
 * of a defer block.
 */
function createFixture(template: string) {
  @Component({
    selector: 'nested-cmp',
    standalone: true,
    template: '{{ block }}',
  })
  class NestedCmp {
    @Input() block!: string;
  }

  @Component({
    standalone: true,
    selector: 'simple-app',
    imports: [NestedCmp],
    template,
  })
  class MyCmp {
    trigger = false;
    prefetchTrigger = false;
  }

  let loadingTimeout = 0;
  const deferDepsInterceptor = {
    intercept() {
      return () => {
        return [dynamicImportOf(NestedCmp, loadingTimeout)];
      };
    },
  };

  TestBed.configureTestingModule({
    providers: [
      ...COMMON_PROVIDERS,
      {provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor},
    ],
  });

  clearDirectiveDefs(MyCmp);

  const fixture = TestBed.createComponent(MyCmp);
  fixture.detectChanges();

  const trigger = (loadingResourcesTime: number) => () => {
    loadingTimeout = loadingResourcesTime;
    fixture.componentInstance.trigger = true;
    fixture.detectChanges();
  };

  const triggerPrefetch = (loadingResourcesTime: number) => () => {
    loadingTimeout = loadingResourcesTime;
    fixture.componentInstance.prefetchTrigger = true;
    fixture.detectChanges();
  };

  return {trigger, triggerPrefetch, fixture};
}

// Set `PLATFORM_ID` to a browser platform value to trigger defer loading
// while running tests in Node.
const COMMON_PROVIDERS = [{provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID}];

describe('@defer', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({providers: COMMON_PROVIDERS});
  });

  it('should transition between placeholder, loading and loaded states', async () => {
    @Component({
      selector: 'my-lazy-cmp',
      standalone: true,
      template: 'Hi!',
    })
    class MyLazyCmp {}

    @Component({
      standalone: true,
      selector: 'simple-app',
      imports: [MyLazyCmp],
      template: `
        @defer (when isVisible) {
          <my-lazy-cmp />
        } @loading {
          Loading...
        } @placeholder {
          Placeholder!
        } @error {
          Failed to load dependencies :(
        }
      `,
    })
    class MyCmp {
      isVisible = false;
    }

    const fixture = TestBed.createComponent(MyCmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.outerHTML).toContain('Placeholder');

    fixture.componentInstance.isVisible = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.outerHTML).toContain('Loading');

    // Wait for dependencies to load.
    await allPendingDynamicImports();
    fixture.detectChanges();

    expect(fixture.nativeElement.outerHTML).toContain('<my-lazy-cmp>Hi!</my-lazy-cmp>');
  });

  it('should work when only main block is present', async () => {
    @Component({
      selector: 'my-lazy-cmp',
      standalone: true,
      template: 'Hi!',
    })
    class MyLazyCmp {}

    @Component({
      standalone: true,
      selector: 'simple-app',
      imports: [MyLazyCmp],
      template: `
        <p>Text outside of a defer block</p>
        @defer (when isVisible) {
          <my-lazy-cmp />
        }
      `,
    })
    class MyCmp {
      isVisible = false;
    }

    const fixture = TestBed.createComponent(MyCmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.outerHTML).toContain('Text outside of a defer block');

    fixture.componentInstance.isVisible = true;
    fixture.detectChanges();

    // Wait for dependencies to load.
    await allPendingDynamicImports();
    fixture.detectChanges();

    expect(fixture.nativeElement.outerHTML).toContain('<my-lazy-cmp>Hi!</my-lazy-cmp>');
  });

  it('should be able to use pipes injecting ChangeDetectorRef in defer blocks', async () => {
    @Pipe({name: 'test', standalone: true})
    class TestPipe implements PipeTransform {
      changeDetectorRef = inject(ChangeDetectorRef);

      transform(value: any) {
        return value;
      }
    }

    @Component({
      standalone: true,
      imports: [TestPipe],
      template: `@defer (when isVisible | test; prefetch when isVisible | test) {Hello}`,
    })
    class MyCmp {
      isVisible = false;
    }

    const fixture = TestBed.createComponent(MyCmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('');

    fixture.componentInstance.isVisible = true;
    fixture.detectChanges();
    await allPendingDynamicImports();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('Hello');
  });

  it('should preserve execution order of dependencies', async () => {
    // Important note: the framework does *NOT* guarantee an exact order
    // in which directives are instantiated. Directives should not depend
    // on the order in which other directives are invoked. This test just
    // verifies that the order does not change when a particular part of
    // code is wrapped using the `@defer` block.
    const logs: string[] = [];
    @Directive({
      standalone: true,
      selector: '[dirA]',
    })
    class DirA {
      constructor(@Attribute('mode') mode: string) {
        logs.push(`DirA.${mode}`);
      }
    }

    @Directive({
      standalone: true,
      selector: '[dirB]',
    })
    class DirB {
      constructor(@Attribute('mode') mode: string) {
        logs.push(`DirB.${mode}`);
      }
    }

    @Directive({
      standalone: true,
      selector: '[dirC]',
    })
    class DirC {
      constructor(@Attribute('mode') mode: string) {
        logs.push(`DirC.${mode}`);
      }
    }

    @Component({
      standalone: true,
      // Directive order is intentional here (different from the order
      // in which they are defined on the host element).
      imports: [DirC, DirB, DirA],
      template: `
        @defer (when isVisible) {
          <div mode="defer" dirA dirB dirC></div>
        }
        <div mode="eager" dirA dirB dirC></div>
      `,
    })
    class MyCmp {
      isVisible = true;
    }

    const fixture = TestBed.createComponent(MyCmp);
    fixture.detectChanges();
    await allPendingDynamicImports();
    fixture.detectChanges();

    const actual = {defer: [], eager: []};
    for (const log of logs) {
      const [dir, category] = log.split('.');
      (actual as {[key: string]: string[]})[category].push(dir);
    }

    // Expect that in both cases we have the same order.
    expect(actual.defer).toEqual(actual.eager);
  });

  describe('with OnPush', () => {
    it('should render when @defer is used inside of an OnPush component', async () => {
      @Component({
        selector: 'my-lazy-cmp',
        standalone: true,
        template: '{{ foo }}',
      })
      class MyLazyCmp {
        foo = 'bar';
      }

      @Component({
        standalone: true,
        selector: 'simple-app',
        imports: [MyLazyCmp],
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
          @defer (on immediate) {
            <my-lazy-cmp />
          }
        `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      // Wait for dependencies to load.
      await allPendingDynamicImports();
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('<my-lazy-cmp>bar</my-lazy-cmp>');
    });

    it('should render when @defer-loaded component uses OnPush', async () => {
      @Component({
        selector: 'my-lazy-cmp',
        standalone: true,
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: '{{ foo }}',
      })
      class MyLazyCmp {
        foo = 'bar';
      }

      @Component({
        standalone: true,
        selector: 'simple-app',
        imports: [MyLazyCmp],
        template: `
          @defer (on immediate) {
            <my-lazy-cmp />
          }
        `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      // Wait for dependencies to load.
      await allPendingDynamicImports();
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('<my-lazy-cmp>bar</my-lazy-cmp>');
    });

    it('should render when both @defer-loaded and host component use OnPush', async () => {
      @Component({
        selector: 'my-lazy-cmp',
        standalone: true,
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: '{{ foo }}',
      })
      class MyLazyCmp {
        foo = 'bar';
      }

      @Component({
        standalone: true,
        selector: 'simple-app',
        imports: [MyLazyCmp],
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
          @defer (on immediate) {
            <my-lazy-cmp />
          }
        `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      // Wait for dependencies to load.
      await allPendingDynamicImports();
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('<my-lazy-cmp>bar</my-lazy-cmp>');
    });

    it('should render when both OnPush components used in other blocks (e.g. @placeholder)', async () => {
      @Component({
        selector: 'my-lazy-cmp',
        standalone: true,
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: '{{ foo }}',
      })
      class MyLazyCmp {
        foo = 'main';
      }

      @Component({
        selector: 'another-lazy-cmp',
        standalone: true,
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: '{{ foo }}',
      })
      class AnotherLazyCmp {
        foo = 'placeholder';
      }

      @Component({
        standalone: true,
        selector: 'simple-app',
        imports: [MyLazyCmp, AnotherLazyCmp],
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
              @defer (when isVisible) {
                <my-lazy-cmp />
              } @placeholder {
                <another-lazy-cmp />
              }
            `,
      })
      class MyCmp {
        isVisible = false;
        changeDetectorRef = inject(ChangeDetectorRef);

        triggerDeferBlock() {
          this.isVisible = true;
          this.changeDetectorRef.detectChanges();
        }
      }

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      // Expect placeholder to be rendered correctly.
      expect(fixture.nativeElement.outerHTML).toContain(
        '<another-lazy-cmp>placeholder</another-lazy-cmp>',
      );

      fixture.componentInstance.triggerDeferBlock();

      // Wait for dependencies to load.
      await allPendingDynamicImports();
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('<my-lazy-cmp>main</my-lazy-cmp>');
    });
  });

  describe('with HMR', () => {
    beforeEach(() => {
      globalThis['ngHmrMode'] = true;
    });

    afterEach(() => {
      globalThis['ngHmrMode'] = undefined;
    });

    it('should produce a message into a console about eagerly loaded deps', async () => {
      @Component({
        selector: 'simple-app',
        template: `
          @defer (when true) {
            Defer block #1
          }
          @defer (on immediate) {
            Defer block #2
          }
          @defer (when true) {
            Defer block #3
          }
        `,
      })
      class MyCmp {}

      TestBed.configureTestingModule({providers: [withDebugConsole()]});
      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      // Wait for all async actions to complete.
      await allPendingDynamicImports();
      fixture.detectChanges();

      // Make sure that the HMR message is present in the console and there is
      // only a single instance of a message.
      const console = TestBed.inject(Console) as DebugConsole;
      const errorCode = formatRuntimeErrorCode(RuntimeErrorCode.DEFER_IN_HMR_MODE);
      const hmrMessages = console.logs.filter((log) => log.indexOf(errorCode) > -1);
      expect(hmrMessages.length).withContext('HMR message should be present once').toBe(1);

      const textContent = fixture.nativeElement.textContent;
      expect(textContent).toContain('Defer block #1');
      expect(textContent).toContain('Defer block #2');
      expect(textContent).toContain('Defer block #3');
    });

    it('should not produce a message about eagerly loaded deps if no defer blocks are present', () => {
      @Component({
        selector: 'simple-app',
        template: `No defer blocks`,
      })
      class MyCmp {}

      TestBed.configureTestingModule({providers: [withDebugConsole()]});
      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      // Make sure that there were no HMR messages present in the console, because
      // there were no defer blocks in a template.
      const console = TestBed.inject(Console) as DebugConsole;
      const errorCode = formatRuntimeErrorCode(RuntimeErrorCode.DEFER_IN_HMR_MODE);
      const hmrMessages = console.logs.filter((log) => log.indexOf(errorCode) > -1);
      expect(hmrMessages.length).withContext('HMR message should *not* be present').toBe(0);

      expect(fixture.nativeElement.textContent).toContain('No defer blocks');
    });
  });

  describe('`on` conditions', () => {
    it('should support `on immediate` condition', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [NestedCmp],
        template: `
          @defer (on immediate) {
            <nested-cmp [block]="'primary'" />
          } @placeholder {
            Placeholder
          } @loading {
            Loading
          }
        `,
      })
      class RootCmp {}

      let loadingFnInvokedTimes = 0;
      const deferDepsInterceptor = {
        intercept() {
          return () => {
            loadingFnInvokedTimes++;
            return [dynamicImportOf(NestedCmp)];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [
          ...COMMON_PROVIDERS,
          {provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor},
        ],
      });

      clearDirectiveDefs(RootCmp);

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      // Expecting that no placeholder content would be rendered when
      // a loading block is present.
      expect(fixture.nativeElement.outerHTML).toContain('Loading');

      // Expecting loading function to be triggered right away.
      expect(loadingFnInvokedTimes).toBe(1);

      await allPendingDynamicImports();
      fixture.detectChanges();

      // Expect that the loading resources function was not invoked again.
      expect(loadingFnInvokedTimes).toBe(1);

      // Verify primary block content.
      const primaryBlockHTML = fixture.nativeElement.outerHTML;
      expect(primaryBlockHTML).toContain(
        '<nested-cmp ng-reflect-block="primary">Rendering primary block.</nested-cmp>',
      );

      // Expect that the loading resources function was not invoked again (counter remains 1).
      expect(loadingFnInvokedTimes).toBe(1);
    });
  });

  describe('directive matching', () => {
    it('should support directive matching in all blocks', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'simple-app',
        imports: [NestedCmp],
        template: `
        @defer (when isVisible) {
          <nested-cmp [block]="'primary'" />
        } @loading {
          Loading...
          <nested-cmp [block]="'loading'" />
        } @placeholder {
          Placeholder!
          <nested-cmp [block]="'placeholder'" />
        } @error {
          Failed to load dependencies :(
          <nested-cmp [block]="'error'" />
        }
      `,
      })
      class MyCmp {
        isVisible = false;
      }

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain(
        '<nested-cmp ng-reflect-block="placeholder">Rendering placeholder block.</nested-cmp>',
      );

      fixture.componentInstance.isVisible = true;
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain(
        '<nested-cmp ng-reflect-block="loading">Rendering loading block.</nested-cmp>',
      );

      // Wait for dependencies to load.
      await allPendingDynamicImports();
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain(
        '<nested-cmp ng-reflect-block="primary">Rendering primary block.</nested-cmp>',
      );
    });
  });

  describe('minimum and after conditions', () => {
    it('should support minimum and after conditions', fakeAsync(() => {
      const {trigger, fixture} = createFixture(`
            @defer (when trigger; prefetch when prefetchTrigger) {
              <nested-cmp [block]="'Main'" />
            } @loading (after 100ms; minimum 150ms) {
              Loading
            } @placeholder (minimum 100ms) {
              Placeholder
            } @error {
              Error
            }
          `);

      verifyTimeline(
        fixture,
        [50, 'Placeholder'],
        [100, trigger(170)],
        [150, 'Placeholder'],
        [250, 'Loading'],
        [300, 'Loading'],
        [450, 'Main'],
      );
    }));

    it('should support @placeholder with `minimum`', fakeAsync(() => {
      const {trigger, fixture} = createFixture(`
          @defer (when trigger; prefetch when prefetchTrigger) {
            <nested-cmp [block]="'Main'" />
          } @placeholder (minimum 100ms) {
            Placeholder
          }
        `);

      verifyTimeline(fixture, [0, trigger(40)], [90, 'Placeholder'], [100, 'Main']);
    }));

    it('should keep rendering @placeholder if trigger happened later', fakeAsync(() => {
      const {trigger, fixture} = createFixture(`
          @defer (when trigger; prefetch when prefetchTrigger) {
            <nested-cmp [block]="'Main'" />
          } @placeholder (minimum 100ms) {
            Placeholder
          }
        `);

      verifyTimeline(
        fixture,
        [0, 'Placeholder'],
        [50, trigger(20)],
        [90, 'Placeholder'],
        [100, 'Main'],
      );
    }));

    it(
      'should transition from @placeholder to primary content ' + 'if it was prefetched',
      fakeAsync(() => {
        const {trigger, triggerPrefetch, fixture} = createFixture(`
         @defer (when trigger; prefetch when prefetchTrigger) {
           <nested-cmp [block]="'Main'" />
         } @placeholder (minimum 100ms) {
           Placeholder
         }
       `);

        verifyTimeline(
          fixture,
          [0, 'Placeholder'],
          [20, triggerPrefetch(20)],
          [150, 'Placeholder'],
          [200, trigger(0)],
          [225, 'Main'],
        );
      }),
    );

    it('should support @loading with `minimum`', fakeAsync(() => {
      const {trigger, fixture} = createFixture(`
          @defer (when trigger; prefetch when prefetchTrigger) {
            <nested-cmp [block]="'Main'" />
          } @loading (minimum 100ms) {
            Loading
          }
        `);

      verifyTimeline(
        fixture,
        [0, trigger(20)],
        // Even though loading happened in 20ms,
        // we still render @loading block for longer
        // period of time, since there was `minimum` defined.
        [95, 'Loading'],
        [100, 'Main'],
      );
    }));

    it('should support @loading with `after` and `minimum`', fakeAsync(() => {
      const {trigger, fixture} = createFixture(`
         @defer (when trigger; prefetch when prefetchTrigger) {
           <nested-cmp [block]="'Main'" />
         } @loading (after 100ms; minimum 150ms) {
           Loading
         }
       `);

      verifyTimeline(
        fixture,
        [0, trigger(150)],
        [50, ''],
        // Start showing loading after `after` ms.
        [100, 'Loading'],
        [150, 'Loading'],
        [200, 'Loading'],
        // Render main content after `after` + `minimum` ms.
        [300, 'Main'],
      );
    }));

    it('should skip @loading when resources were prefetched', fakeAsync(() => {
      const {trigger, triggerPrefetch, fixture} = createFixture(`
          @defer (when trigger; prefetch when prefetchTrigger) {
            <nested-cmp [block]="'Main'" />
          } @loading (minimum 100ms) {
            Loading
          }
        `);

      verifyTimeline(
        fixture,
        [0, triggerPrefetch(50)],
        [50, ''],
        [75, ''],
        [100, trigger(0)],
        // We go directly into the final state, since
        // resources were already preloaded.
        [125, 'Main'],
      );
    }));
  });

  describe('error handling', () => {
    it('should render an error block when loading fails', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'simple-app',
        imports: [NestedCmp],
        template: `
          @defer (when isVisible) {
            <nested-cmp [block]="'primary'" />
          } @loading {
            Loading...
          } @placeholder {
            Placeholder!
          } @error {
            Failed to load dependencies :(
            <nested-cmp [block]="'error'" />
          }
          `,
      })
      class MyCmp {
        isVisible = false;
        @ViewChildren(NestedCmp) cmps!: QueryList<NestedCmp>;
      }

      const deferDepsInterceptor = {
        intercept() {
          return () => [failedDynamicImport()];
        },
      };

      TestBed.configureTestingModule({
        providers: [{provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor}],
      });

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Placeholder');

      fixture.componentInstance.isVisible = true;
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Loading');

      // Wait for dependencies to load.
      await allPendingDynamicImports();
      fixture.detectChanges();

      // Verify that the error block is rendered.
      // Also verify that selector matching works in an error block.
      expect(fixture.nativeElement.outerHTML).toContain(
        '<nested-cmp ng-reflect-block="error">Rendering error block.</nested-cmp>',
      );

      // Verify that queries work within an error block.
      expect(fixture.componentInstance.cmps.length).toBe(1);
      expect(fixture.componentInstance.cmps.get(0)?.block).toBe('error');
    });

    it('should report an error to the ErrorHandler if no `@error` block is defined', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'NestedCmp',
      })
      class NestedCmp {}

      @Component({
        standalone: true,
        selector: 'simple-app',
        imports: [NestedCmp],
        template: `
          @defer (when isVisible) {
            <nested-cmp />
          } @loading {
            Loading...
          } @placeholder {
            Placeholder
          }
        `,
      })
      class MyCmp {
        isVisible = false;
      }

      const deferDepsInterceptor = {
        intercept() {
          return () => [failedDynamicImport()];
        },
      };

      const reportedErrors: Error[] = [];
      TestBed.configureTestingModule({
        providers: [
          {
            provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR,
            useValue: deferDepsInterceptor,
          },
          {
            provide: ErrorHandler,
            useClass: class extends ErrorHandler {
              override handleError(error: Error) {
                reportedErrors.push(error);
              }
            },
          },
        ],
      });

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Placeholder');

      fixture.componentInstance.isVisible = true;
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Loading');

      // Wait for dependencies to load.
      await allPendingDynamicImports();
      fixture.detectChanges();

      // Verify that there was an error reported to the `ErrorHandler`.
      expect(reportedErrors.length).toBe(1);
      expect(reportedErrors[0].message).toContain('NG0750');
      expect(reportedErrors[0].message).toContain(`(used in the 'MyCmp' component template)`);
    });

    it('should not render `@error` block if loaded component has errors', async () => {
      @Component({
        selector: 'cmp-with-error',
        standalone: true,
        template: 'CmpWithError',
      })
      class CmpWithError {
        constructor() {
          throw new Error('CmpWithError produced an error');
        }
      }

      @Component({
        standalone: true,
        selector: 'simple-app',
        imports: [CmpWithError],
        template: `
          @defer (when isVisible) {
            <cmp-with-error />
          } @loading {
            Loading...
          } @error {
            Error
          } @placeholder {
            Placeholder
          }
        `,
      })
      class MyCmp {
        isVisible = false;
      }

      const deferDepsInterceptor = {
        intercept() {
          return () => [dynamicImportOf(CmpWithError)];
        },
      };

      const reportedErrors: Error[] = [];
      TestBed.configureTestingModule({
        providers: [
          {
            provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR,
            useValue: deferDepsInterceptor,
          },
          {
            provide: ErrorHandler,
            useClass: class extends ErrorHandler {
              override handleError(error: Error) {
                reportedErrors.push(error);
              }
            },
          },
        ],
      });

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Placeholder');

      fixture.componentInstance.isVisible = true;
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Loading');

      // Wait for dependencies to load.
      await allPendingDynamicImports();
      fixture.detectChanges();

      // Expect an error to be reported to the `ErrorHandler`.
      expect(reportedErrors.length).toBe(1);
      expect(reportedErrors[0].message).toBe('CmpWithError produced an error');

      // Expect that the `@loading` UI is removed, but the `@error` is *not* rendered,
      // because it was a component initialization error, not resource loading issue.
      expect(fixture.nativeElement.textContent).toBe('');
    });

    describe('with ngDevMode', () => {
      const _global: {ngDevMode: any} = global;
      let saveNgDevMode!: typeof ngDevMode;
      beforeEach(() => (saveNgDevMode = ngDevMode));
      afterEach(() => (_global.ngDevMode = saveNgDevMode));

      [true, false].forEach((devMode) => {
        it(`should log an error in the handler when there is no error block with devMode:${devMode}`, async () => {
          @Component({
            selector: 'nested-cmp',
            standalone: true,
            template: 'Rendering {{ block }} block.',
          })
          class NestedCmp {
            @Input() block!: string;
          }

          @Component({
            standalone: true,
            selector: 'simple-app',
            imports: [NestedCmp],
            template: `
          @defer (when isVisible) {
            <nested-cmp [block]="'primary'" />
          } @loading {
            Loading...
          } @placeholder {
            Placeholder!
          }
          `,
          })
          class MyCmp {
            isVisible = false;
            @ViewChildren(NestedCmp) cmps!: QueryList<NestedCmp>;
          }

          const deferDepsInterceptor = {
            intercept() {
              return () => [failedDynamicImport()];
            },
          };

          const errorLogs: Error[] = [];
          @Injectable()
          class CustomErrorHandler {
            handleError(error: Error): void {
              errorLogs.push(error);
            }
          }

          TestBed.configureTestingModule({
            providers: [
              {provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor},
              {
                provide: ErrorHandler,
                useClass: CustomErrorHandler,
              },
            ],
          });

          const fixture = TestBed.createComponent(MyCmp);
          fixture.detectChanges();

          expect(fixture.nativeElement.outerHTML).toContain('Placeholder');

          fixture.componentInstance.isVisible = true;
          fixture.detectChanges();

          expect(fixture.nativeElement.outerHTML).toContain('Loading');

          // ngDevMode should not be set earlier than here
          // as it would prevent the DEFER_BLOCK_DEPENDENCY_INTERCEPTOR from being set
          _global.ngDevMode = devMode;

          // Wait for dependencies to load.
          await allPendingDynamicImports();
          fixture.detectChanges();

          expect(errorLogs.length).toBe(1);
          const error = errorLogs[0];
          expect(error).toBeInstanceOf(RuntimeError);
          expect(error.message).toMatch(/NG0750/);
        });
      });
    });
  });

  describe('queries', () => {
    it('should query for components within each block', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'simple-app',
        imports: [NestedCmp],
        template: `
          @defer (when isVisible) {
            <nested-cmp [block]="'primary'" />
          } @loading {
            Loading...
            <nested-cmp [block]="'loading'" />
          } @placeholder {
            Placeholder!
            <nested-cmp [block]="'placeholder'" />
          } @error {
            Failed to load dependencies :(
            <nested-cmp [block]="'error'" />
          }
        `,
      })
      class MyCmp {
        isVisible = false;

        @ViewChildren(NestedCmp) cmps!: QueryList<NestedCmp>;
      }

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(fixture.componentInstance.cmps.length).toBe(1);
      expect(fixture.componentInstance.cmps.get(0)?.block).toBe('placeholder');
      expect(fixture.nativeElement.outerHTML).toContain(
        '<nested-cmp ng-reflect-block="placeholder">Rendering placeholder block.</nested-cmp>',
      );

      fixture.componentInstance.isVisible = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.cmps.length).toBe(1);
      expect(fixture.componentInstance.cmps.get(0)?.block).toBe('loading');
      expect(fixture.nativeElement.outerHTML).toContain(
        '<nested-cmp ng-reflect-block="loading">Rendering loading block.</nested-cmp>',
      );

      // Wait for dependencies to load.
      await allPendingDynamicImports();
      fixture.detectChanges();

      expect(fixture.componentInstance.cmps.length).toBe(1);
      expect(fixture.componentInstance.cmps.get(0)?.block).toBe('primary');
      expect(fixture.nativeElement.outerHTML).toContain(
        '<nested-cmp ng-reflect-block="primary">Rendering primary block.</nested-cmp>',
      );
    });
  });

  describe('content projection', () => {
    it('should be able to project content into each block', async () => {
      @Component({
        selector: 'cmp-a',
        standalone: true,
        template: 'CmpA',
      })
      class CmpA {}

      @Component({
        selector: 'cmp-b',
        standalone: true,
        template: 'CmpB',
      })
      class CmpB {}

      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'my-app',
        imports: [NestedCmp],
        template: `
          @defer (when isVisible) {
            <nested-cmp [block]="'primary'" />
            <ng-content />
          } @loading {
            Loading...
            <nested-cmp [block]="'loading'" />
          } @placeholder {
            Placeholder!
            <nested-cmp [block]="'placeholder'" />
          } @error {
            Failed to load dependencies :(
            <nested-cmp [block]="'error'" />
          }
        `,
      })
      class MyCmp {
        @Input() isVisible = false;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [MyCmp, CmpA, CmpB],
        template: `
          <my-app [isVisible]="isVisible">
            Projected content.
            <b>Including tags</b>
            <cmp-a />
            @defer (when isInViewport) {
              <cmp-b />
            } @placeholder {
              Projected defer block placeholder.
            }
          </my-app>
        `,
      })
      class RootCmp {
        isVisible = false;
        isInViewport = false;
      }

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain(
        '<nested-cmp ng-reflect-block="placeholder">Rendering placeholder block.</nested-cmp>',
      );

      fixture.componentInstance.isVisible = true;
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain(
        '<nested-cmp ng-reflect-block="loading">Rendering loading block.</nested-cmp>',
      );

      // Wait for dependencies to load.
      await allPendingDynamicImports();
      fixture.detectChanges();

      // Verify primary block content.
      const primaryBlockHTML = fixture.nativeElement.outerHTML;
      expect(primaryBlockHTML).toContain(
        '<nested-cmp ng-reflect-block="primary">Rendering primary block.</nested-cmp>',
      );
      expect(primaryBlockHTML).toContain('Projected content.');
      expect(primaryBlockHTML).toContain('<b>Including tags</b>');
      expect(primaryBlockHTML).toContain('<cmp-a>CmpA</cmp-a>');
      expect(primaryBlockHTML).toContain('Projected defer block placeholder.');

      fixture.componentInstance.isInViewport = true;
      fixture.detectChanges();

      // Wait for projected block dependencies to load.
      await allPendingDynamicImports();
      fixture.detectChanges();

      // Nested defer block was triggered and the `CmpB` content got rendered.
      expect(fixture.nativeElement.outerHTML).toContain('<cmp-b>CmpB</cmp-b>');
    });
  });

  describe('nested blocks', () => {
    it('should be able to have nested blocks', async () => {
      @Component({
        selector: 'cmp-a',
        standalone: true,
        template: 'CmpA',
      })
      class CmpA {}

      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [NestedCmp, CmpA],
        template: `
          @defer (when isVisible) {
            <nested-cmp [block]="'primary'" />

            @defer (when isInViewport) {
              <cmp-a />
            } @placeholder {
              Nested defer block placeholder.
            }
          } @placeholder {
            <nested-cmp [block]="'placeholder'" />
          }
        `,
      })
      class RootCmp {
        isVisible = false;
        isInViewport = false;
      }

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain(
        '<nested-cmp ng-reflect-block="placeholder">Rendering placeholder block.</nested-cmp>',
      );

      fixture.componentInstance.isVisible = true;
      fixture.detectChanges();

      await allPendingDynamicImports();
      fixture.detectChanges();

      // Verify primary block content.
      const primaryBlockHTML = fixture.nativeElement.outerHTML;
      expect(primaryBlockHTML).toContain(
        '<nested-cmp ng-reflect-block="primary">Rendering primary block.</nested-cmp>',
      );

      // Make sure we have a nested block in a placeholder state.
      expect(primaryBlockHTML).toContain('Nested defer block placeholder.');

      // Trigger condition for the nested block.
      fixture.componentInstance.isInViewport = true;
      fixture.detectChanges();

      // Wait for nested block dependencies to load.
      await allPendingDynamicImports();
      fixture.detectChanges();

      // Nested defer block was triggered and the `CmpB` content got rendered.
      expect(fixture.nativeElement.outerHTML).toContain('<cmp-a>CmpA</cmp-a>');
    });

    it('should handle nested blocks that defer load the same dep', async () => {
      @Component({
        selector: 'cmp-a',
        standalone: true,
        template: 'CmpA',
      })
      class CmpA {}

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [CmpA],
        template: `
          @defer (on immediate) {
            <cmp-a />

            @defer (on immediate) {
              <cmp-a />
            }
          }
        `,
      })
      class RootCmp {}

      const deferDepsInterceptor = {
        intercept() {
          return () => {
            return [dynamicImportOf(CmpA)];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [{provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor}],
      });

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      // Wait for the dependency fn promise to resolve.
      await allPendingDynamicImports();
      fixture.detectChanges();

      // Await all async work to be completed.
      await fixture.whenStable();

      // Expect both <cmp-a> components to be rendered.
      expect(fixture.nativeElement.innerHTML.replaceAll('<!--container-->', '')).toBe(
        '<cmp-a>CmpA</cmp-a><cmp-a>CmpA</cmp-a>',
      );
    });
  });

  describe('prefetch', () => {
    /**
     * Sets up interceptors for when an idle callback is requested
     * and when it's cancelled. This is needed to keep track of calls
     * made to `requestIdleCallback` and `cancelIdleCallback` APIs.
     */
    let id = 0;
    let idleCallbacksRequested: number;
    let idleCallbacksInvoked: number;
    let idleCallbacksCancelled: number;
    const onIdleCallbackQueue: Map<number, IdleRequestCallback> = new Map();

    function resetCounters() {
      idleCallbacksRequested = 0;
      idleCallbacksInvoked = 0;
      idleCallbacksCancelled = 0;
    }
    resetCounters();

    let nativeRequestIdleCallback: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions,
    ) => number;
    let nativeCancelIdleCallback: (id: number) => void;

    const mockRequestIdleCallback = (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions,
    ): number => {
      onIdleCallbackQueue.set(id, callback);
      expect(idleCallbacksRequested).toBe(0);
      expect(NgZone.isInAngularZone()).toBe(true);
      idleCallbacksRequested++;
      return id++;
    };

    const mockCancelIdleCallback = (id: number) => {
      onIdleCallbackQueue.delete(id);
      idleCallbacksRequested--;
      idleCallbacksCancelled++;
    };

    const triggerIdleCallbacks = () => {
      for (const [_, callback] of onIdleCallbackQueue) {
        idleCallbacksInvoked++;
        callback(null!);
      }
      onIdleCallbackQueue.clear();
    };

    beforeEach(() => {
      nativeRequestIdleCallback = globalThis.requestIdleCallback;
      nativeCancelIdleCallback = globalThis.cancelIdleCallback;
      globalThis.requestIdleCallback = mockRequestIdleCallback;
      globalThis.cancelIdleCallback = mockCancelIdleCallback;
      resetCounters();
    });

    afterEach(() => {
      globalThis.requestIdleCallback = nativeRequestIdleCallback;
      globalThis.cancelIdleCallback = nativeCancelIdleCallback;
      onIdleCallbackQueue.clear();
      resetCounters();
    });

    it('should be able to prefetch resources', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [NestedCmp],
        template: `
          @defer (when deferCond; prefetch when prefetchCond) {
            <nested-cmp [block]="'primary'" />
          } @placeholder {
            Placeholder
          }
        `,
      })
      class RootCmp {
        deferCond = false;
        prefetchCond = false;
      }

      let loadingFnInvokedTimes = 0;
      const deferDepsInterceptor = {
        intercept() {
          return () => {
            loadingFnInvokedTimes++;
            return [dynamicImportOf(NestedCmp)];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [{provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor}],
      });

      clearDirectiveDefs(RootCmp);

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Placeholder');

      // Make sure loading function is not yet invoked.
      expect(loadingFnInvokedTimes).toBe(0);

      // Trigger prefetching.
      fixture.componentInstance.prefetchCond = true;
      fixture.detectChanges();

      await allPendingDynamicImports();
      fixture.detectChanges();

      // Expect that the loading resources function was invoked once.
      expect(loadingFnInvokedTimes).toBe(1);

      // Expect that placeholder content is still rendered.
      expect(fixture.nativeElement.outerHTML).toContain('Placeholder');

      // Trigger main content.
      fixture.componentInstance.deferCond = true;
      fixture.detectChanges();

      await allPendingDynamicImports();
      fixture.detectChanges();

      // Verify primary block content.
      const primaryBlockHTML = fixture.nativeElement.outerHTML;
      expect(primaryBlockHTML).toContain(
        '<nested-cmp ng-reflect-block="primary">Rendering primary block.</nested-cmp>',
      );

      // Expect that the loading resources function was not invoked again (counter remains 1).
      expect(loadingFnInvokedTimes).toBe(1);
    });

    it('should handle a case when prefetching fails', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [NestedCmp],
        template: `
          @defer (when deferCond; prefetch when prefetchCond) {
            <nested-cmp [block]="'primary'" />
          } @error {
            Loading failed
          } @placeholder {
            Placeholder
          }
        `,
      })
      class RootCmp {
        deferCond = false;
        prefetchCond = false;
      }

      let loadingFnInvokedTimes = 0;
      const deferDepsInterceptor = {
        intercept() {
          return () => {
            loadingFnInvokedTimes++;
            return [failedDynamicImport()];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [{provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor}],
      });

      clearDirectiveDefs(RootCmp);

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Placeholder');

      // Make sure loading function is not yet invoked.
      expect(loadingFnInvokedTimes).toBe(0);

      // Trigger prefetching.
      fixture.componentInstance.prefetchCond = true;
      fixture.detectChanges();

      await allPendingDynamicImports();
      fixture.detectChanges();

      // Expect that the loading resources function was invoked once.
      expect(loadingFnInvokedTimes).toBe(1);

      // Expect that placeholder content is still rendered.
      expect(fixture.nativeElement.outerHTML).toContain('Placeholder');

      // Trigger main content.
      fixture.componentInstance.deferCond = true;
      fixture.detectChanges();

      await allPendingDynamicImports();
      fixture.detectChanges();

      // Since prefetching failed, expect the error block to be rendered.
      expect(fixture.nativeElement.outerHTML).toContain('Loading failed');

      // Expect that the loading resources function was not invoked again (counter remains 1).
      expect(loadingFnInvokedTimes).toBe(1);
    });

    it('should work when loading and prefetching were kicked off at the same time', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [NestedCmp],
        template: `
          @defer (when deferCond; prefetch when deferCond) {
            <nested-cmp [block]="'primary'" />
          } @error {
            Loading failed
          } @placeholder {
            Placeholder
          }
        `,
      })
      class RootCmp {
        deferCond = false;
      }

      let loadingFnInvokedTimes = 0;
      const deferDepsInterceptor = {
        intercept() {
          return () => {
            loadingFnInvokedTimes++;
            return [dynamicImportOf(NestedCmp)];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [{provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor}],
      });

      clearDirectiveDefs(RootCmp);

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Placeholder');

      // Make sure loading function is not yet invoked.
      expect(loadingFnInvokedTimes).toBe(0);

      // Trigger prefetching and loading at the same time.
      fixture.componentInstance.deferCond = true;
      fixture.detectChanges();

      await allPendingDynamicImports();
      fixture.detectChanges();

      // Expect that the loading resources function was invoked once,
      // even though both main loading and prefetching were kicked off
      // at the same time.
      expect(loadingFnInvokedTimes).toBe(1);

      // Expect the main content to be rendered.
      expect(fixture.nativeElement.outerHTML).toContain('Rendering primary block');
    });

    it('should support `prefetch on idle` condition', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [NestedCmp],
        template: `
          @defer (when deferCond; prefetch on idle) {
            <nested-cmp [block]="'primary'" />
          } @placeholder {
            Placeholder
          }
        `,
      })
      class RootCmp {
        deferCond = false;
      }

      let loadingFnInvokedTimes = 0;
      const deferDepsInterceptor = {
        intercept() {
          return () => {
            loadingFnInvokedTimes++;
            return [dynamicImportOf(NestedCmp)];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [{provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor}],
      });

      clearDirectiveDefs(RootCmp);

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Placeholder');

      // Make sure loading function is not yet invoked.
      expect(loadingFnInvokedTimes).toBe(0);

      triggerIdleCallbacks();
      await allPendingDynamicImports();
      fixture.detectChanges();

      // Expect that the loading resources function was invoked once.
      expect(loadingFnInvokedTimes).toBe(1);

      // Expect that placeholder content is still rendered.
      expect(fixture.nativeElement.outerHTML).toContain('Placeholder');

      // Trigger main content.
      fixture.componentInstance.deferCond = true;
      fixture.detectChanges();

      await allPendingDynamicImports();
      fixture.detectChanges();

      // Verify primary block content.
      const primaryBlockHTML = fixture.nativeElement.outerHTML;
      expect(primaryBlockHTML).toContain(
        '<nested-cmp ng-reflect-block="primary">Rendering primary block.</nested-cmp>',
      );

      // Expect that the loading resources function was not invoked again (counter remains 1).
      expect(loadingFnInvokedTimes).toBe(1);
    });

    it('should trigger prefetching based on `on idle` only once', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [NestedCmp],
        template: `
          @for (item of items; track item) {
            @defer (when deferCond; prefetch on idle) {
              <nested-cmp [block]="'primary for \`' + item + '\`'" />
            } @placeholder {
              Placeholder \`{{ item }}\`
            }
          }
        `,
      })
      class RootCmp {
        deferCond = false;
        items = ['a', 'b', 'c'];
      }

      let loadingFnInvokedTimes = 0;
      const deferDepsInterceptor = {
        intercept() {
          return () => {
            loadingFnInvokedTimes++;
            return [dynamicImportOf(NestedCmp)];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [{provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor}],
      });

      clearDirectiveDefs(RootCmp);

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Placeholder `a`');
      expect(fixture.nativeElement.outerHTML).toContain('Placeholder `b`');
      expect(fixture.nativeElement.outerHTML).toContain('Placeholder `c`');

      // Make sure loading function is not yet invoked.
      expect(loadingFnInvokedTimes).toBe(0);

      triggerIdleCallbacks();
      await allPendingDynamicImports();
      fixture.detectChanges();

      // Expect that the loading resources function was invoked once.
      expect(loadingFnInvokedTimes).toBe(1);

      // Expect that placeholder content is still rendered.
      expect(fixture.nativeElement.outerHTML).toContain('Placeholder `a`');

      // Trigger main content.
      fixture.componentInstance.deferCond = true;
      fixture.detectChanges();

      await allPendingDynamicImports();
      fixture.detectChanges();

      // Verify primary blocks content.
      expect(fixture.nativeElement.outerHTML).toContain('Rendering primary for `a` block');
      expect(fixture.nativeElement.outerHTML).toContain('Rendering primary for `b` block');
      expect(fixture.nativeElement.outerHTML).toContain('Rendering primary for `c` block');

      // Expect that the loading resources function was not invoked again (counter remains 1).
      expect(loadingFnInvokedTimes).toBe(1);
    });

    it('should trigger fetching based on `on idle` only once', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [NestedCmp],
        template: `
          @for (item of items; track item) {
            @defer (on idle; prefetch on idle) {
              <nested-cmp [block]="'primary for \`' + item + '\`'" />
            } @placeholder {
              Placeholder \`{{ item }}\`
            }
          }
        `,
      })
      class RootCmp {
        items = ['a', 'b', 'c'];
      }

      let loadingFnInvokedTimes = 0;
      const deferDepsInterceptor = {
        intercept() {
          return () => {
            loadingFnInvokedTimes++;
            return [dynamicImportOf(NestedCmp)];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [{provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor}],
      });

      clearDirectiveDefs(RootCmp);

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Placeholder `a`');
      expect(fixture.nativeElement.outerHTML).toContain('Placeholder `b`');
      expect(fixture.nativeElement.outerHTML).toContain('Placeholder `c`');

      // Make sure loading function is not yet invoked.
      expect(loadingFnInvokedTimes).toBe(0);

      triggerIdleCallbacks();
      await allPendingDynamicImports();
      fixture.detectChanges();

      // Expect that the loading resources function was invoked once.
      expect(loadingFnInvokedTimes).toBe(1);

      // Verify primary blocks content.
      expect(fixture.nativeElement.outerHTML).toContain('Rendering primary for `a` block');
      expect(fixture.nativeElement.outerHTML).toContain('Rendering primary for `b` block');
      expect(fixture.nativeElement.outerHTML).toContain('Rendering primary for `c` block');

      // Expect that the loading resources function was not invoked again (counter remains 1).
      expect(loadingFnInvokedTimes).toBe(1);
    });

    it('should support `prefetch on immediate` condition', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [NestedCmp],
        template: `
          @defer (when deferCond; prefetch on immediate) {
            <nested-cmp [block]="'primary'" />
          } @placeholder {
            Placeholder
          }
        `,
      })
      class RootCmp {
        deferCond = false;
      }

      let loadingFnInvokedTimes = 0;
      const deferDepsInterceptor = {
        intercept() {
          return () => {
            loadingFnInvokedTimes++;
            return [dynamicImportOf(NestedCmp)];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [
          ...COMMON_PROVIDERS,
          {provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor},
        ],
      });

      clearDirectiveDefs(RootCmp);

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Placeholder');

      // Expecting loading function to be triggered right away.
      expect(loadingFnInvokedTimes).toBe(1);

      await allPendingDynamicImports();
      fixture.detectChanges();

      // Expect that the loading resources function was invoked once.
      expect(loadingFnInvokedTimes).toBe(1);

      // Expect that placeholder content is still rendered.
      expect(fixture.nativeElement.outerHTML).toContain('Placeholder');

      // Trigger main content.
      fixture.componentInstance.deferCond = true;
      fixture.detectChanges();

      await allPendingDynamicImports();
      fixture.detectChanges();

      // Verify primary block content.
      const primaryBlockHTML = fixture.nativeElement.outerHTML;
      expect(primaryBlockHTML).toContain(
        '<nested-cmp ng-reflect-block="primary">Rendering primary block.</nested-cmp>',
      );

      // Expect that the loading resources function was not invoked again (counter remains 1).
      expect(loadingFnInvokedTimes).toBe(1);
    });

    it('should delay nested defer blocks with `on idle` triggers', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Primary block content.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        selector: 'another-nested-cmp',
        standalone: true,
        template: 'Nested block component.',
      })
      class AnotherNestedCmp {}

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [NestedCmp, AnotherNestedCmp],
        template: `
          @defer (on idle; prefetch on idle) {
            <nested-cmp [block]="'primary for \`' + item + '\`'" />

            <!--
              Expecting that nested defer block would be initialized
              in a subsequent "requestIdleCallback" call.
            -->
            @defer (on idle) {
              <another-nested-cmp />
            } @placeholder {
              Nested block placeholder
            } @loading {
              Nested block loading
            }

          } @placeholder {
            Root block placeholder
          }
        `,
      })
      class RootCmp {}

      let loadingFnInvokedTimes = 0;
      const deferDepsInterceptor = {
        intercept() {
          return () => {
            loadingFnInvokedTimes++;
            const nextDeferredComponent =
              loadingFnInvokedTimes === 1 ? NestedCmp : AnotherNestedCmp;
            return [dynamicImportOf(nextDeferredComponent)];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [{provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor}],
      });

      clearDirectiveDefs(RootCmp);

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Root block placeholder');

      // Make sure loading function is not yet invoked.
      expect(loadingFnInvokedTimes).toBe(0);

      // Trigger all scheduled callbacks and await all mocked dynamic imports.
      triggerIdleCallbacks();
      await allPendingDynamicImports();
      fixture.detectChanges();

      // Expect that the loading resources function was invoked once.
      expect(loadingFnInvokedTimes).toBe(1);

      // Verify primary blocks content.
      expect(fixture.nativeElement.outerHTML).toContain('Primary block content');

      // Verify that nested defer block is in a placeholder mode.
      expect(fixture.nativeElement.outerHTML).toContain('Nested block placeholder');

      // Expect that the loading resources function was not invoked again (counter remains 1).
      expect(loadingFnInvokedTimes).toBe(1);

      triggerIdleCallbacks();
      await allPendingDynamicImports();
      fixture.detectChanges();

      // Verify that nested defer block now renders the main content.
      expect(fixture.nativeElement.outerHTML).toContain('Nested block component');

      // We loaded a nested block dependency, expect counter to be 2.
      expect(loadingFnInvokedTimes).toBe(2);
    });

    it('should not request idle callback for each block in a for loop', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [NestedCmp],
        template: `
          @for (item of items; track item) {
            @defer (on idle; prefetch on idle) {
              <nested-cmp [block]="'primary for \`' + item + '\`'" />
            } @placeholder {
              Placeholder \`{{ item }}\`
            }
          }
        `,
      })
      class RootCmp {
        items = ['a', 'b', 'c'];
      }

      let loadingFnInvokedTimes = 0;
      const deferDepsInterceptor = {
        intercept() {
          return () => {
            loadingFnInvokedTimes++;
            return [dynamicImportOf(NestedCmp)];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [{provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor}],
      });

      clearDirectiveDefs(RootCmp);

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Placeholder `a`');
      expect(fixture.nativeElement.outerHTML).toContain('Placeholder `b`');
      expect(fixture.nativeElement.outerHTML).toContain('Placeholder `c`');

      // Make sure loading function is not yet invoked.
      expect(loadingFnInvokedTimes).toBe(0);

      // Trigger all scheduled callbacks and await all mocked dynamic imports.
      triggerIdleCallbacks();
      await allPendingDynamicImports();
      fixture.detectChanges();

      // Expect that the loading resources function was invoked once.
      expect(loadingFnInvokedTimes).toBe(1);

      // Verify primary blocks content.
      expect(fixture.nativeElement.outerHTML).toContain('Rendering primary for `a` block');
      expect(fixture.nativeElement.outerHTML).toContain('Rendering primary for `b` block');
      expect(fixture.nativeElement.outerHTML).toContain('Rendering primary for `c` block');

      // Expect that the loading resources function was not invoked again (counter remains 1).
      expect(loadingFnInvokedTimes).toBe(1);
    });

    it('should delay nested defer blocks with `on idle` triggers', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Primary block content.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        selector: 'another-nested-cmp',
        standalone: true,
        template: 'Nested block component.',
      })
      class AnotherNestedCmp {}

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [NestedCmp, AnotherNestedCmp],
        template: `
          @defer (on idle; prefetch on idle) {
            <nested-cmp [block]="'primary for \`' + item + '\`'" />
            <!--
              Expecting that nested defer block would be initialized
              in a subsequent "requestIdleCallback" call.
            -->
            @defer (on idle) {
              <another-nested-cmp />
            } @placeholder {
              Nested block placeholder
            } @loading {
              Nested block loading
            }

          } @placeholder {
            Root block placeholder
          }
        `,
      })
      class RootCmp {}

      let loadingFnInvokedTimes = 0;
      const deferDepsInterceptor = {
        intercept() {
          return () => {
            loadingFnInvokedTimes++;
            const nextDeferredComponent =
              loadingFnInvokedTimes === 1 ? NestedCmp : AnotherNestedCmp;
            return [dynamicImportOf(nextDeferredComponent)];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [{provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor}],
      });

      clearDirectiveDefs(RootCmp);

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Root block placeholder');

      // Make sure loading function is not yet invoked.
      expect(loadingFnInvokedTimes).toBe(0);

      // Trigger all scheduled callbacks and await all mocked dynamic imports.
      triggerIdleCallbacks();
      await allPendingDynamicImports();
      fixture.detectChanges();

      // Expect that the loading resources function was invoked once.
      expect(loadingFnInvokedTimes).toBe(1);

      // Verify primary blocks content.
      expect(fixture.nativeElement.outerHTML).toContain('Primary block content');

      // Verify that nested defer block is in a placeholder mode.
      expect(fixture.nativeElement.outerHTML).toContain('Nested block placeholder');

      // Expect that the loading resources function was not invoked again (counter remains 1).
      expect(loadingFnInvokedTimes).toBe(1);

      triggerIdleCallbacks();
      await allPendingDynamicImports();
      fixture.detectChanges();

      // Verify that nested defer block now renders the main content.
      expect(fixture.nativeElement.outerHTML).toContain('Nested block component');

      // We loaded a nested block dependency, expect counter to be 2.
      expect(loadingFnInvokedTimes).toBe(2);
    });

    it('should clear idle handlers when defer block is triggered', async () => {
      @Component({
        standalone: true,
        selector: 'root-app',
        template: `
          @defer (when isVisible; on idle; prefetch on idle) {
            Hello world!
          }
        `,
      })
      class RootCmp {
        isVisible = false;
      }

      TestBed.configureTestingModule({});

      clearDirectiveDefs(RootCmp);

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      // Expecting that an idle callback was requested.
      expect(idleCallbacksRequested).toBe(1);
      expect(idleCallbacksInvoked).toBe(0);
      expect(idleCallbacksCancelled).toBe(0);

      // Trigger defer block.
      fixture.componentInstance.isVisible = true;
      fixture.detectChanges();

      await allPendingDynamicImports();
      fixture.detectChanges();

      // Expecting that an idle callback was cancelled and never invoked.
      expect(idleCallbacksRequested).toBe(0);
      expect(idleCallbacksInvoked).toBe(0);
      expect(idleCallbacksCancelled).toBe(1);
    });
  });

  // Note: these cases specifically use `on interaction`, however
  // the resolution logic is the same for all triggers.
  describe('trigger resolution', () => {
    it('should resolve a trigger is outside the defer block', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
            @defer (on interaction(trigger)) {
              Main content
            } @placeholder {
              Placeholder
            }

            <div>
              <div>
                <div>
                  <button #trigger></button>
                </div>
            </div>
          </div>
          `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content');
    }));

    it('should resolve a trigger on a component outside the defer block', fakeAsync(() => {
      @Component({selector: 'some-comp', template: '<button></button>', standalone: true})
      class SomeComp {}

      @Component({
        standalone: true,
        imports: [SomeComp],
        template: `
            @defer (on interaction(trigger)) {
              Main content
            } @placeholder {
              Placeholder
            }

            <div>
              <div>
                <div>
                  <some-comp #trigger/>
                </div>
              </div>
            </div>
          `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content');
    }));

    it('should resolve a trigger that is on a parent element', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
            <button #trigger>
              <div>
                <div>
                @defer (on interaction(trigger)) {
                  Main content
                } @placeholder {
                  Placeholder
                }
                </div>
              </div>
            </button>
          `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content');
    }));

    it('should resolve a trigger that is inside a parent embedded view', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
            @if (cond) {
              <button #trigger></button>

              @if (cond) {
                @if (cond) {
                  @defer (on interaction(trigger)) {
                    Main content
                  } @placeholder {
                    Placeholder
                  }
                }
              }
            }
          `,
      })
      class MyCmp {
        cond = true;
      }

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content');
    }));

    it('should resolve a trigger that is on a component in a parent embedded view', fakeAsync(() => {
      @Component({selector: 'some-comp', template: '<button></button>', standalone: true})
      class SomeComp {}

      @Component({
        standalone: true,
        imports: [SomeComp],
        template: `
              @if (cond) {
                <some-comp #trigger/>

                @if (cond) {
                  @if (cond) {
                    @defer (on interaction(trigger)) {
                      Main content
                    } @placeholder {
                      Placeholder
                    }
                  }
                }
              }
            `,
      })
      class MyCmp {
        cond = true;
      }

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content');
    }));

    it('should resolve a trigger that is inside the placeholder', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
              @defer (on interaction(trigger)) {
                Main content
              } @placeholder {
                Placeholder <div><div><div><button #trigger></button></div></div></div>
              }
            `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content');
    }));

    it('should resolve a trigger that is a component inside the placeholder', fakeAsync(() => {
      @Component({selector: 'some-comp', template: '<button></button>', standalone: true})
      class SomeComp {}

      @Component({
        standalone: true,
        imports: [SomeComp],
        template: `
              @defer (on interaction(trigger)) {
                Main content
              } @placeholder {
                Placeholder <div><div><div><some-comp #trigger/></div></div></div>
              }
            `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content');
    }));
  });

  describe('interaction triggers', () => {
    it('should load the deferred content when the trigger is clicked', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
              @defer (on interaction(trigger)) {
                Main content
              } @placeholder {
                Placeholder
              }

              <button #trigger></button>
            `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content');
    }));

    it('should load the deferred content when the trigger receives a keyboard event', fakeAsync(() => {
      // Domino doesn't support creating custom events so we have to skip this test.
      if (!isBrowser) {
        return;
      }

      @Component({
        standalone: true,
        template: `
              @defer (on interaction(trigger)) {
                Main content
              } @placeholder {
                Placeholder
              }

              <button #trigger></button>
            `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      button.dispatchEvent(new Event('keydown'));
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content');
    }));

    it('should load the deferred content when an implicit trigger is clicked', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
             @defer (on interaction) {
               Main content
             } @placeholder {
               <button>Placeholder</button>
             }
           `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content');
    }));

    it('should load the deferred content if a child of the trigger is clicked', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
              @defer (on interaction(trigger)) {
                Main content
              } @placeholder {
                Placeholder
              }

             <div #trigger>
               <div>
                <button></button>
               </div>
             </div>
           `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content');
    }));

    it('should support multiple deferred blocks with the same trigger', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
             @defer (on interaction(trigger)) {
              Main content 1
             } @placeholder {
              Placeholder 1
             }

             @defer (on interaction(trigger)) {
              Main content 2
             } @placeholder {
              Placeholder 2
             }

             <button #trigger></button>
           `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder 1  Placeholder 2');

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content 1  Main content 2');
    }));

    it('should unbind the trigger events when the deferred block is loaded', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
             @defer (on interaction(trigger)) {Main content}
             <button #trigger></button>
           `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      const spy = spyOn(button, 'removeEventListener');

      button.click();
      fixture.detectChanges();
      flush();

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith('click', jasmine.any(Function), jasmine.any(Object));
      expect(spy).toHaveBeenCalledWith('keydown', jasmine.any(Function), jasmine.any(Object));
    }));

    it('should unbind the trigger events when the trigger is destroyed', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
            @if (renderBlock) {
              @defer (on interaction(trigger)) {Main content}
              <button #trigger></button>
            }
          `,
      })
      class MyCmp {
        renderBlock = true;
      }

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      const spy = spyOn(button, 'removeEventListener');

      fixture.componentInstance.renderBlock = false;
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith('click', jasmine.any(Function), jasmine.any(Object));
      expect(spy).toHaveBeenCalledWith('keydown', jasmine.any(Function), jasmine.any(Object));
    }));

    it('should unbind the trigger events when the deferred block is destroyed', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
              @if (renderBlock) {
                @defer (on interaction(trigger)) {Main content}
              }

              <button #trigger></button>
            `,
      })
      class MyCmp {
        renderBlock = true;
      }

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      const spy = spyOn(button, 'removeEventListener');

      fixture.componentInstance.renderBlock = false;
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith('click', jasmine.any(Function), jasmine.any(Object));
      expect(spy).toHaveBeenCalledWith('keydown', jasmine.any(Function), jasmine.any(Object));
    }));

    it('should remove placeholder content on interaction', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
           @defer (on interaction(trigger)) {
             Main content
           } @placeholder {
            <div>placeholder</div>
           }

           <button #trigger></button>
         `,
      })
      class MyCmp {}
      TestBed.configureTestingModule({});

      const appRef = TestBed.inject(ApplicationRef);
      const zone = TestBed.inject(NgZone);
      const componentRef = createComponent(MyCmp, {
        environmentInjector: TestBed.inject(EnvironmentInjector),
      });
      const button = componentRef.location.nativeElement.querySelector('button');
      zone.run(() => {
        appRef.attachView(componentRef.hostView);
      });
      expect(componentRef.location.nativeElement.innerHTML).toContain('<div>placeholder</div>');
      zone.run(() => {
        button.click();
      });
      tick();
      expect(componentRef.location.nativeElement.innerHTML).not.toContain('<div>placeholder</div>');
    }));

    it('should prefetch resources on interaction', fakeAsync(() => {
      @Component({
        standalone: true,
        selector: 'root-app',
        template: `
              @defer (when isLoaded; prefetch on interaction(trigger)) {Main content}
              <button #trigger></button>
            `,
      })
      class MyCmp {
        // We need a `when` trigger here so that `on idle` doesn't get added automatically.
        readonly isLoaded = false;
      }

      let loadingFnInvokedTimes = 0;

      TestBed.configureTestingModule({
        providers: [
          {
            provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR,
            useValue: {
              intercept: () => () => {
                loadingFnInvokedTimes++;
                return [];
              },
            },
          },
        ],
      });

      clearDirectiveDefs(MyCmp);

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(loadingFnInvokedTimes).toBe(0);

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      flush();

      expect(loadingFnInvokedTimes).toBe(1);
    }));

    it('should prefetch resources on interaction with an implicit trigger', fakeAsync(() => {
      @Component({
        standalone: true,
        selector: 'root-app',
        template: `
             @defer (when isLoaded; prefetch on interaction) {
              Main content
             } @placeholder {
              <button></button>
             }
           `,
      })
      class MyCmp {
        // We need a `when` trigger here so that `on idle` doesn't get added automatically.
        readonly isLoaded = false;
      }

      let loadingFnInvokedTimes = 0;

      TestBed.configureTestingModule({
        providers: [
          {
            provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR,
            useValue: {
              intercept: () => () => {
                loadingFnInvokedTimes++;
                return [];
              },
            },
          },
        ],
      });

      clearDirectiveDefs(MyCmp);

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(loadingFnInvokedTimes).toBe(0);

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      flush();

      expect(loadingFnInvokedTimes).toBe(1);
    }));
  });

  describe('hover triggers', () => {
    it('should load the deferred content when the trigger is hovered', fakeAsync(() => {
      // Domino doesn't support creating custom events so we have to skip this test.
      if (!isBrowser) {
        return;
      }

      @Component({
        standalone: true,
        template: `
              @defer (on hover(trigger)) {
                Main content
              } @placeholder {
                Placeholder
              }

              <button #trigger></button>
            `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      button.dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content');
    }));

    it('should load the deferred content with an implicit trigger element', fakeAsync(() => {
      // Domino doesn't support creating custom events so we have to skip this test.
      if (!isBrowser) {
        return;
      }

      @Component({
        standalone: true,
        template: `
             @defer (on hover) {
               Main content
             } @placeholder {
              <button>Placeholder</button>
             }
           `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      button.dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content');
    }));

    it('should support multiple deferred blocks with the same hover trigger', fakeAsync(() => {
      // Domino doesn't support creating custom events so we have to skip this test.
      if (!isBrowser) {
        return;
      }

      @Component({
        standalone: true,
        template: `
              @defer (on hover(trigger)) {
                Main content 1
              } @placeholder {
                Placeholder 1
              }

              @defer (on hover(trigger)) {
                Main content 2
              } @placeholder {
                Placeholder 2
              }

              <button #trigger></button>
           `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder 1  Placeholder 2');

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      button.dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content 1  Main content 2');
    }));

    it('should unbind the trigger events when the deferred block is loaded', fakeAsync(() => {
      // Domino doesn't support creating custom events so we have to skip this test.
      if (!isBrowser) {
        return;
      }

      @Component({
        standalone: true,
        template: `
             @defer (on hover(trigger)) {
              Main content
             }
             <button #trigger></button>
           `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      const spy = spyOn(button, 'removeEventListener');

      button.dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();
      flush();

      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenCalledWith('mouseenter', jasmine.any(Function), jasmine.any(Object));
      expect(spy).toHaveBeenCalledWith('mouseover', jasmine.any(Function), jasmine.any(Object));
      expect(spy).toHaveBeenCalledWith('focusin', jasmine.any(Function), jasmine.any(Object));
    }));

    it('should unbind the trigger events when the trigger is destroyed', fakeAsync(() => {
      // Domino doesn't support creating custom events so we have to skip this test.
      if (!isBrowser) {
        return;
      }

      @Component({
        standalone: true,
        template: `
            @if (renderBlock) {
              @defer (on hover(trigger)) {
                Main content
              }
              <button #trigger></button>
            }
          `,
      })
      class MyCmp {
        renderBlock = true;
      }

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      const spy = spyOn(button, 'removeEventListener');

      fixture.componentInstance.renderBlock = false;
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenCalledWith('mouseenter', jasmine.any(Function), jasmine.any(Object));
      expect(spy).toHaveBeenCalledWith('mouseover', jasmine.any(Function), jasmine.any(Object));
      expect(spy).toHaveBeenCalledWith('focusin', jasmine.any(Function), jasmine.any(Object));
    }));

    it('should unbind the trigger events when the deferred block is destroyed', fakeAsync(() => {
      // Domino doesn't support creating custom events so we have to skip this test.
      if (!isBrowser) {
        return;
      }

      @Component({
        standalone: true,
        template: `
              @if (renderBlock) {
                @defer (on hover(trigger)) {
                  Main content
                }
              }

              <button #trigger></button>
            `,
      })
      class MyCmp {
        renderBlock = true;
      }

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      const spy = spyOn(button, 'removeEventListener');

      fixture.componentInstance.renderBlock = false;
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenCalledWith('mouseenter', jasmine.any(Function), jasmine.any(Object));
      expect(spy).toHaveBeenCalledWith('mouseover', jasmine.any(Function), jasmine.any(Object));
      expect(spy).toHaveBeenCalledWith('focusin', jasmine.any(Function), jasmine.any(Object));
    }));

    it('should prefetch resources on hover', fakeAsync(() => {
      // Domino doesn't support creating custom events so we have to skip this test.
      if (!isBrowser) {
        return;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        template: `
              @defer (when isLoaded; prefetch on hover(trigger)) {
                Main content
              }
              <button #trigger></button>
            `,
      })
      class MyCmp {
        // We need a `when` trigger here so that `on idle` doesn't get added automatically.
        readonly isLoaded = false;
      }

      let loadingFnInvokedTimes = 0;

      TestBed.configureTestingModule({
        providers: [
          {
            provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR,
            useValue: {
              intercept: () => () => {
                loadingFnInvokedTimes++;
                return [];
              },
            },
          },
        ],
      });

      clearDirectiveDefs(MyCmp);

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(loadingFnInvokedTimes).toBe(0);

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      button.dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();
      flush();

      expect(loadingFnInvokedTimes).toBe(1);
    }));

    it('should prefetch resources when an implicit trigger is hovered', fakeAsync(() => {
      // Domino doesn't support creating custom events so we have to skip this test.
      if (!isBrowser) {
        return;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        template: `
             @defer (when isLoaded; prefetch on hover) {
               Main content
             } @placeholder {
               <button></button>
             }
           `,
      })
      class MyCmp {
        // We need a `when` trigger here so that `on idle` doesn't get added automatically.
        readonly isLoaded = false;
      }

      let loadingFnInvokedTimes = 0;

      TestBed.configureTestingModule({
        providers: [
          {
            provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR,
            useValue: {
              intercept: () => () => {
                loadingFnInvokedTimes++;
                return [];
              },
            },
          },
        ],
      });

      clearDirectiveDefs(MyCmp);

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(loadingFnInvokedTimes).toBe(0);

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      button.dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();
      flush();

      expect(loadingFnInvokedTimes).toBe(1);
    }));
  });

  describe('`on timer` triggers', () => {
    it('should trigger based on `on timer` condition', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [NestedCmp],
        template: `
            @for (item of items; track item) {
              @defer (on timer(500ms)) {
                <nested-cmp [block]="'primary for \`' + item + '\`'" />
              } @placeholder {
                Placeholder \`{{ item }}\`
              }
            }
          `,
      })
      class RootCmp {
        items = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
      }

      let loadingFnInvokedTimes = 0;
      const deferDepsInterceptor = {
        intercept() {
          return () => {
            loadingFnInvokedTimes++;
            return [dynamicImportOf(NestedCmp)];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [
          {provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor},
          {provide: TimerScheduler, useClass: FakeTimerScheduler},
        ],
      });

      const fakeScheduler = TestBed.inject(TimerScheduler) as unknown as FakeTimerScheduler;

      clearDirectiveDefs(RootCmp);

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Placeholder `a`');
      expect(fixture.nativeElement.outerHTML).toContain('Placeholder `b`');
      expect(fixture.nativeElement.outerHTML).toContain('Placeholder `c`');

      // Make sure loading function is not yet invoked.
      expect(loadingFnInvokedTimes).toBe(0);

      fakeScheduler.invoke();
      await allPendingDynamicImports(); // fetching dependencies of the defer block
      fixture.detectChanges();

      // Expect that the loading resources function was invoked once.
      expect(loadingFnInvokedTimes).toBe(1);

      // Verify primary blocks content.
      expect(fixture.nativeElement.outerHTML).toContain('Rendering primary for `a` block');
      expect(fixture.nativeElement.outerHTML).toContain('Rendering primary for `b` block');
      expect(fixture.nativeElement.outerHTML).toContain('Rendering primary for `c` block');

      // Expect that the loading resources function was not invoked again (counter remains 1).
      expect(loadingFnInvokedTimes).toBe(1);

      // Adding an extra item to the list
      fixture.componentInstance.items = ['a', 'b', 'c', 'd'];
      fixture.detectChanges();

      // Make sure loading function is still 1 (i.e. wasn't invoked again).
      expect(loadingFnInvokedTimes).toBe(1);
    });

    it('should trigger nested `on timer` condition', async () => {
      @Component({
        standalone: true,
        selector: 'root-app',
        template: `
          @defer (on timer(100ms)) {
            primary[top]

            @defer (on timer(100ms)) {
              primary[nested]
            } @placeholder {
              placeholder[nested]
            }
          } @placeholder {
            placeholder[top]
          }
        `,
      })
      class RootCmp {}

      TestBed.configureTestingModule({
        providers: [{provide: TimerScheduler, useClass: FakeTimerScheduler}],
      });
      const fakeScheduler = TestBed.inject(TimerScheduler) as unknown as FakeTimerScheduler;

      clearDirectiveDefs(RootCmp);

      const fixture = TestBed.createComponent(RootCmp);

      expect(fixture.nativeElement.outerHTML).toContain('placeholder[top]');

      fakeScheduler.invoke();
      await allPendingDynamicImports(); // fetching dependencies of the defer block

      // Verify primary blocks content after triggering top-level @defer.
      expect(fixture.nativeElement.outerHTML).toContain('primary[top]');
      expect(fixture.nativeElement.outerHTML).toContain('placeholder[nested]');

      fakeScheduler.invoke();
      await allPendingDynamicImports(); // fetching dependencies of the defer block

      // Verify that nested @defer block was triggered as well.
      expect(fixture.nativeElement.outerHTML).toContain('primary[top]');
      expect(fixture.nativeElement.outerHTML).toContain('primary[nested]');
    });
  });

  describe('`prefetch on timer` triggers', () => {
    it('should trigger prefetching based on `on timer` condition', async () => {
      @Component({
        selector: 'nested-cmp',
        standalone: true,
        template: 'Rendering {{ block }} block.',
      })
      class NestedCmp {
        @Input() block!: string;
      }

      @Component({
        standalone: true,
        selector: 'root-app',
        imports: [NestedCmp],
        template: `
            @for (item of items; track item) {
              @defer (when shouldTrigger; prefetch on timer(100ms)) {
                <nested-cmp [block]="'primary for \`' + item + '\`'" />
              } @placeholder {
                Placeholder \`{{ item }}\`
              }
            }
          `,
      })
      class RootCmp {
        shouldTrigger = false;
        items = ['a', 'b', 'c'];
      }

      let loadingFnInvokedTimes = 0;
      const deferDepsInterceptor = {
        intercept() {
          return () => {
            loadingFnInvokedTimes++;
            return [dynamicImportOf(NestedCmp)];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [
          {provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor},
          {provide: TimerScheduler, useClass: FakeTimerScheduler},
        ],
      });

      const fakeScheduler = TestBed.inject(TimerScheduler) as unknown as FakeTimerScheduler;

      clearDirectiveDefs(RootCmp);

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).toContain('Placeholder `a`');
      expect(fixture.nativeElement.outerHTML).toContain('Placeholder `b`');
      expect(fixture.nativeElement.outerHTML).toContain('Placeholder `c`');

      // Make sure loading function is not yet invoked.
      expect(loadingFnInvokedTimes).toBe(0);

      fakeScheduler.invoke();
      await allPendingDynamicImports(); // fetching dependencies of the defer block
      fixture.detectChanges();

      // Expect that the loading resources function was invoked once.
      expect(loadingFnInvokedTimes).toBe(1);

      // Trigger rendering of all defer blocks.
      fixture.componentInstance.shouldTrigger = true;
      fixture.detectChanges();

      // Verify primary blocks content.
      expect(fixture.nativeElement.outerHTML).toContain('Rendering primary for `a` block');
      expect(fixture.nativeElement.outerHTML).toContain('Rendering primary for `b` block');
      expect(fixture.nativeElement.outerHTML).toContain('Rendering primary for `c` block');

      // Make sure the loading function wasn't invoked again (count remains `1`).
      expect(loadingFnInvokedTimes).toBe(1);
    });

    it('should trigger prefetching and rendering based on `on timer` condition', fakeAsync(() => {
      const {fixture} = createFixture(`
            @defer (on timer(200ms); prefetch on timer(100ms)) {
              <nested-cmp [block]="'Main'" />
            } @placeholder {
              Placeholder
            }
          `);

      verifyTimeline(fixture, [50, 'Placeholder'], [150, 'Placeholder'], [250, 'Main']);
    }));

    it('should clear timeout callbacks when defer block is triggered', fakeAsync(() => {
      const setSpy = spyOn(globalThis, 'setTimeout');
      const clearSpy = spyOn(globalThis, 'clearTimeout');

      @Component({
        standalone: true,
        selector: 'root-app',
        template: `
              @defer (when isVisible; on timer(200ms); prefetch on timer(100ms)) {
                Hello world!
              }
            `,
      })
      class RootCmp {
        isVisible = false;
      }

      TestBed.configureTestingModule({});

      clearDirectiveDefs(RootCmp);

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      // Trigger defer block
      fixture.componentInstance.isVisible = true;
      fixture.detectChanges();

      // The `clearTimeout` was called synchronously, because the `when`
      // condition was triggered, which resulted in timers cleanup.
      expect(setSpy).toHaveBeenCalledTimes(2);
      expect(clearSpy).toHaveBeenCalledTimes(2);
    }));
  });

  describe('viewport triggers', () => {
    let activeObservers: MockIntersectionObserver[] = [];
    let nativeIntersectionObserver: typeof IntersectionObserver;

    beforeEach(() => {
      nativeIntersectionObserver = globalThis.IntersectionObserver;
      globalThis.IntersectionObserver = MockIntersectionObserver;
    });

    afterEach(() => {
      globalThis.IntersectionObserver = nativeIntersectionObserver;
      activeObservers = [];
    });

    /**
     * Mocked out implementation of the native IntersectionObserver API. We need to
     * mock it out for tests, because it's unsupported in Domino and we can't trigger
     * it reliably in the browser.
     */
    class MockIntersectionObserver implements IntersectionObserver {
      root = null;
      rootMargin = null!;
      thresholds = null!;

      observedElements = new Set<Element>();
      private elementsInView = new Set<Element>();

      constructor(private callback: IntersectionObserverCallback) {
        activeObservers.push(this);
      }

      static invokeCallbacksForElement(element: Element, isInView: boolean) {
        for (const observer of activeObservers) {
          const elements = observer.elementsInView;
          const wasInView = elements.has(element);

          if (isInView) {
            elements.add(element);
          } else {
            elements.delete(element);
          }

          observer.invokeCallback();

          if (wasInView) {
            elements.add(element);
          } else {
            elements.delete(element);
          }
        }
      }

      private invokeCallback() {
        for (const el of this.observedElements) {
          this.callback(
            [
              {
                target: el,
                isIntersecting: this.elementsInView.has(el),

                // Unsupported properties.
                boundingClientRect: null!,
                intersectionRatio: null!,
                intersectionRect: null!,
                rootBounds: null,
                time: null!,
              },
            ],
            this,
          );
        }
      }

      observe(element: Element) {
        this.observedElements.add(element);
        // Native observers fire their callback as soon as an
        // element is observed so we try to mimic it here.
        this.invokeCallback();
      }

      unobserve(element: Element) {
        this.observedElements.delete(element);
      }

      disconnect() {
        this.observedElements.clear();
        this.elementsInView.clear();
      }

      takeRecords(): IntersectionObserverEntry[] {
        throw new Error('Not supported');
      }
    }

    it('should load the deferred content when the trigger is in the viewport', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
              @defer (on viewport(trigger)) {
                Main content
              } @placeholder {
                Placeholder
              }

              <button #trigger></button>
            `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      MockIntersectionObserver.invokeCallbacksForElement(button, true);
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content');
    }));

    it('should load the deferred content when an implicit trigger is in the viewport', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
             @defer (on viewport) {
               Main content
             } @placeholder {
              <button>Placeholder</button>
             }
           `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      MockIntersectionObserver.invokeCallbacksForElement(button, true);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content');
    }));

    it('should not load the content if the trigger is not in the view yet', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
             @defer (on viewport(trigger)) {
              Main content
             } @placeholder {
              Placeholder
             }

             <button #trigger></button>
           `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      MockIntersectionObserver.invokeCallbacksForElement(button, false);
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      MockIntersectionObserver.invokeCallbacksForElement(button, false);
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder');

      MockIntersectionObserver.invokeCallbacksForElement(button, true);
      fixture.detectChanges();
      flush();

      expect(fixture.nativeElement.textContent.trim()).toBe('Main content');
    }));

    it('should support multiple deferred blocks with the same trigger', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
            @defer (on viewport(trigger)) {
              Main content 1
            } @placeholder {
              Placeholder 1
            }

            @defer (on viewport(trigger)) {
              Main content 2
            } @placeholder {
              Placeholder 2
            }

            <button #trigger></button>
          `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('Placeholder 1  Placeholder 2');

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      MockIntersectionObserver.invokeCallbacksForElement(button, true);
      fixture.detectChanges();
      flush();
      expect(fixture.nativeElement.textContent.trim()).toBe('Main content 1  Main content 2');
    }));

    it('should stop observing the trigger when the deferred block is loaded', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
            @defer (on viewport(trigger)) {
              Main content
            }
            <button #trigger></button>
          `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      expect(activeObservers.length).toBe(1);
      expect(activeObservers[0].observedElements.size).toBe(1);
      expect(activeObservers[0].observedElements.has(button)).toBe(true);

      MockIntersectionObserver.invokeCallbacksForElement(button, true);
      fixture.detectChanges();
      flush();

      expect(activeObservers.length).toBe(1);
      expect(activeObservers[0].observedElements.size).toBe(0);
    }));

    it('should stop observing the trigger when the trigger is destroyed', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
           @if (renderBlock) {
             @defer (on viewport(trigger)) {
              Main content
             }
             <button #trigger></button>
           }
         `,
      })
      class MyCmp {
        renderBlock = true;
      }

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      expect(activeObservers.length).toBe(1);
      expect(activeObservers[0].observedElements.size).toBe(1);
      expect(activeObservers[0].observedElements.has(button)).toBe(true);

      fixture.componentInstance.renderBlock = false;
      fixture.detectChanges();

      expect(activeObservers.length).toBe(1);
      expect(activeObservers[0].observedElements.size).toBe(0);
    }));

    it('should stop observing the trigger when the deferred block is destroyed', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
             @if (renderBlock) {
              @defer (on viewport(trigger)) {
                Main content
              }
             }

             <button #trigger></button>
           `,
      })
      class MyCmp {
        renderBlock = true;
      }

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      expect(activeObservers.length).toBe(1);
      expect(activeObservers[0].observedElements.size).toBe(1);
      expect(activeObservers[0].observedElements.has(button)).toBe(true);

      fixture.componentInstance.renderBlock = false;
      fixture.detectChanges();

      expect(activeObservers.length).toBe(1);
      expect(activeObservers[0].observedElements.size).toBe(0);
    }));

    it('should disconnect the intersection observer once all deferred blocks have been loaded', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
            <button #triggerOne></button>
            @defer (on viewport(triggerOne)) {
              One
            }

            <button #triggerTwo></button>
            @defer (on viewport(triggerTwo)) {
              Two
            }
          `,
      })
      class MyCmp {}

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      expect(activeObservers.length).toBe(1);

      const buttons = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('button'));
      const observer = activeObservers[0];
      const disconnectSpy = spyOn(observer, 'disconnect').and.callThrough();

      expect(Array.from(observer.observedElements)).toEqual(buttons);

      MockIntersectionObserver.invokeCallbacksForElement(buttons[0], true);
      fixture.detectChanges();

      expect(disconnectSpy).not.toHaveBeenCalled();
      expect(Array.from(observer.observedElements)).toEqual([buttons[1]]);

      MockIntersectionObserver.invokeCallbacksForElement(buttons[1], true);
      fixture.detectChanges();

      expect(disconnectSpy).toHaveBeenCalled();
      expect(observer.observedElements.size).toBe(0);
    }));

    it('should prefetch resources when the trigger comes into the viewport', fakeAsync(() => {
      @Component({
        standalone: true,
        selector: 'root-app',
        template: `
             @defer (when isLoaded; prefetch on viewport(trigger)) {
              Main content
             }
             <button #trigger></button>
           `,
      })
      class MyCmp {
        // We need a `when` trigger here so that `on idle` doesn't get added automatically.
        readonly isLoaded = false;
      }

      let loadingFnInvokedTimes = 0;

      TestBed.configureTestingModule({
        providers: [
          {
            provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR,
            useValue: {
              intercept: () => () => {
                loadingFnInvokedTimes++;
                return [];
              },
            },
          },
        ],
      });

      clearDirectiveDefs(MyCmp);

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(loadingFnInvokedTimes).toBe(0);

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      MockIntersectionObserver.invokeCallbacksForElement(button, true);
      fixture.detectChanges();
      flush();

      expect(loadingFnInvokedTimes).toBe(1);
    }));

    it('should prefetch resources when an implicit trigger comes into the viewport', fakeAsync(() => {
      @Component({
        standalone: true,
        selector: 'root-app',
        template: `
             @defer (when isLoaded; prefetch on viewport) {
              Main content
             } @placeholder {
               <button></button>
             }
           `,
      })
      class MyCmp {
        // We need a `when` trigger here so that `on idle` doesn't get added automatically.
        readonly isLoaded = false;
      }

      let loadingFnInvokedTimes = 0;

      TestBed.configureTestingModule({
        providers: [
          {
            provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR,
            useValue: {
              intercept: () => () => {
                loadingFnInvokedTimes++;
                return [];
              },
            },
          },
        ],
      });

      clearDirectiveDefs(MyCmp);

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      expect(loadingFnInvokedTimes).toBe(0);

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      MockIntersectionObserver.invokeCallbacksForElement(button, true);
      fixture.detectChanges();
      flush();

      expect(loadingFnInvokedTimes).toBe(1);
    }));

    it('should load deferred content in a loop', fakeAsync(() => {
      @Component({
        standalone: true,
        template: `
              @for (item of items; track item) {
                @defer (on viewport) {d{{item}} }
                @placeholder {<button>p{{item}} </button>}
              }
           `,
      })
      class MyCmp {
        items = [1, 2, 3, 4, 5, 6];
      }

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();
      const buttons = Array.from<Element>(fixture.nativeElement.querySelectorAll('button'));
      const items = fixture.componentInstance.items;

      // None of the blocks are loaded yet.
      expect(fixture.nativeElement.textContent.trim()).toBe('p1 p2 p3 p4 p5 p6');

      // First half of the blocks is loaded.
      for (let i = 0; i < items.length / 2; i++) {
        MockIntersectionObserver.invokeCallbacksForElement(buttons[i], true);
        fixture.detectChanges();
        flush();
      }
      expect(fixture.nativeElement.textContent.trim()).toBe('d1 d2 d3 p4 p5 p6');

      // Second half of the blocks is loaded.
      for (let i = items.length / 2; i < items.length; i++) {
        MockIntersectionObserver.invokeCallbacksForElement(buttons[i], true);
        fixture.detectChanges();
        flush();
      }
      expect(fixture.nativeElement.textContent.trim()).toBe('d1 d2 d3 d4 d5 d6');
    }));
  });

  describe('DOM-based events cleanup', () => {
    it('should unbind `interaction` trigger events when the deferred block is loaded', async () => {
      @Component({
        standalone: true,
        template: `
          @defer (
            when isVisible;
            on interaction(trigger);
            prefetch on interaction(prefetchTrigger)
          ) { Main content }
          <button #trigger></button>
          <div #prefetchTrigger></div>
        `,
      })
      class MyCmp {
        isVisible = false;
      }

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      const triggerSpy = spyOn(button, 'removeEventListener');
      const div = fixture.nativeElement.querySelector('div');
      const prefetchSpy = spyOn(div, 'removeEventListener');

      fixture.componentInstance.isVisible = true;
      fixture.detectChanges();

      await allPendingDynamicImports();
      fixture.detectChanges();

      // Verify that trigger element is cleaned up.
      expect(triggerSpy).toHaveBeenCalledTimes(2);
      expect(triggerSpy).toHaveBeenCalledWith('click', jasmine.any(Function), jasmine.any(Object));
      expect(triggerSpy).toHaveBeenCalledWith(
        'keydown',
        jasmine.any(Function),
        jasmine.any(Object),
      );

      // Verify that prefetch trigger element is cleaned up.
      expect(prefetchSpy).toHaveBeenCalledTimes(2);
      expect(prefetchSpy).toHaveBeenCalledWith('click', jasmine.any(Function), jasmine.any(Object));
      expect(prefetchSpy).toHaveBeenCalledWith(
        'keydown',
        jasmine.any(Function),
        jasmine.any(Object),
      );
    });

    it('should unbind `hover` trigger events when the deferred block is loaded', async () => {
      @Component({
        standalone: true,
        template: `
          @defer (
            when isVisible;
            on hover(trigger);
            prefetch on hover(prefetchTrigger)
          ) { Main content }
          <button #trigger></button>
          <div #prefetchTrigger></div>
        `,
      })
      class MyCmp {
        isVisible = false;
      }

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      const triggerSpy = spyOn(button, 'removeEventListener');
      const div = fixture.nativeElement.querySelector('div');
      const prefetchSpy = spyOn(div, 'removeEventListener');

      fixture.componentInstance.isVisible = true;
      fixture.detectChanges();

      await allPendingDynamicImports();
      fixture.detectChanges();

      // Verify that trigger element is cleaned up.
      expect(triggerSpy).toHaveBeenCalledTimes(3);
      expect(triggerSpy).toHaveBeenCalledWith(
        'mouseenter',
        jasmine.any(Function),
        jasmine.any(Object),
      );
      expect(triggerSpy).toHaveBeenCalledWith(
        'mouseover',
        jasmine.any(Function),
        jasmine.any(Object),
      );
      expect(triggerSpy).toHaveBeenCalledWith(
        'focusin',
        jasmine.any(Function),
        jasmine.any(Object),
      );

      // Verify that prefetch trigger element is cleaned up.
      expect(prefetchSpy).toHaveBeenCalledTimes(3);
      expect(prefetchSpy).toHaveBeenCalledWith(
        'mouseenter',
        jasmine.any(Function),
        jasmine.any(Object),
      );
      expect(prefetchSpy).toHaveBeenCalledWith(
        'mouseover',
        jasmine.any(Function),
        jasmine.any(Object),
      );
      expect(prefetchSpy).toHaveBeenCalledWith(
        'focusin',
        jasmine.any(Function),
        jasmine.any(Object),
      );
    });
  });

  describe('DI', () => {
    it('should provide access to tokens from a parent component', async () => {
      const TokenA = new InjectionToken('A');
      const TokenB = new InjectionToken('B');

      @Component({
        standalone: true,
        selector: 'parent-cmp',
        template: '<ng-content />',
        providers: [{provide: TokenA, useValue: 'TokenA.ParentCmp'}],
      })
      class ParentCmp {}

      @Component({
        standalone: true,
        selector: 'child-cmp',
        template: 'Token A: {{ parentTokenA }} | Token B: {{ parentTokenB }}',
      })
      class ChildCmp {
        parentTokenA = inject(TokenA);
        parentTokenB = inject(TokenB);
      }

      @Component({
        standalone: true,
        selector: 'app-root',
        template: `
          <parent-cmp>
            @defer (when isVisible) {
              <child-cmp />
            }
          </parent-cmp>
        `,
        imports: [ChildCmp, ParentCmp],
        providers: [{provide: TokenB, useValue: 'TokenB.RootCmp'}],
      })
      class RootCmp {
        isVisible = true;
      }

      const deferDepsInterceptor = {
        intercept() {
          return () => {
            return [dynamicImportOf(ChildCmp)];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [{provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor}],
        deferBlockBehavior: DeferBlockBehavior.Playthrough,
      });

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      await allPendingDynamicImports();
      fixture.detectChanges();

      // Verify that tokens from parent components are available for injection
      // inside a component within a `@defer` block.
      const tokenA = 'TokenA.ParentCmp';
      const tokenB = 'TokenB.RootCmp';

      expect(fixture.nativeElement.innerHTML).toContain(
        `<child-cmp>Token A: ${tokenA} | Token B: ${tokenB}</child-cmp>`,
      );
    });

    it(
      'should provide access to tokens from a parent component ' +
        'for components instantiated via `createComponent` call (when a corresponding NodeInjector is used in the call), ' +
        'but attached to the ApplicationRef',
      async () => {
        const TokenA = new InjectionToken('A');
        const TokenB = new InjectionToken('B');

        @NgModule({
          providers: [{provide: TokenB, useValue: 'TokenB value'}],
        })
        class MyModule {}

        @Component({
          selector: 'lazy',
          standalone: true,
          imports: [MyModule],
          template: `
          Lazy Component! Token: {{ token }}
        `,
        })
        class Lazy {
          token = inject(TokenA);
        }

        @Component({
          standalone: true,
          imports: [Lazy],
          template: `
          @defer (on immediate) {
            <lazy />
          }
        `,
        })
        class Dialog {}

        @Component({
          standalone: true,
          selector: 'app-root',
          providers: [{provide: TokenA, useValue: 'TokenA from RootCmp'}],
          template: `
          <div #container></div>
        `,
        })
        class RootCmp {
          injector = inject(Injector);
          appRef = inject(ApplicationRef);
          envInjector = inject(EnvironmentInjector);
          @ViewChild('container', {read: ElementRef}) container!: ElementRef;

          openModal() {
            const hostElement = this.container.nativeElement;
            const componentRef = createComponent(Dialog, {
              hostElement,
              elementInjector: this.injector,
              environmentInjector: this.envInjector,
            });
            this.appRef.attachView(componentRef.hostView);
            componentRef.changeDetectorRef.detectChanges();
          }
        }

        const deferDepsInterceptor = {
          intercept() {
            return () => {
              return [dynamicImportOf(Lazy)];
            };
          },
        };

        TestBed.configureTestingModule({
          providers: [
            {provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor},
          ],
          deferBlockBehavior: DeferBlockBehavior.Playthrough,
        });

        const fixture = TestBed.createComponent(RootCmp);
        fixture.detectChanges();

        fixture.componentInstance.openModal();

        // The call above instantiates a component that uses a `@defer` block,
        // so we need to wait for dynamic imports to complete.
        await allPendingDynamicImports();
        fixture.detectChanges();

        // Verify that tokens from parent components are available for injection
        // inside a component within a `@defer` block.
        expect(fixture.nativeElement.innerHTML).toContain(
          `<lazy> Lazy Component! Token: TokenA from RootCmp </lazy>`,
        );
      },
    );
  });

  describe('NgModules', () => {
    it('should provide access to tokens from imported NgModules', async () => {
      let serviceInitCount = 0;

      const TokenA = new InjectionToken('');

      @Injectable()
      class Service {
        id = 'ChartsModule.Service';
        constructor() {
          serviceInitCount++;
        }
      }

      @Component({
        selector: 'chart',
        template: 'Service:{{ svc.id }}|TokenA:{{ tokenA }}',
        standalone: false,
      })
      class Chart {
        svc = inject(Service);
        tokenA = inject(TokenA);
      }

      @NgModule({
        providers: [Service],
        declarations: [Chart],
        exports: [Chart],
      })
      class ChartsModule {}

      @Component({
        selector: 'chart-collection',
        template: '<chart />',
        standalone: true,
        imports: [ChartsModule],
      })
      class ChartCollectionComponent {}

      @Component({
        selector: 'app-root',
        standalone: true,
        template: `
          @for(item of items; track $index) {
            @defer (when isVisible) {
              <chart-collection />
            }
          }
        `,
        imports: [ChartCollectionComponent],
        providers: [{provide: TokenA, useValue: 'MyCmp.A'}],
      })
      class MyCmp {
        items = [1, 2, 3];
        isVisible = true;
      }

      const deferDepsInterceptor = {
        intercept() {
          return () => {
            return [dynamicImportOf(ChartCollectionComponent)];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [{provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor}],
        deferBlockBehavior: DeferBlockBehavior.Playthrough,
      });

      clearDirectiveDefs(MyCmp);

      const fixture = TestBed.createComponent(MyCmp);
      fixture.detectChanges();

      await allPendingDynamicImports();
      fixture.detectChanges();

      // Verify that the `Service` injectable was initialized only once,
      // even though it was injected in 3 instances of the `<chart>` component,
      // used within defer blocks.
      expect(serviceInitCount).toBe(1);
      expect(fixture.nativeElement.querySelectorAll('chart').length).toBe(3);

      // Verify that a service defined within an NgModule can inject services
      // provided within the same NgModule.
      const serviceFromNgModule = 'Service:ChartsModule.Service';

      // Make sure sure that a nested `<chart>` component from the defer block
      // can inject tokens provided in parent component (that contains `@defer`
      // in its template).
      const tokenFromRootComponent = 'TokenA:MyCmp.A';
      expect(fixture.nativeElement.innerHTML).toContain(
        `<chart>${serviceFromNgModule}|${tokenFromRootComponent}</chart>`,
      );
    });
  });

  describe('Router', () => {
    it('should inject correct `ActivatedRoutes` in components within defer blocks', async () => {
      let deferCmpEnvInjector: EnvironmentInjector;

      const TokenA = new InjectionToken<string>('TokenA');

      @NgModule({
        providers: [{provide: TokenA, useValue: 'nested'}],
      })
      class MyModuleA {}

      @Component({
        standalone: true,
        imports: [RouterOutlet],
        template: '<router-outlet />',
      })
      class App {}

      @Component({
        standalone: true,
        selector: 'another-child',
        imports: [CommonModule, MyModuleA],
        template: 'another child: {{route.snapshot.url[0]}} | token: {{tokenA}}',
      })
      class AnotherChild {
        route = inject(ActivatedRoute);
        tokenA = inject(TokenA);
        constructor() {
          deferCmpEnvInjector = inject(EnvironmentInjector);
        }
      }

      @Component({
        standalone: true,
        imports: [CommonModule, AnotherChild],
        template: `
          child: {{route.snapshot.url[0]}} |
          token: {{tokenA}}
          @defer (on immediate) {
            <another-child />
          }
        `,
      })
      class Child {
        route = inject(ActivatedRoute);
        tokenA = inject(TokenA);
      }

      const deferDepsInterceptor = {
        intercept() {
          return () => {
            return [dynamicImportOf(AnotherChild, 10)];
          };
        },
      };

      TestBed.configureTestingModule({
        providers: [
          {provide: TokenA, useValue: 'root'},
          {provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID},
          {provide: ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, useValue: deferDepsInterceptor},
          provideRouter([
            {path: 'a', component: Child},
            {path: 'b', component: Child},
          ]),
        ],
      });
      clearDirectiveDefs(Child);

      const app = TestBed.createComponent(App);
      await TestBed.inject(Router).navigateByUrl('/a');
      app.detectChanges();

      await allPendingDynamicImports();
      app.detectChanges();

      expect(app.nativeElement.innerHTML).toContain('child: a | token: root');
      expect(app.nativeElement.innerHTML).toContain('another child: a | token: nested');

      // Navigate to `/b`
      await TestBed.inject(Router).navigateByUrl('/b');
      app.detectChanges();

      await allPendingDynamicImports();
      app.detectChanges();

      // Make sure that the `getInjectorResolutionPath` debugging utility
      // (used by DevTools) doesn't expose Router's `OutletInjector` in
      // the resolution path. `OutletInjector` is a special case, because it
      // doesn't store any tokens itself, we point to the parent injector instead.
      const resolutionPath = getInjectorResolutionPath(deferCmpEnvInjector!);
      for (const inj of resolutionPath) {
        expect(inj).not.toBeInstanceOf(ChainedInjector);
      }

      // Expect that `ActivatedRoute` information get updated inside
      // of a component used in a `@defer` block.
      expect(app.nativeElement.innerHTML).toContain('child: b | token: root');
      expect(app.nativeElement.innerHTML).toContain('another child: b | token: nested');
    });
  });
});

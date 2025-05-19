/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ɵPLATFORM_BROWSER_ID as PLATFORM_BROWSER_ID,
  ɵPLATFORM_SERVER_ID as PLATFORM_SERVER_ID,
} from '@angular/common';
import {
  AfterRenderPhase,
  AfterRenderRef,
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ErrorHandler,
  Injector,
  NgZone,
  PLATFORM_ID,
  Type,
  ViewContainerRef,
  afterNextRender,
  afterRender,
  computed,
  createComponent,
  effect,
  inject,
  signal,
} from '../../src/core';
import {NoopNgZone} from '../../src/zone/ng_zone';
import {TestBed} from '../../testing';

import {setUseMicrotaskEffectsByDefault} from '../../src/render3/reactivity/effect';
import {firstValueFrom} from 'rxjs';
import {filter} from 'rxjs/operators';
import {EnvironmentInjector, Injectable} from '../../src/di';

function createAndAttachComponent<T>(component: Type<T>) {
  const componentRef = createComponent(component, {
    environmentInjector: TestBed.inject(EnvironmentInjector),
  });
  TestBed.inject(ApplicationRef).attachView(componentRef.hostView);
  return componentRef;
}

describe('after render hooks', () => {
  let prev: boolean;
  beforeEach(() => {
    prev = setUseMicrotaskEffectsByDefault(false);
  });
  afterEach(() => setUseMicrotaskEffectsByDefault(prev));

  describe('browser', () => {
    const COMMON_PROVIDERS = [{provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID}];
    const COMMON_CONFIGURATION = {
      providers: [COMMON_PROVIDERS],
    };

    describe('afterRender', () => {
      it('should run with the correct timing', () => {
        @Component({
          selector: 'dynamic-comp',
          standalone: false,
        })
        class DynamicComp {
          afterRenderCount = 0;

          constructor() {
            afterRender(() => {
              this.afterRenderCount++;
            });
          }
        }

        @Component({
          selector: 'comp',
          standalone: false,
        })
        class Comp {
          afterRenderCount = 0;
          changeDetectorRef = inject(ChangeDetectorRef);
          viewContainerRef = inject(ViewContainerRef);

          constructor() {
            afterRender(() => {
              this.afterRenderCount++;
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        const component = createAndAttachComponent(Comp);
        const compInstance = component.instance;
        const viewContainerRef = compInstance.viewContainerRef;
        const dynamicCompRef = viewContainerRef.createComponent(DynamicComp);

        // It hasn't run at all
        expect(dynamicCompRef.instance.afterRenderCount).toBe(0);
        expect(compInstance.afterRenderCount).toBe(0);

        // Running change detection at the dynamicCompRef level
        dynamicCompRef.changeDetectorRef.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(0);
        expect(compInstance.afterRenderCount).toBe(0);

        // Running change detection at the compInstance level
        compInstance.changeDetectorRef.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(0);
        expect(compInstance.afterRenderCount).toBe(0);

        // Running change detection at the Application level
        TestBed.inject(ApplicationRef).tick();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(1);
        expect(compInstance.afterRenderCount).toBe(1);

        // Running change detection after removing view.
        viewContainerRef.remove();
        TestBed.inject(ApplicationRef).tick();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(1);
        expect(compInstance.afterRenderCount).toBe(2);
      });

      it('should run with ComponentFixture.detectChanges', () => {
        @Component({
          selector: 'dynamic-comp',
          standalone: false,
        })
        class DynamicComp {
          afterRenderCount = 0;

          constructor() {
            afterRender(() => {
              this.afterRenderCount++;
            });
          }
        }

        @Component({
          selector: 'comp',
          standalone: false,
        })
        class Comp {
          afterRenderCount = 0;
          changeDetectorRef = inject(ChangeDetectorRef);
          viewContainerRef = inject(ViewContainerRef);

          constructor() {
            afterRender(() => {
              this.afterRenderCount++;
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        const fixture = TestBed.createComponent(Comp);
        const compInstance = fixture.componentInstance;
        const viewContainerRef = compInstance.viewContainerRef;
        const dynamicCompRef = viewContainerRef.createComponent(DynamicComp);
        expect(dynamicCompRef.instance.afterRenderCount).toBe(0);
        expect(compInstance.afterRenderCount).toBe(0);

        // Running change detection at the dynamicCompRef level
        dynamicCompRef.changeDetectorRef.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(0);
        expect(compInstance.afterRenderCount).toBe(0);

        // Running change detection at the compInstance level
        compInstance.changeDetectorRef.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(0);
        expect(compInstance.afterRenderCount).toBe(0);

        // Running change detection at the Application level
        fixture.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(1);
        expect(compInstance.afterRenderCount).toBe(1);

        // Running change detection after removing view.
        viewContainerRef.remove();
        fixture.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(1);
        expect(compInstance.afterRenderCount).toBe(2);
      });

      it('should run all hooks after outer change detection', () => {
        let log: string[] = [];

        @Component({
          selector: 'child-comp',
          standalone: false,
        })
        class ChildComp {
          constructor() {
            afterRender(() => {
              log.push('child-comp');
            });
          }
        }

        @Component({
          selector: 'parent',
          template: `<child-comp></child-comp>`,
          standalone: false,
        })
        class ParentComp {
          changeDetectorRef = inject(ChangeDetectorRef);

          constructor() {
            afterRender(() => {
              log.push('parent-comp');
            });
          }

          ngOnInit() {
            log.push('pre-cd');
            this.changeDetectorRef.detectChanges();
            log.push('post-cd');
          }
        }

        TestBed.configureTestingModule({
          declarations: [ChildComp, ParentComp],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(ParentComp);
        expect(log).toEqual([]);

        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual(['pre-cd', 'post-cd', 'child-comp', 'parent-comp']);
      });

      it('should run hooks once after tick even if there are multiple root views', () => {
        let log: string[] = [];

        @Component({
          standalone: true,
          template: ``,
        })
        class MyComp {
          constructor() {
            afterRender(() => {
              log.push('render');
            });
          }
        }

        TestBed.configureTestingModule({
          // NgZone can make counting hard because it runs ApplicationRef.tick automatically.
          providers: [{provide: NgZone, useClass: NoopNgZone}, ...COMMON_CONFIGURATION.providers],
        });
        expect(log).toEqual([]);
        const appRef = TestBed.inject(ApplicationRef);
        appRef.attachView(TestBed.createComponent(MyComp).componentRef.hostView);
        appRef.attachView(TestBed.createComponent(MyComp).componentRef.hostView);
        appRef.attachView(TestBed.createComponent(MyComp).componentRef.hostView);
        appRef.tick();
        expect(log.length).toEqual(3);
      });

      it('should unsubscribe when calling destroy', () => {
        let hookRef: AfterRenderRef | null = null;
        let afterRenderCount = 0;

        @Component({
          selector: 'comp',
          standalone: false,
        })
        class Comp {
          constructor() {
            hookRef = afterRender(() => {
              afterRenderCount++;
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Comp);
        expect(afterRenderCount).toBe(0);

        TestBed.inject(ApplicationRef).tick();
        expect(afterRenderCount).toBe(1);

        TestBed.inject(ApplicationRef).tick();
        expect(afterRenderCount).toBe(2);
        hookRef!.destroy();

        TestBed.inject(ApplicationRef).tick();
        expect(afterRenderCount).toBe(2);
      });

      it('should run outside of the Angular zone', () => {
        const zoneLog: boolean[] = [];

        @Component({
          selector: 'comp',
          standalone: false,
        })
        class Comp {
          constructor() {
            afterRender(() => {
              zoneLog.push(NgZone.isInAngularZone());
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Comp);

        expect(zoneLog).toEqual([]);
        TestBed.inject(NgZone).run(() => {
          TestBed.inject(ApplicationRef).tick();
          expect(zoneLog).toEqual([false]);
        });
      });

      it('should propagate errors to the ErrorHandler', () => {
        const log: string[] = [];

        @Injectable()
        class FakeErrorHandler extends ErrorHandler {
          override handleError(error: any): void {
            log.push((error as Error).message);
          }
        }

        @Component({
          template: '',
          standalone: false,
        })
        class Comp {
          constructor() {
            afterRender(() => {
              log.push('pass 1');
            });

            afterRender(() => {
              throw new Error('fail 1');
            });

            afterRender(() => {
              log.push('pass 2');
            });

            afterRender(() => {
              throw new Error('fail 2');
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          providers: [COMMON_PROVIDERS, {provide: ErrorHandler, useClass: FakeErrorHandler}],
        });
        createAndAttachComponent(Comp);

        expect(log).toEqual([]);
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual(['pass 1', 'fail 1', 'pass 2', 'fail 2']);
      });

      it('should run callbacks in the correct phase and order', () => {
        const log: string[] = [];

        @Component({
          selector: 'root',
          template: `<comp-a></comp-a><comp-b></comp-b>`,
          standalone: false,
        })
        class Root {}

        @Component({
          selector: 'comp-a',
          standalone: false,
        })
        class CompA {
          constructor() {
            afterRender({
              earlyRead: () => {
                log.push('early-read-1');
              },
            });

            afterRender({
              write: () => {
                log.push('write-1');
              },
            });

            afterRender({
              mixedReadWrite: () => {
                log.push('mixed-read-write-1');
              },
            });

            afterRender({
              read: () => {
                log.push('read-1');
              },
            });
          }
        }

        @Component({
          selector: 'comp-b',
          standalone: false,
        })
        class CompB {
          constructor() {
            afterRender({
              read: () => {
                log.push('read-2');
              },
            });

            afterRender({
              mixedReadWrite: () => {
                log.push('mixed-read-write-2');
              },
            });

            afterRender({
              write: () => {
                log.push('write-2');
              },
            });

            afterRender({
              earlyRead: () => {
                log.push('early-read-2');
              },
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Root, CompA, CompB],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Root);

        expect(log).toEqual([]);
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual([
          'early-read-1',
          'early-read-2',
          'write-1',
          'write-2',
          'mixed-read-write-1',
          'mixed-read-write-2',
          'read-1',
          'read-2',
        ]);
      });

      it('should run callbacks in the correct phase and order when using deprecated phase flag', () => {
        const log: string[] = [];

        @Component({
          selector: 'root',
          template: `<comp-a></comp-a><comp-b></comp-b>`,
          standalone: false,
        })
        class Root {}

        @Component({
          selector: 'comp-a',
          standalone: false,
        })
        class CompA {
          constructor() {
            afterRender(
              () => {
                log.push('early-read-1');
              },
              {phase: AfterRenderPhase.EarlyRead},
            );

            afterRender(
              () => {
                log.push('write-1');
              },
              {phase: AfterRenderPhase.Write},
            );

            afterRender(
              () => {
                log.push('mixed-read-write-1');
              },
              {phase: AfterRenderPhase.MixedReadWrite},
            );

            afterRender(
              () => {
                log.push('read-1');
              },
              {phase: AfterRenderPhase.Read},
            );
          }
        }

        @Component({
          selector: 'comp-b',
          standalone: false,
        })
        class CompB {
          constructor() {
            afterRender(
              () => {
                log.push('read-2');
              },
              {phase: AfterRenderPhase.Read},
            );

            afterRender(
              () => {
                log.push('mixed-read-write-2');
              },
              {phase: AfterRenderPhase.MixedReadWrite},
            );

            afterRender(
              () => {
                log.push('write-2');
              },
              {phase: AfterRenderPhase.Write},
            );

            afterRender(
              () => {
                log.push('early-read-2');
              },
              {phase: AfterRenderPhase.EarlyRead},
            );
          }
        }

        TestBed.configureTestingModule({
          declarations: [Root, CompA, CompB],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Root);

        expect(log).toEqual([]);
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual([
          'early-read-1',
          'early-read-2',
          'write-1',
          'write-2',
          'mixed-read-write-1',
          'mixed-read-write-2',
          'read-1',
          'read-2',
        ]);
      });

      it('should schedule callbacks for multiple phases at once', () => {
        const log: string[] = [];

        @Component({
          selector: 'comp',
          standalone: false,
        })
        class Comp {
          constructor() {
            afterRender({
              earlyRead: () => {
                log.push('early-read-1');
              },
              write: () => {
                log.push('write-1');
              },
              mixedReadWrite: () => {
                log.push('mixed-read-write-1');
              },
              read: () => {
                log.push('read-1');
              },
            });

            afterRender(() => {
              log.push('mixed-read-write-2');
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Comp);

        expect(log).toEqual([]);
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual([
          'early-read-1',
          'write-1',
          'mixed-read-write-1',
          'mixed-read-write-2',
          'read-1',
        ]);
      });

      it('should pass data between phases', () => {
        const log: string[] = [];

        @Component({
          selector: 'comp',
          standalone: false,
        })
        class Comp {
          constructor() {
            afterRender({
              earlyRead: () => 'earlyRead result',
              write: (results) => {
                log.push(`results for write: ${results}`);
                return 5;
              },
              mixedReadWrite: (results) => {
                log.push(`results for mixedReadWrite: ${results}`);
                return undefined;
              },
              read: (results) => {
                log.push(`results for read: ${results}`);
              },
            });

            afterRender({
              earlyRead: () => 'earlyRead 2 result',
              read: (results) => {
                log.push(`results for read 2: ${results}`);
              },
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Comp);

        expect(log).toEqual([]);
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual([
          'results for write: earlyRead result',
          'results for mixedReadWrite: 5',
          'results for read: undefined',
          'results for read 2: earlyRead 2 result',
        ]);
      });

      describe('throw error inside reactive context', () => {
        it('inside template effect', () => {
          @Component({
            template: `{{someFn()}}`,
            standalone: false,
          })
          class TestCmp {
            someFn() {
              afterRender(() => {});
            }
          }

          const fixture = TestBed.createComponent(TestCmp);
          expect(() => fixture.detectChanges()).toThrowError(
            /afterRender\(\) cannot be called from within a reactive context/,
          );
        });

        it('inside computed', () => {
          const testComputed = computed(() => {
            afterRender(() => {});
          });

          expect(() => testComputed()).toThrowError(
            /afterRender\(\) cannot be called from within a reactive context/,
          );
        });

        it('inside effect', () => {
          @Component({
            template: ``,
            standalone: false,
          })
          class TestCmp {
            constructor() {
              effect(() => {
                this.someFnThatWillScheduleAfterRender();
              });
            }

            someFnThatWillScheduleAfterRender() {
              afterRender(() => {});
            }
          }

          TestBed.configureTestingModule({
            providers: [
              {
                provide: ErrorHandler,
                useClass: class extends ErrorHandler {
                  override handleError(e: Error) {
                    throw e;
                  }
                },
              },
            ],
          });
          const fixture = TestBed.createComponent(TestCmp);

          expect(() => fixture.detectChanges()).toThrowError(
            /afterRender\(\) cannot be called from within a reactive context/,
          );
        });
      });

      it('should not destroy automatically if manualCleanup is set', () => {
        let afterRenderRef: AfterRenderRef | null = null;
        let count = 0;

        @Component({selector: 'comp', template: '', standalone: false})
        class Comp {
          constructor() {
            afterRenderRef = afterRender(() => count++, {manualCleanup: true});
          }
        }

        @Component({
          imports: [Comp],
          standalone: false,
          template: `
            @if (shouldShow) {
              <comp/>
            }
          `,
        })
        class App {
          shouldShow = true;
        }

        TestBed.configureTestingModule({
          declarations: [App, Comp],
          ...COMMON_CONFIGURATION,
        });
        const component = createAndAttachComponent(App);
        const appRef = TestBed.inject(ApplicationRef);
        expect(count).toBe(0);

        appRef.tick();
        expect(count).toBe(1);

        component.instance.shouldShow = false;
        component.changeDetectorRef.detectChanges();
        appRef.tick();
        expect(count).toBe(2);
        appRef.tick();
        expect(count).toBe(3);

        // Ensure that manual destruction still works.
        afterRenderRef!.destroy();
        appRef.tick();
        expect(count).toBe(3);
      });
    });

    describe('afterNextRender', () => {
      it('should run with the correct timing', () => {
        @Component({
          selector: 'dynamic-comp',
          standalone: false,
        })
        class DynamicComp {
          afterRenderCount = 0;

          constructor() {
            afterNextRender(() => {
              this.afterRenderCount++;
            });
          }
        }

        @Component({
          selector: 'comp',
          standalone: false,
        })
        class Comp {
          afterRenderCount = 0;
          changeDetectorRef = inject(ChangeDetectorRef);
          viewContainerRef = inject(ViewContainerRef);

          constructor() {
            afterNextRender(() => {
              this.afterRenderCount++;
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        const component = createAndAttachComponent(Comp);
        const compInstance = component.instance;
        const viewContainerRef = compInstance.viewContainerRef;
        const dynamicCompRef = viewContainerRef.createComponent(DynamicComp);

        // It hasn't run at all
        expect(dynamicCompRef.instance.afterRenderCount).toBe(0);
        expect(compInstance.afterRenderCount).toBe(0);

        // Running change detection at the dynamicCompRef level
        dynamicCompRef.changeDetectorRef.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(0);
        expect(compInstance.afterRenderCount).toBe(0);

        // Running change detection at the compInstance level
        compInstance.changeDetectorRef.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(0);
        expect(compInstance.afterRenderCount).toBe(0);

        // Running change detection at the Application level
        TestBed.inject(ApplicationRef).tick();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(1);
        expect(compInstance.afterRenderCount).toBe(1);

        // Running change detection after removing view.
        viewContainerRef.remove();
        TestBed.inject(ApplicationRef).tick();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(1);
        expect(compInstance.afterRenderCount).toBe(1);
      });

      it('should not run until views have stabilized', async () => {
        // This test uses two components, a Reader and Writer, and arranges CD so that Reader
        // is checked, and then Writer makes Reader dirty again. An `afterNextRender` should not run
        // until Reader has been fully refreshed.

        TestBed.configureTestingModule(COMMON_CONFIGURATION);
        const appRef = TestBed.inject(ApplicationRef);

        const counter = signal(0);
        @Component({standalone: true, template: '{{counter()}}'})
        class Reader {
          counter = counter;
        }

        @Component({standalone: true, template: ''})
        class Writer {
          ngAfterViewInit(): void {
            counter.set(1);
          }
        }

        const ref = createAndAttachComponent(Reader);
        createAndAttachComponent(Writer);

        let textAtAfterRender: string = '';
        afterNextRender(
          () => {
            // Reader should've been fully refreshed, so capture its template state at this moment.
            textAtAfterRender = ref.location.nativeElement.innerHTML;
          },
          {injector: appRef.injector},
        );

        await appRef.whenStable();
        expect(textAtAfterRender).toBe('1');
      });

      it('should run all hooks after outer change detection', () => {
        let log: string[] = [];

        @Component({
          selector: 'child-comp',
          standalone: false,
        })
        class ChildComp {
          constructor() {
            afterNextRender(() => {
              log.push('child-comp');
            });
          }
        }

        @Component({
          selector: 'parent',
          template: `<child-comp></child-comp>`,
          standalone: false,
        })
        class ParentComp {
          changeDetectorRef = inject(ChangeDetectorRef);

          constructor() {
            afterNextRender(() => {
              log.push('parent-comp');
            });
          }

          ngOnInit() {
            log.push('pre-cd');
            this.changeDetectorRef.detectChanges();
            log.push('post-cd');
          }
        }

        TestBed.configureTestingModule({
          declarations: [ChildComp, ParentComp],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(ParentComp);
        expect(log).toEqual([]);

        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual(['pre-cd', 'post-cd', 'child-comp', 'parent-comp']);
      });

      it('should unsubscribe when calling destroy', () => {
        let hookRef: AfterRenderRef | null = null;
        let afterRenderCount = 0;

        @Component({
          selector: 'comp',
          standalone: false,
        })
        class Comp {
          constructor() {
            hookRef = afterNextRender(() => {
              afterRenderCount++;
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Comp);
        expect(afterRenderCount).toBe(0);

        hookRef!.destroy();
        TestBed.inject(ApplicationRef).tick();
        expect(afterRenderCount).toBe(0);
      });

      it('should throw if called recursively', () => {
        class RethrowErrorHandler extends ErrorHandler {
          override handleError(error: any): void {
            throw error;
          }
        }

        @Component({
          selector: 'comp',
          standalone: false,
        })
        class Comp {
          appRef = inject(ApplicationRef);
          injector = inject(EnvironmentInjector);

          ngOnInit() {
            afterNextRender(
              () => {
                this.appRef.tick();
              },
              {injector: this.injector},
            );
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
          providers: [
            {provide: ErrorHandler, useClass: RethrowErrorHandler},
            ...COMMON_CONFIGURATION.providers,
          ],
        });
        createAndAttachComponent(Comp);
        expect(() => TestBed.inject(ApplicationRef).tick()).toThrowError(
          /ApplicationRef.tick is called recursively/,
        );
      });

      it('should process inner hook within same tick with CD in between', () => {
        @Component({
          selector: 'comp',
          standalone: false,
          template: `{{outerHookCount()}}:{{innerHookCount}}`,
          changeDetection: ChangeDetectionStrategy.OnPush,
        })
        class Comp {
          injector = inject(Injector);
          outerHookCount = signal(0);
          innerHookCount = 0;

          constructor() {
            afterNextRender(() => {
              this.outerHookCount.update((v) => v + 1);
              afterNextRender(
                () => {
                  this.innerHookCount++;
                },
                {injector: this.injector},
              );
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        const ref = createAndAttachComponent(Comp);
        const instance = ref.instance;

        // It hasn't run at all
        expect(instance.outerHookCount()).toBe(0);
        expect(instance.innerHookCount).toBe(0);

        // Running change detection (first time)
        TestBed.inject(ApplicationRef).tick();
        expect(instance.outerHookCount()).toBe(1);
        expect(instance.innerHookCount).toBe(1);

        // In between the inner and outer hook, CD should have run for the component.
        expect(ref.location.nativeElement.innerHTML).toEqual('1:0');

        // Running change detection (second time)
        TestBed.inject(ApplicationRef).tick();
        expect(instance.outerHookCount()).toBe(1);
        expect(instance.innerHookCount).toBe(1);
      });

      it('should defer view-associated hook until after view is rendered', () => {
        const log: string[] = [];

        @Component({
          selector: 'inner',
          standalone: false,
          changeDetection: ChangeDetectionStrategy.OnPush,
        })
        class Inner {
          constructor() {
            afterNextRender(() => {
              log.push('comp hook');
            });
          }
        }

        @Component({
          selector: 'outer',
          standalone: false,
          template: '<inner></inner>',
          changeDetection: ChangeDetectionStrategy.OnPush,
        })
        class Outer {
          changeDetectorRef = inject(ChangeDetectorRef);
        }

        TestBed.configureTestingModule({
          declarations: [Inner, Outer],
          ...COMMON_CONFIGURATION,
        });

        const ref = createAndAttachComponent(Outer);
        ref.instance.changeDetectorRef.detach();

        const appRef = TestBed.inject(ApplicationRef);
        afterNextRender(
          () => {
            log.push('env hook');
          },
          {injector: appRef.injector},
        );

        // Initial change detection with component detached.
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual(['env hook']);

        // Re-attach component and run change detection.
        ref.instance.changeDetectorRef.reattach();
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual(['env hook', 'comp hook']);
      });

      it('should run outside of the Angular zone', () => {
        const zoneLog: boolean[] = [];

        @Component({
          selector: 'comp',
          standalone: false,
        })
        class Comp {
          constructor() {
            afterNextRender(() => {
              zoneLog.push(NgZone.isInAngularZone());
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Comp);

        expect(zoneLog).toEqual([]);
        TestBed.inject(NgZone).run(() => {
          TestBed.inject(ApplicationRef).tick();
          expect(zoneLog).toEqual([false]);
        });
      });

      it('should propagate errors to the ErrorHandler', () => {
        const log: string[] = [];

        class FakeErrorHandler extends ErrorHandler {
          override handleError(error: any): void {
            log.push((error as Error).message);
          }
        }

        @Component({
          template: '',
          standalone: false,
        })
        class Comp {
          constructor() {
            afterNextRender(() => {
              log.push('pass 1');
            });

            afterNextRender(() => {
              throw new Error('fail 1');
            });

            afterNextRender(() => {
              log.push('pass 2');
            });

            afterNextRender(() => {
              throw new Error('fail 2');
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          providers: [COMMON_PROVIDERS, {provide: ErrorHandler, useClass: FakeErrorHandler}],
        });
        createAndAttachComponent(Comp);

        expect(log).toEqual([]);
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual(['pass 1', 'fail 1', 'pass 2', 'fail 2']);
      });

      it('should run callbacks in the correct phase and order', () => {
        const log: string[] = [];

        @Component({
          selector: 'root',
          template: `<comp-a></comp-a><comp-b></comp-b>`,
          standalone: false,
        })
        class Root {}

        @Component({
          selector: 'comp-a',
          standalone: false,
        })
        class CompA {
          constructor() {
            afterNextRender({
              earlyRead: () => {
                log.push('early-read-1');
              },
            });

            afterNextRender({
              write: () => {
                log.push('write-1');
              },
            });

            afterNextRender({
              mixedReadWrite: () => {
                log.push('mixed-read-write-1');
              },
            });

            afterNextRender({
              read: () => {
                log.push('read-1');
              },
            });
          }
        }

        @Component({
          selector: 'comp-b',
          standalone: false,
        })
        class CompB {
          constructor() {
            afterNextRender({
              read: () => {
                log.push('read-2');
              },
            });

            afterNextRender({
              mixedReadWrite: () => {
                log.push('mixed-read-write-2');
              },
            });

            afterNextRender({
              write: () => {
                log.push('write-2');
              },
            });

            afterNextRender({
              earlyRead: () => {
                log.push('early-read-2');
              },
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Root, CompA, CompB],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Root);

        expect(log).toEqual([]);
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual([
          'early-read-1',
          'early-read-2',
          'write-1',
          'write-2',
          'mixed-read-write-1',
          'mixed-read-write-2',
          'read-1',
          'read-2',
        ]);
      });

      it('should invoke all the callbacks once when they are registered at the same time', () => {
        const log: string[] = [];

        @Component({
          template: '',
          standalone: false,
        })
        class Comp {
          constructor() {
            afterNextRender({
              earlyRead: () => {
                log.push('early-read');
              },
              write: () => {
                log.push('write');
              },
              mixedReadWrite: () => {
                log.push('mixed-read-write');
              },
              read: () => {
                log.push('read');
              },
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Comp);

        expect(log).toEqual([]);
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual(['early-read', 'write', 'mixed-read-write', 'read']);
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual(['early-read', 'write', 'mixed-read-write', 'read']);
      });

      it('should invoke all the callbacks each time when they are registered at the same time', () => {
        const log: string[] = [];

        @Component({
          template: '',
          standalone: false,
        })
        class Comp {
          constructor() {
            afterRender({
              earlyRead: () => {
                log.push('early-read');
                return 'early';
              },
              write: (previous) => {
                log.push(`previous was ${previous}, this is write`);
                return 'write';
              },
              mixedReadWrite: (previous) => {
                log.push(`previous was ${previous}, this is mixed-read-write`);
                return 'mixed';
              },
              read: (previous) => {
                log.push(`previous was ${previous}, this is read`);
                return 'read';
              },
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Comp);

        expect(log).toEqual([]);
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual([
          'early-read',
          'previous was early, this is write',
          'previous was write, this is mixed-read-write',
          'previous was mixed, this is read',
        ]);
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual([
          'early-read',
          'previous was early, this is write',
          'previous was write, this is mixed-read-write',
          'previous was mixed, this is read',
          'early-read',
          'previous was early, this is write',
          'previous was write, this is mixed-read-write',
          'previous was mixed, this is read',
        ]);
      });
    });

    it('allows writing to a signal in afterRender', () => {
      const counter = signal(0);

      @Component({
        selector: 'test-component',
        standalone: true,
        template: ` {{counter()}} `,
      })
      class TestCmp {
        counter = counter;
        injector = inject(EnvironmentInjector);
        ngOnInit() {
          afterNextRender(
            () => {
              this.counter.set(1);
            },
            {injector: this.injector},
          );
        }
      }
      TestBed.configureTestingModule({
        providers: [{provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID}],
      });

      const fixture = TestBed.createComponent(TestCmp);
      const appRef = TestBed.inject(ApplicationRef);
      appRef.attachView(fixture.componentRef.hostView);
      appRef.tick();
      expect(fixture.nativeElement.innerText).toBe('1');
    });

    it('allows updating state and calling markForCheck in afterRender', async () => {
      @Component({
        selector: 'test-component',
        standalone: true,
        template: ` {{counter}} `,
      })
      class TestCmp {
        counter = 0;
        injector = inject(EnvironmentInjector);
        cdr = inject(ChangeDetectorRef);
        ngOnInit() {
          afterNextRender(
            () => {
              this.counter = 1;
              this.cdr.markForCheck();
            },
            {injector: this.injector},
          );
        }
      }
      TestBed.configureTestingModule({
        providers: [{provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID}],
      });

      const fixture = TestBed.createComponent(TestCmp);
      const appRef = TestBed.inject(ApplicationRef);
      appRef.attachView(fixture.componentRef.hostView);
      await appRef.whenStable();
      expect(fixture.nativeElement.innerText).toBe('1');
    });

    it('allows updating state and calling markForCheck in afterRender, outside of change detection', async () => {
      const counter = signal(0);
      @Component({
        selector: 'test-component',
        standalone: true,
        template: `{{counter()}}`,
      })
      class TestCmp {
        injector = inject(EnvironmentInjector);
        counter = counter;
        async ngOnInit() {
          // push the render hook to a time outside of change detection
          await new Promise<void>((resolve) => setTimeout(resolve));
          afterNextRender(
            () => {
              counter.set(1);
            },
            {injector: this.injector},
          );
        }
      }
      TestBed.configureTestingModule({
        providers: [{provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID}],
      });

      const fixture = TestBed.createComponent(TestCmp);
      const appRef = TestBed.inject(ApplicationRef);
      appRef.attachView(fixture.componentRef.hostView);
      await new Promise<void>((resolve) => {
        TestBed.runInInjectionContext(() => {
          effect(() => {
            if (counter() === 1) {
              resolve();
            }
          });
        });
      });
      await firstValueFrom(appRef.isStable.pipe(filter((stable) => stable)));
      expect(fixture.nativeElement.innerText).toBe('1');
    });

    it('throws error when causing infinite updates', () => {
      const counter = signal(0);

      @Component({
        selector: 'test-component',
        standalone: true,
        template: ` {{counter()}} `,
      })
      class TestCmp {
        counter = counter;
        injector = inject(EnvironmentInjector);
        ngOnInit() {
          afterRender(
            () => {
              this.counter.update((v) => v + 1);
            },
            {injector: this.injector},
          );
        }
      }
      TestBed.configureTestingModule({
        providers: [
          {provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID},
          {
            provide: ErrorHandler,
            useClass: class extends ErrorHandler {
              override handleError(error: any) {
                throw error;
              }
            },
          },
        ],
      });

      const fixture = TestBed.createComponent(TestCmp);
      const appRef = TestBed.inject(ApplicationRef);
      appRef.attachView(fixture.componentRef.hostView);
      expect(() => {
        appRef.tick();
      }).toThrowError(/NG0103.*(Infinite change detection while refreshing application views)/);
    });

    it('should destroy after the hook has run', () => {
      let hookRef: AfterRenderRef | null = null;
      let afterRenderCount = 0;

      @Component({selector: 'comp', standalone: false})
      class Comp {
        constructor() {
          hookRef = afterNextRender(() => {
            afterRenderCount++;
          });
        }
      }

      TestBed.configureTestingModule({
        declarations: [Comp],
        ...COMMON_CONFIGURATION,
      });
      createAndAttachComponent(Comp);
      const appRef = TestBed.inject(ApplicationRef);
      const destroySpy = spyOn(hookRef!, 'destroy').and.callThrough();
      expect(afterRenderCount).toBe(0);
      expect(destroySpy).not.toHaveBeenCalled();

      // Run once and ensure that it was called and then cleaned up.
      appRef.tick();
      expect(afterRenderCount).toBe(1);
      expect(destroySpy).toHaveBeenCalledTimes(1);

      // Make sure we're not retaining it.
      appRef.tick();
      expect(afterRenderCount).toBe(1);
      expect(destroySpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('server', () => {
    const COMMON_CONFIGURATION = {
      providers: [{provide: PLATFORM_ID, useValue: PLATFORM_SERVER_ID}],
    };

    beforeAll(() => {
      globalThis['ngServerMode'] = true;
    });

    afterAll(() => {
      globalThis['ngServerMode'] = undefined;
    });

    describe('afterRender', () => {
      it('should not run', () => {
        let afterRenderCount = 0;

        @Component({
          selector: 'comp',
          standalone: false,
        })
        class Comp {
          constructor() {
            afterRender(() => {
              afterRenderCount++;
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Comp);
        TestBed.inject(ApplicationRef).tick();
        expect(afterRenderCount).toBe(0);
      });
    });

    describe('afterNextRender', () => {
      it('should not run', () => {
        let afterRenderCount = 0;

        @Component({
          selector: 'comp',
          standalone: false,
        })
        class Comp {
          constructor() {
            afterNextRender(() => {
              afterRenderCount++;
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Comp);
        TestBed.inject(ApplicationRef).tick();
        expect(afterRenderCount).toBe(0);
      });
    });
  });
});

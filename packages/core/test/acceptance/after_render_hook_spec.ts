/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PLATFORM_BROWSER_ID, PLATFORM_SERVER_ID} from '@angular/common/src/platform_id';
import {
  AfterRenderRef,
  ApplicationRef,
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
  ɵinternalAfterNextRender as internalAfterNextRender,
  ɵqueueStateUpdate as queueStateUpdate,
  signal,
  untracked,
} from '@angular/core';
import {NoopNgZone} from '@angular/core/src/zone/ng_zone';
import {TestBed} from '@angular/core/testing';
import {bootstrapApplication} from '@angular/platform-browser';
import {withBody} from '@angular/private/testing';

import {AfterRenderPhase} from '@angular/core/src/render3/after_render_hooks';
import {firstValueFrom} from 'rxjs';
import {filter} from 'rxjs/operators';
import {destroyPlatform} from '../../src/core';
import {EnvironmentInjector} from '../../src/di';

function createAndAttachComponent<T>(component: Type<T>) {
  const componentRef = createComponent(component, {
    environmentInjector: TestBed.inject(EnvironmentInjector),
  });
  TestBed.inject(ApplicationRef).attachView(componentRef.hostView);
  return componentRef;
}

describe('after render hooks', () => {
  describe('browser', () => {
    const COMMON_CONFIGURATION = {
      providers: [{provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID}],
    };

    describe('internalAfterNextRender', () => {
      it('should run with the expected timing', () => {
        const log: string[] = [];

        @Component({selector: 'comp'})
        class Comp {
          constructor() {
            // Helper to register into each phase
            function forEachPhase(
              fn: (phase: 'earlyRead' | 'write' | 'mixedReadWrite' | 'read') => void,
            ) {
              for (const phase of ['earlyRead', 'write', 'mixedReadWrite', 'read'] as const) {
                fn(phase);
              }
            }

            internalAfterNextRender(() => {
              log.push('internalAfterNextRender #1');
            });

            forEachPhase((phase) =>
              afterRender({
                [phase]: () => {
                  log.push(`afterRender (${phase})`);
                },
              }),
            );

            internalAfterNextRender(() => {
              log.push('internalAfterNextRender #2');
            });

            forEachPhase((phase) =>
              afterNextRender({
                [phase]: () => {
                  log.push(`afterNextRender (${phase})`);
                },
              }),
            );

            internalAfterNextRender(() => {
              log.push('internalAfterNextRender #3');
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Comp);

        // It hasn't run at all
        expect(log).toEqual([]);

        // Running change detection once
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual([
          'internalAfterNextRender #1',
          'internalAfterNextRender #2',
          'internalAfterNextRender #3',
          'afterRender (earlyRead)',
          'afterNextRender (earlyRead)',
          'afterRender (write)',
          'afterNextRender (write)',
          'afterRender (mixedReadWrite)',
          'afterNextRender (mixedReadWrite)',
          'afterRender (read)',
          'afterNextRender (read)',
        ]);

        // Running change detection again
        log.length = 0;
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual([
          'afterRender (earlyRead)',
          'afterRender (write)',
          'afterRender (mixedReadWrite)',
          'afterRender (read)',
        ]);
      });

      it('should refresh views if state changed before user-defined render hooks', () => {
        let stateInAfterNextRender: number | null = null;
        let stateInAfterRender: number | null = null;
        let afterRenderRuns = 0;
        TestBed.configureTestingModule({
          ...COMMON_CONFIGURATION,
        });
        @Component({
          template: '{{state()}}',
          standalone: true,
        })
        class App {
          state = signal(1);
          constructor() {
            queueStateUpdate(() => {
              this.state.set(2);
            });
            afterNextRender(() => {
              stateInAfterNextRender = untracked(this.state);
            });
            afterRender(() => {
              stateInAfterRender = untracked(this.state);
              afterRenderRuns++;
            });
          }
        }

        createAndAttachComponent(App);
        TestBed.inject(ApplicationRef).tick();
        expect(afterRenderRuns).toEqual(1);
        expect(stateInAfterNextRender!).toEqual(2);
        expect(stateInAfterRender!).toEqual(2);
      });

      it(
        'does not execute queueStateUpdate if application is destroyed',
        withBody('<app></app>', async () => {
          destroyPlatform();
          let executedCallback = false;
          TestBed.configureTestingModule({
            ...COMMON_CONFIGURATION,
          });
          @Component({
            template: '',
            selector: 'app',
            standalone: true,
          })
          class App {}

          const app = await bootstrapApplication(App);
          queueStateUpdate(
            () => {
              executedCallback = true;
            },
            {injector: app.injector},
          );
          app.destroy();

          // wait a macrotask - at this point the Promise in queueStateUpdate will have been
          // resolved
          await new Promise((resolve) => setTimeout(resolve));
          expect(executedCallback).toBeFalse();
          destroyPlatform();
        }),
      );
    });

    describe('afterRender', () => {
      it('should run with the correct timing', () => {
        @Component({selector: 'dynamic-comp'})
        class DynamicComp {
          afterRenderCount = 0;

          constructor() {
            afterRender(() => {
              this.afterRenderCount++;
            });
          }
        }

        @Component({selector: 'comp'})
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
        @Component({selector: 'dynamic-comp'})
        class DynamicComp {
          afterRenderCount = 0;

          constructor() {
            afterRender(() => {
              this.afterRenderCount++;
            });
          }
        }

        @Component({selector: 'comp'})
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
        expect(compInstance.afterRenderCount).toBe(1);

        // Running change detection at the dynamicCompRef level
        dynamicCompRef.changeDetectorRef.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(0);
        expect(compInstance.afterRenderCount).toBe(1);

        // Running change detection at the compInstance level
        compInstance.changeDetectorRef.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(0);
        expect(compInstance.afterRenderCount).toBe(1);

        // Running change detection at the Application level
        fixture.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(1);
        expect(compInstance.afterRenderCount).toBe(2);

        // Running change detection after removing view.
        viewContainerRef.remove();
        fixture.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(1);
        expect(compInstance.afterRenderCount).toBe(3);
      });

      it('should run all hooks after outer change detection', () => {
        let log: string[] = [];

        @Component({selector: 'child-comp'})
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
        expect(log).toEqual(['pre-cd', 'post-cd', 'parent-comp', 'child-comp']);
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

        @Component({selector: 'comp'})
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

      it('should defer nested hooks to the next cycle', () => {
        let outerHookCount = 0;
        let innerHookCount = 0;

        @Component({selector: 'comp'})
        class Comp {
          injector = inject(Injector);

          constructor() {
            afterRender(() => {
              outerHookCount++;
              afterNextRender(
                () => {
                  innerHookCount++;
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
        createAndAttachComponent(Comp);

        // It hasn't run at all
        expect(outerHookCount).toBe(0);
        expect(innerHookCount).toBe(0);

        // Running change detection (first time)
        TestBed.inject(ApplicationRef).tick();
        expect(outerHookCount).toBe(1);
        expect(innerHookCount).toBe(0);

        // Running change detection (second time)
        TestBed.inject(ApplicationRef).tick();
        expect(outerHookCount).toBe(2);
        expect(innerHookCount).toBe(1);

        // Running change detection (third time)
        TestBed.inject(ApplicationRef).tick();
        expect(outerHookCount).toBe(3);
        expect(innerHookCount).toBe(2);
      });

      it('should run outside of the Angular zone', () => {
        const zoneLog: boolean[] = [];

        @Component({selector: 'comp'})
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

        class FakeErrorHandler extends ErrorHandler {
          override handleError(error: any): void {
            log.push((error as Error).message);
          }
        }

        @Component({
          selector: 'comp',
          providers: [{provide: ErrorHandler, useFactory: () => new FakeErrorHandler()}],
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
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Comp);

        expect(log).toEqual([]);
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual(['pass 1', 'fail 1', 'pass 2', 'fail 2']);
      });

      it('should run callbacks in the correct phase and order', () => {
        const log: string[] = [];

        @Component({selector: 'root', template: `<comp-a></comp-a><comp-b></comp-b>`})
        class Root {}

        @Component({selector: 'comp-a'})
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

        @Component({selector: 'comp-b'})
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

        @Component({selector: 'root', template: `<comp-a></comp-a><comp-b></comp-b>`})
        class Root {}

        @Component({selector: 'comp-a'})
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

        @Component({selector: 'comp-b'})
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

        @Component({selector: 'comp'})
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

        @Component({selector: 'comp'})
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
          @Component({template: `{{someFn()}}`})
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
          @Component({template: ``})
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
    });

    describe('afterNextRender', () => {
      it('should run with the correct timing', () => {
        @Component({selector: 'dynamic-comp'})
        class DynamicComp {
          afterRenderCount = 0;

          constructor() {
            afterNextRender(() => {
              this.afterRenderCount++;
            });
          }
        }

        @Component({selector: 'comp'})
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

      it('should run all hooks after outer change detection', () => {
        let log: string[] = [];

        @Component({selector: 'child-comp'})
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
        expect(log).toEqual(['pre-cd', 'post-cd', 'parent-comp', 'child-comp']);
      });

      it('should unsubscribe when calling destroy', () => {
        let hookRef: AfterRenderRef | null = null;
        let afterRenderCount = 0;

        @Component({selector: 'comp'})
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

      it('should defer nested hooks to the next cycle', () => {
        let outerHookCount = 0;
        let innerHookCount = 0;

        @Component({selector: 'comp'})
        class Comp {
          injector = inject(Injector);

          constructor() {
            afterNextRender(() => {
              outerHookCount++;

              afterNextRender(
                () => {
                  innerHookCount++;
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
        createAndAttachComponent(Comp);

        // It hasn't run at all
        expect(outerHookCount).toBe(0);
        expect(innerHookCount).toBe(0);

        // Running change detection (first time)
        TestBed.inject(ApplicationRef).tick();
        expect(outerHookCount).toBe(1);
        expect(innerHookCount).toBe(0);

        // Running change detection (second time)
        TestBed.inject(ApplicationRef).tick();
        expect(outerHookCount).toBe(1);
        expect(innerHookCount).toBe(1);

        // Running change detection (third time)
        TestBed.inject(ApplicationRef).tick();
        expect(outerHookCount).toBe(1);
        expect(innerHookCount).toBe(1);
      });

      it('should run outside of the Angular zone', () => {
        const zoneLog: boolean[] = [];

        @Component({selector: 'comp'})
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
          selector: 'comp',
          providers: [{provide: ErrorHandler, useFactory: () => new FakeErrorHandler()}],
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
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Comp);

        expect(log).toEqual([]);
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual(['pass 1', 'fail 1', 'pass 2', 'fail 2']);
      });

      it('should run callbacks in the correct phase and order', () => {
        const log: string[] = [];

        @Component({selector: 'root', template: `<comp-a></comp-a><comp-b></comp-b>`})
        class Root {}

        @Component({selector: 'comp-a'})
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

        @Component({selector: 'comp-b'})
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
      await firstValueFrom(appRef.isStable.pipe(filter((stable) => stable)));
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
  });

  describe('server', () => {
    const COMMON_CONFIGURATION = {
      providers: [{provide: PLATFORM_ID, useValue: PLATFORM_SERVER_ID}],
    };

    describe('afterRender', () => {
      it('should not run', () => {
        let afterRenderCount = 0;

        @Component({selector: 'comp'})
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

        @Component({selector: 'comp'})
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

    describe('queueStateUpdate', () => {
      it('should run', () => {
        let executionCount = 0;

        @Component({selector: 'comp'})
        class Comp {
          constructor() {
            queueStateUpdate(() => {
              executionCount++;
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        createAndAttachComponent(Comp);
        TestBed.inject(ApplicationRef).tick();
        expect(executionCount).toBe(1);
      });
    });
  });
});

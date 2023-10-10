/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PLATFORM_BROWSER_ID, PLATFORM_SERVER_ID} from '@angular/common/src/platform_id';
import {afterNextRender, afterRender, AfterRenderPhase, AfterRenderRef, ChangeDetectorRef, Component, computed, effect, ErrorHandler, inject, Injector, NgZone, PLATFORM_ID, ViewContainerRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('after render hooks', () => {
  describe('browser', () => {
    const COMMON_CONFIGURATION = {
      providers: [{provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID}]
    };

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
        const fixture = TestBed.createComponent(Comp);
        const compInstance = fixture.componentInstance;
        const viewContainerRef = compInstance.viewContainerRef;
        const dynamicCompRef = viewContainerRef.createComponent(DynamicComp);

        // It hasn't run at all
        expect(dynamicCompRef.instance.afterRenderCount).toBe(0);
        expect(compInstance.afterRenderCount).toBe(0);

        // Running change detection at the dynamicCompRef level
        dynamicCompRef.changeDetectorRef.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(1);
        expect(compInstance.afterRenderCount).toBe(1);

        // Running change detection at the compInstance level
        compInstance.changeDetectorRef.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(2);
        expect(compInstance.afterRenderCount).toBe(2);

        // Running change detection at the fixture level (first time)
        fixture.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(3);
        expect(compInstance.afterRenderCount).toBe(3);

        // Running change detection at the fixture level (second time)
        fixture.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(4);
        expect(compInstance.afterRenderCount).toBe(4);

        // Running change detection at the fixture level (third time)
        fixture.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(5);
        expect(compInstance.afterRenderCount).toBe(5);

        // Running change detection after removing view.
        viewContainerRef.remove();
        fixture.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(5);
        expect(compInstance.afterRenderCount).toBe(6);
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
        const fixture = TestBed.createComponent(ParentComp);
        expect(log).toEqual([]);

        fixture.detectChanges();
        expect(log).toEqual(['pre-cd', 'post-cd', 'parent-comp', 'child-comp']);
      });

      it('should unsubscribe when calling destroy', () => {
        let hookRef: AfterRenderRef|null = null;
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
        const fixture = TestBed.createComponent(Comp);
        expect(afterRenderCount).toBe(0);

        fixture.detectChanges();
        expect(afterRenderCount).toBe(1);

        fixture.detectChanges();
        expect(afterRenderCount).toBe(2);
        hookRef!.destroy();

        fixture.detectChanges();
        expect(afterRenderCount).toBe(2);
      });

      it('should throw if called recursively', () => {
        class RethrowErrorHandler extends ErrorHandler {
          override handleError(error: any): void {
            throw error;
          }
        }

        @Component({
          selector: 'comp',
          providers: [{provide: ErrorHandler, useFactory: () => new RethrowErrorHandler()}]
        })
        class Comp {
          changeDetectorRef = inject(ChangeDetectorRef);

          constructor() {
            afterRender(() => {
              this.changeDetectorRef.detectChanges();
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        const fixture = TestBed.createComponent(Comp);
        expect(() => fixture.detectChanges())
            .toThrowError(/A new render operation began before the previous operation ended./);
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
              afterNextRender(() => {
                innerHookCount++;
              }, {injector: this.injector});
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        const fixture = TestBed.createComponent(Comp);

        // It hasn't run at all
        expect(outerHookCount).toBe(0);
        expect(innerHookCount).toBe(0);

        // Running change detection (first time)
        fixture.detectChanges();
        expect(outerHookCount).toBe(1);
        expect(innerHookCount).toBe(0);

        // Running change detection (second time)
        fixture.detectChanges();
        expect(outerHookCount).toBe(2);
        expect(innerHookCount).toBe(1);

        // Running change detection (third time)
        fixture.detectChanges();
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
        const fixture = TestBed.createComponent(Comp);

        expect(zoneLog).toEqual([]);
        fixture.detectChanges();
        expect(zoneLog).toEqual([false]);
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
          providers: [{provide: ErrorHandler, useFactory: () => new FakeErrorHandler()}]
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
        const fixture = TestBed.createComponent(Comp);

        expect(log).toEqual([]);
        fixture.detectChanges();
        expect(log).toEqual(['pass 1', 'fail 1', 'pass 2', 'fail 2']);
      });

      it('should run callbacks in the correct phase and order', () => {
        const log: string[] = [];

        @Component({selector: 'root', template: `<comp-a></comp-a><comp-b></comp-b>`})
        class Root {
        }

        @Component({selector: 'comp-a'})
        class CompA {
          constructor() {
            afterRender(() => {
              log.push('early-read-1');
            }, {phase: AfterRenderPhase.EarlyRead});

            afterRender(() => {
              log.push('write-1');
            }, {phase: AfterRenderPhase.Write});

            afterRender(() => {
              log.push('mixed-read-write-1');
            }, {phase: AfterRenderPhase.MixedReadWrite});

            afterRender(() => {
              log.push('read-1');
            }, {phase: AfterRenderPhase.Read});
          }
        }

        @Component({selector: 'comp-b'})
        class CompB {
          constructor() {
            afterRender(() => {
              log.push('read-2');
            }, {phase: AfterRenderPhase.Read});

            afterRender(() => {
              log.push('mixed-read-write-2');
            }, {phase: AfterRenderPhase.MixedReadWrite});

            afterRender(() => {
              log.push('write-2');
            }, {phase: AfterRenderPhase.Write});

            afterRender(() => {
              log.push('early-read-2');
            }, {phase: AfterRenderPhase.EarlyRead});
          }
        }

        TestBed.configureTestingModule({
          declarations: [Root, CompA, CompB],
          ...COMMON_CONFIGURATION,
        });
        const fixture = TestBed.createComponent(Root);

        expect(log).toEqual([]);
        fixture.detectChanges();
        expect(log).toEqual([
          'early-read-1', 'early-read-2', 'write-1', 'write-2', 'mixed-read-write-1',
          'mixed-read-write-2', 'read-1', 'read-2'
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
          expect(() => fixture.detectChanges())
              .toThrowError(/afterRender\(\) cannot be called from within a reactive context/);
        });

        it('inside computed', () => {
          const testComputed = computed(() => {
            afterRender(() => {});
          });

          expect(() => testComputed())
              .toThrowError(/afterRender\(\) cannot be called from within a reactive context/);
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
                provide: ErrorHandler, useClass: class extends ErrorHandler{
                  override handleError(e: Error) {
                    throw e;
                  }
                },
              },
            ]
          });
          TestBed.createComponent(TestCmp);

          expect(() => TestBed.flushEffects())
              .toThrowError(/afterRender\(\) cannot be called from within a reactive context/);
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
        const fixture = TestBed.createComponent(Comp);
        const compInstance = fixture.componentInstance;
        const viewContainerRef = compInstance.viewContainerRef;
        const dynamicCompRef = viewContainerRef.createComponent(DynamicComp);

        // It hasn't run at all
        expect(dynamicCompRef.instance.afterRenderCount).toBe(0);
        expect(compInstance.afterRenderCount).toBe(0);

        // Running change detection at the dynamicCompRef level
        dynamicCompRef.changeDetectorRef.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(1);
        expect(compInstance.afterRenderCount).toBe(1);

        // Running change detection at the compInstance level
        compInstance.changeDetectorRef.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(1);
        expect(compInstance.afterRenderCount).toBe(1);

        // Running change detection at the fixture level (first time)
        fixture.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(1);
        expect(compInstance.afterRenderCount).toBe(1);

        // Running change detection at the fixture level (second time)
        fixture.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(1);
        expect(compInstance.afterRenderCount).toBe(1);

        // Running change detection at the fixture level (third time)
        fixture.detectChanges();
        expect(dynamicCompRef.instance.afterRenderCount).toBe(1);
        expect(compInstance.afterRenderCount).toBe(1);

        // Running change detection after removing view.
        viewContainerRef.remove();
        fixture.detectChanges();
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
        const fixture = TestBed.createComponent(ParentComp);
        expect(log).toEqual([]);

        fixture.detectChanges();
        expect(log).toEqual(['pre-cd', 'post-cd', 'parent-comp', 'child-comp']);
      });

      it('should unsubscribe when calling destroy', () => {
        let hookRef: AfterRenderRef|null = null;
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
        const fixture = TestBed.createComponent(Comp);
        expect(afterRenderCount).toBe(0);

        hookRef!.destroy();
        fixture.detectChanges();
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
          providers: [{provide: ErrorHandler, useFactory: () => new RethrowErrorHandler()}]
        })
        class Comp {
          changeDetectorRef = inject(ChangeDetectorRef);

          constructor() {
            afterNextRender(() => {
              this.changeDetectorRef.detectChanges();
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        const fixture = TestBed.createComponent(Comp);
        expect(() => fixture.detectChanges())
            .toThrowError(/A new render operation began before the previous operation ended./);
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

              afterNextRender(() => {
                innerHookCount++;
              }, {injector: this.injector});
            });
          }
        }

        TestBed.configureTestingModule({
          declarations: [Comp],
          ...COMMON_CONFIGURATION,
        });
        const fixture = TestBed.createComponent(Comp);

        // It hasn't run at all
        expect(outerHookCount).toBe(0);
        expect(innerHookCount).toBe(0);

        // Running change detection (first time)
        fixture.detectChanges();
        expect(outerHookCount).toBe(1);
        expect(innerHookCount).toBe(0);

        // Running change detection (second time)
        fixture.detectChanges();
        expect(outerHookCount).toBe(1);
        expect(innerHookCount).toBe(1);

        // Running change detection (third time)
        fixture.detectChanges();
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
        const fixture = TestBed.createComponent(Comp);

        expect(zoneLog).toEqual([]);
        fixture.detectChanges();
        expect(zoneLog).toEqual([false]);
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
          providers: [{provide: ErrorHandler, useFactory: () => new FakeErrorHandler()}]
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
        const fixture = TestBed.createComponent(Comp);

        expect(log).toEqual([]);
        fixture.detectChanges();
        expect(log).toEqual(['pass 1', 'fail 1', 'pass 2', 'fail 2']);
      });

      it('should run callbacks in the correct phase and order', () => {
        const log: string[] = [];

        @Component({selector: 'root', template: `<comp-a></comp-a><comp-b></comp-b>`})
        class Root {
        }

        @Component({selector: 'comp-a'})
        class CompA {
          constructor() {
            afterNextRender(() => {
              log.push('early-read-1');
            }, {phase: AfterRenderPhase.EarlyRead});

            afterNextRender(() => {
              log.push('write-1');
            }, {phase: AfterRenderPhase.Write});

            afterNextRender(() => {
              log.push('mixed-read-write-1');
            }, {phase: AfterRenderPhase.MixedReadWrite});

            afterNextRender(() => {
              log.push('read-1');
            }, {phase: AfterRenderPhase.Read});
          }
        }

        @Component({selector: 'comp-b'})
        class CompB {
          constructor() {
            afterNextRender(() => {
              log.push('read-2');
            }, {phase: AfterRenderPhase.Read});

            afterNextRender(() => {
              log.push('mixed-read-write-2');
            }, {phase: AfterRenderPhase.MixedReadWrite});

            afterNextRender(() => {
              log.push('write-2');
            }, {phase: AfterRenderPhase.Write});

            afterNextRender(() => {
              log.push('early-read-2');
            }, {phase: AfterRenderPhase.EarlyRead});
          }
        }

        TestBed.configureTestingModule({
          declarations: [Root, CompA, CompB],
          ...COMMON_CONFIGURATION,
        });
        const fixture = TestBed.createComponent(Root);

        expect(log).toEqual([]);
        fixture.detectChanges();
        expect(log).toEqual([
          'early-read-1', 'early-read-2', 'write-1', 'write-2', 'mixed-read-write-1',
          'mixed-read-write-2', 'read-1', 'read-2'
        ]);
      });
    });
  });

  describe('server', () => {
    const COMMON_CONFIGURATION = {
      providers: [{provide: PLATFORM_ID, useValue: PLATFORM_SERVER_ID}]
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
        const fixture = TestBed.createComponent(Comp);
        fixture.detectChanges();
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
        const fixture = TestBed.createComponent(Comp);
        fixture.detectChanges();
        expect(afterRenderCount).toBe(0);
      });
    });
  });
});

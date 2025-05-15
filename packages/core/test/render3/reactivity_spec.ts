/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Needed for the global `Zone` ambient types to be available.
import type {} from 'zone.js';

import {AsyncPipe} from '@angular/common';
import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ContentChildren,
  createComponent,
  destroyPlatform,
  Directive,
  effect,
  EnvironmentInjector,
  ErrorHandler,
  inject,
  Injectable,
  Injector,
  Input,
  NgZone,
  OnChanges,
  provideZonelessChangeDetection,
  QueryList,
  signal,
  SimpleChanges,
  TemplateRef,
  untracked,
  ViewChild,
  ViewContainerRef,
} from '../../src/core';
import {SIGNAL} from '../../primitives/signals';
import {toObservable} from '../../rxjs-interop';
import {EffectNode} from '../../src/render3/reactivity/effect';
import {TestBed} from '../../testing';
import {bootstrapApplication} from '@angular/platform-browser';
import {withBody} from '@angular/private/testing';

describe('reactivity', () => {
  describe('effects', () => {
    beforeEach(destroyPlatform);
    afterEach(destroyPlatform);

    it(
      'should run effects in the zone in which they get created',
      withBody('<test-cmp></test-cmp>', async () => {
        const log: string[] = [];
        @Component({
          selector: 'test-cmp',
          template: '',
        })
        class Cmp {
          constructor(ngZone: NgZone) {
            effect(() => {
              log.push(Zone.current.name);
            });

            ngZone.runOutsideAngular(() => {
              effect(() => {
                log.push(Zone.current.name);
              });
            });
          }
        }

        await bootstrapApplication(Cmp);

        expect(log).not.toEqual(['angular', 'angular']);
      }),
    );

    it('should contribute to application stableness when an effect is pending', async () => {
      const someSignal = signal('initial');
      const appRef = TestBed.inject(ApplicationRef);

      const isStable: boolean[] = [];
      const sub = appRef.isStable.subscribe((stable) => isStable.push(stable));
      expect(isStable).toEqual([true]);

      TestBed.runInInjectionContext(() => effect(() => someSignal()));
      expect(isStable).toEqual([true, false]);

      appRef.tick();

      expect(isStable).toEqual([true, false, true]);
    });

    it('should propagate errors to the ErrorHandler', async () => {
      TestBed.configureTestingModule({
        providers: [{provide: ErrorHandler, useFactory: () => new FakeErrorHandler()}],
        rethrowApplicationErrors: false,
      });

      let run = false;

      let lastError: any = null;
      class FakeErrorHandler extends ErrorHandler {
        override handleError(error: any): void {
          lastError = error;
        }
      }
      const appRef = TestBed.inject(ApplicationRef);
      effect(
        () => {
          run = true;
          throw new Error('fail!');
        },
        {injector: appRef.injector},
      );
      await appRef.whenStable();
      expect(run).toBeTrue();
      expect(lastError.message).toBe('fail!');
    });

    // Disabled while we consider whether this actually makes sense.
    // This test _used_ to show that `effect()` was usable inside component error handlers, partly
    // because effect errors used to report to component error handlers. Now, effect errors are
    // always reported to the top-level error handler, which has never been able to use `effect()`
    // as `effect()` depends transitively on `ApplicationRef` which depends circularly on
    // `ErrorHandler`.
    xit('should be usable inside an ErrorHandler', async () => {
      const shouldError = signal(false);
      let lastError: any = null;

      class FakeErrorHandler extends ErrorHandler {
        constructor() {
          super();
          effect(() => {
            if (shouldError()) {
              throw new Error('fail!');
            }
          });
        }

        override handleError(error: any): void {
          lastError = error;
        }
      }

      TestBed.configureTestingModule({
        providers: [{provide: ErrorHandler, useClass: FakeErrorHandler}],
        rethrowApplicationErrors: false,
      });

      const appRef = TestBed.inject(ApplicationRef);
      expect(() => appRef.tick()).not.toThrow();

      shouldError.set(true);
      expect(() => appRef.tick()).not.toThrow();
      expect(lastError?.message).toBe('fail!');
    });

    it('should run effect cleanup function on destroy', async () => {
      let counterLog: number[] = [];
      let cleanupCount = 0;

      @Component({
        selector: 'test-cmp',
        template: '',
      })
      class Cmp {
        counter = signal(0);
        effectRef = effect((onCleanup) => {
          counterLog.push(this.counter());
          onCleanup(() => {
            cleanupCount++;
          });
        });
      }

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(counterLog).toEqual([0]);
      // initially an effect runs but the default cleanup function is noop
      expect(cleanupCount).toBe(0);

      fixture.componentInstance.counter.set(5);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(counterLog).toEqual([0, 5]);
      expect(cleanupCount).toBe(1);

      fixture.destroy();
      expect(counterLog).toEqual([0, 5]);
      expect(cleanupCount).toBe(2);
    });

    it('should run effect cleanup as untracked', async () => {
      @Component({
        template: '',
      })
      class Cmp {
        counter = signal(0);
        effectTrigger = signal(0);

        effectRef = effect((onCleanup) => {
          this.effectTrigger();

          untracked(() => {
            if (this.counter() > 1) {
              // This is an early bailout in case the effect loops infinitely
              throw new Error('Updated consummers in cleanup for not re-trigger the effect');
            }
          });

          onCleanup(() => {
            this.counter(); // A signal read but not consummed
            this.counter.update((v) => v + 1);
          });
        });
      }

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      await fixture.whenStable();
      // initially an effect runs but the default cleanup function is noop
      expect(fixture.componentInstance.counter()).toBe(0);

      // Triggers a cleanup
      fixture.componentInstance.effectTrigger.update((v) => v + 1);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.counter()).toBe(1);

      // Destroy triggers a cleanup
      fixture.destroy();
      expect(fixture.componentInstance.counter()).toBe(2);
    });

    it('should run effects created in ngAfterViewInit', () => {
      let didRun = false;

      @Component({
        selector: 'test-cmp',
        template: '',
      })
      class Cmp implements AfterViewInit {
        injector = inject(Injector);

        ngAfterViewInit(): void {
          effect(
            () => {
              didRun = true;
            },
            {injector: this.injector},
          );
        }
      }

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      expect(didRun).toBeTrue();
    });

    it('should create root effects when outside of a component, using injection context', () => {
      TestBed.configureTestingModule({});
      const counter = signal(0);
      const log: number[] = [];
      TestBed.runInInjectionContext(() => effect(() => log.push(counter())));

      TestBed.tick();
      expect(log).toEqual([0]);

      counter.set(1);
      TestBed.tick();
      expect(log).toEqual([0, 1]);
    });

    it('should create root effects when outside of a component, using an injector', () => {
      TestBed.configureTestingModule({});
      const counter = signal(0);
      const log: number[] = [];
      effect(() => log.push(counter()), {injector: TestBed.inject(Injector)});

      TestBed.tick();
      expect(log).toEqual([0]);

      counter.set(1);
      TestBed.tick();
      expect(log).toEqual([0, 1]);
    });

    it('should cleanup effect when manualCleanup is enabled and an injector is provided', () => {
      TestBed.configureTestingModule({});
      const counter = signal(0);
      const log: number[] = [];
      // It needs the injector to be able to inject the other deps (and not just the DestroyRef).
      const ref = effect(() => log.push(counter()), {
        manualCleanup: true,
        injector: TestBed.inject(Injector),
      });

      TestBed.tick();
      expect(log).toEqual([0]);

      counter.set(1);
      TestBed.tick();
      expect(log).toEqual([0, 1]);

      ref.destroy();
      counter.set(2);
      TestBed.tick();
      expect(log).toEqual([0, 1]);
    });

    it('should run root effects in creation order independent of dirty order', async () => {
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection()],
      });
      const appRef = TestBed.inject(ApplicationRef);

      const sourceA = signal(0);
      const sourceB = signal(0);

      const log: string[] = [];

      // Creation order: A, B
      effect(() => log.push(`A: ${sourceA()}`), {injector: appRef.injector});
      effect(() => log.push(`B: ${sourceB()}`), {injector: appRef.injector});
      await appRef.whenStable();

      expect(log).toEqual(['A: 0', 'B: 0']);
      log.length = 0;

      // Dirty order: B, A
      sourceB.set(1);
      sourceA.set(2);
      await appRef.whenStable();

      // Effects should still run in A, B creation order.
      expect(log).toEqual(['A: 2', 'B: 1']);
    });

    it('should check components made dirty from markForCheck() from an effect', async () => {
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection()],
      });

      const source = signal('');
      @Component({
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: '{{ data }}',
      })
      class TestCmp {
        cdr = inject(ChangeDetectorRef);
        data = '';
        effectRef = effect(() => {
          if (this.data !== source()) {
            this.data = source();
            this.cdr.markForCheck();
          }
        });
      }

      const fix = TestBed.createComponent(TestCmp);
      await fix.whenStable();

      source.set('test');
      await fix.whenStable();

      expect(fix.nativeElement.innerHTML).toBe('test');
    });

    it('should check components made dirty from markForCheck() from an effect in a service', async () => {
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection()],
      });

      const source = signal('');

      @Injectable()
      class Service {
        data = '';
        cdr = inject(ChangeDetectorRef);
        effectRef = effect(() => {
          if (this.data !== source()) {
            this.data = source();
            this.cdr.markForCheck();
          }
        });
      }

      @Component({
        changeDetection: ChangeDetectionStrategy.OnPush,
        providers: [Service],
        template: '{{ service.data }}',
      })
      class TestCmp {
        service = inject(Service);
      }

      const fix = TestBed.createComponent(TestCmp);
      await fix.whenStable();

      source.set('test');
      await fix.whenStable();

      expect(fix.nativeElement.innerHTML).toBe('test');
    });

    it('should check views made dirty from markForCheck() from an effect in a directive', async () => {
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection()],
      });

      const source = signal('');

      @Directive({
        selector: '[dir]',
      })
      class Dir {
        tpl = inject(TemplateRef);
        vcr = inject(ViewContainerRef);
        cdr = inject(ChangeDetectorRef);
        ctx = {
          $implicit: '',
        };
        ref = this.vcr.createEmbeddedView(this.tpl, this.ctx);

        effectRef = effect(() => {
          if (this.ctx.$implicit !== source()) {
            this.ctx.$implicit = source();
            this.cdr.markForCheck();
          }
        });
      }

      @Component({
        imports: [Dir],
        template: `<ng-template dir let-data>{{data}}</ng-template>`,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class TestCmp {}

      const fix = TestBed.createComponent(TestCmp);
      await fix.whenStable();

      source.set('test');
      await fix.whenStable();

      expect(fix.nativeElement.innerHTML).toContain('test');
    });

    describe('destruction', () => {
      it('should destroy effects when the parent component is destroyed', () => {
        let destroyed = false;
        @Component({})
        class TestCmp {
          constructor() {
            effect((onCleanup) => onCleanup(() => (destroyed = true)));
          }
        }

        const fix = TestBed.createComponent(TestCmp);
        fix.detectChanges();

        fix.destroy();
        expect(destroyed).toBeTrue();
      });

      it('should destroy effects when their view is destroyed, separately from DestroyRef', () => {
        let destroyed = false;
        @Component({})
        class TestCmp {
          readonly injector = Injector.create({providers: [], parent: inject(Injector)});

          constructor() {
            effect((onCleanup) => onCleanup(() => (destroyed = true)), {injector: this.injector});
          }
        }

        const fix = TestBed.createComponent(TestCmp);
        fix.detectChanges();

        fix.destroy();
        expect(destroyed).toBeTrue();
      });

      it('should destroy effects when their DestroyRef is separately destroyed', () => {
        let destroyed = false;
        @Component({})
        class TestCmp {
          readonly injector = Injector.create({providers: [], parent: inject(Injector)});

          constructor() {
            effect((onCleanup) => onCleanup(() => (destroyed = true)), {injector: this.injector});
          }
        }

        const fix = TestBed.createComponent(TestCmp);
        fix.detectChanges();

        (fix.componentInstance.injector as Injector & {destroy(): void}).destroy();
        expect(destroyed).toBeTrue();
      });

      it('should not run root effects after it has been destroyed', async () => {
        let effectCounter = 0;
        const counter = signal(1);
        const effectRef = TestBed.runInInjectionContext(() =>
          effect(
            () => {
              counter();
              effectCounter++;
            },
            {injector: TestBed.inject(EnvironmentInjector)},
          ),
        );
        expect(effectCounter).toBe(0);
        effectRef.destroy();
        TestBed.tick();
        expect(effectCounter).toBe(0);

        counter.set(2);
        TestBed.tick();
        expect(effectCounter).toBe(0);
      });

      it('should not run view effects after it has been destroyed', async () => {
        let effectCounter = 0;

        @Component({template: ''})
        class TestCmp {
          counter = signal(1);
          effectRef = effect(() => {
            this.counter();
            effectCounter++;
          });
        }

        const fixture = TestBed.createComponent(TestCmp);
        fixture.componentInstance.effectRef.destroy();
        fixture.detectChanges();
        expect(effectCounter).toBe(0);

        TestBed.tick();
        expect(effectCounter).toBe(0);

        fixture.componentInstance.counter.set(2);
        TestBed.tick();
        expect(effectCounter).toBe(0);
      });
    });
  });

  describe('safeguards', () => {
    it('should allow writing to signals within effects', () => {
      const counter = signal(0);

      effect(() => counter.set(1), {injector: TestBed.inject(Injector)});
      TestBed.tick();
      expect(counter()).toBe(1);
    });

    it('should allow writing to signals in ngOnChanges', () => {
      @Component({
        selector: 'with-input',
        template: '{{inSignal()}}',
      })
      class WithInput implements OnChanges {
        inSignal = signal<string | undefined>(undefined);
        @Input() in: string | undefined;

        ngOnChanges(changes: SimpleChanges): void {
          if (changes['in']) {
            this.inSignal.set(changes['in'].currentValue);
          }
        }
      }

      @Component({
        selector: 'test-cmp',
        imports: [WithInput],
        template: `<with-input [in]="'A'" />|<with-input [in]="'B'" />`,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('A|B');
    });

    it('should allow writing to signals in a constructor', () => {
      @Component({
        selector: 'with-constructor',
        template: '{{state()}}',
      })
      class WithConstructor {
        state = signal('property initializer');

        constructor() {
          this.state.set('constructor');
        }
      }

      @Component({
        selector: 'test-cmp',
        imports: [WithConstructor],
        template: `<with-constructor />`,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('constructor');
    });

    it('should allow writing to signals in input setters', () => {
      @Component({
        selector: 'with-input-setter',
        template: '{{state()}}',
      })
      class WithInputSetter {
        state = signal('property initializer');

        @Input()
        set testInput(newValue: string) {
          this.state.set(newValue);
        }
      }

      @Component({
        selector: 'test-cmp',
        imports: [WithInputSetter],
        template: `
          <with-input-setter [testInput]="'binding'" />|<with-input-setter testInput="static" />
      `,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('binding|static');
    });

    it('should allow writing to signals in query result setters', () => {
      @Component({
        selector: 'with-query',
        template: '{{items().length}}',
      })
      class WithQuery {
        items = signal<unknown[]>([]);

        @ContentChildren('item')
        set itemsQuery(result: QueryList<unknown>) {
          this.items.set(result.toArray());
        }
      }

      @Component({
        selector: 'test-cmp',
        imports: [WithQuery],
        template: `<with-query><div #item></div></with-query>`,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1');
    });

    it('should not execute query setters in the reactive context', () => {
      const state = signal('initial');

      @Component({
        selector: 'with-query-setter',
        template: '<div #el></div>',
      })
      class WithQuerySetter {
        el: unknown;
        @ViewChild('el', {static: true})
        set elQuery(result: unknown) {
          // read a signal in a setter - I want to verify that framework executes this code outside of
          // the reactive context
          state();
          this.el = result;
        }
      }

      @Component({
        selector: 'test-cmp',
        template: ``,
      })
      class Cmp {
        noOfCmpCreated = 0;
        constructor(environmentInjector: EnvironmentInjector) {
          // A slightly artificial setup where a component instance is created using imperative APIs.
          // We don't have control over the timing / reactive context of such API calls so need to
          // code defensively in the framework.

          // Here we want to specifically verify that an effect is _not_ re-run if a signal read
          // happens in a query setter of a dynamically created component.
          effect(() => {
            createComponent(WithQuerySetter, {environmentInjector});
            this.noOfCmpCreated++;
          });
        }
      }

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      expect(fixture.componentInstance.noOfCmpCreated).toBe(1);

      state.set('changed');
      fixture.detectChanges();

      expect(fixture.componentInstance.noOfCmpCreated).toBe(1);
    });

    it('should allow toObservable subscription in template (with async pipe)', () => {
      @Component({
        selector: 'test-cmp',
        imports: [AsyncPipe],
        template: '{{counter$ | async}}',
      })
      class Cmp {
        counter$ = toObservable(signal(0));
      }

      const fixture = TestBed.createComponent(Cmp);
      expect(() => fixture.detectChanges(true)).not.toThrow();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('0');
    });

    it('should assign a debugName to the underlying node for an effect', async () => {
      @Component({
        selector: 'test-cmp',
        template: '',
      })
      class Cmp {
        effectRef = effect(() => {}, {debugName: 'TEST_DEBUG_NAME'});
      }

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      const component = fixture.componentInstance;
      const effectRef = component.effectRef as unknown as {[SIGNAL]: EffectNode};
      expect(effectRef[SIGNAL].debugName).toBe('TEST_DEBUG_NAME');
    });

    it('should disallow writing to signals within computed', () => {
      @Component({
        selector: 'with-input',
        template: '{{comp()}}',
      })
      class WriteComputed {
        sig = signal(0);
        comp = computed(() => {
          this.sig.set(this.sig() + 1);
          return this.sig();
        });
      }

      const fixture = TestBed.createComponent(WriteComputed);

      expect(() => fixture.detectChanges()).toThrowError(/NG0600.*in a `computed`/);
    });

    it('should disallow writing to signals within a template', () => {
      @Component({
        selector: 'with-input',
        template: '{{func()}}',
      })
      class WriteComputed {
        sig = signal(0);
        func() {
          this.sig.set(this.sig() + 1);
        }
      }

      const fixture = TestBed.createComponent(WriteComputed);

      expect(() => fixture.detectChanges()).toThrowError(/NG0600.*template/);
    });

    describe('effects created in components should first run after ngOnInit', () => {
      it('when created during bootstrapping', () => {
        let log: string[] = [];
        @Component({
          selector: 'test-cmp',
          template: '',
        })
        class TestCmp {
          constructor() {
            effect(() => log.push('effect'));
          }

          ngOnInit(): void {
            log.push('init');
          }
        }

        TestBed.createComponent(TestCmp);
        TestBed.tick();
        expect(log).toEqual(['init', 'effect']);
      });

      it('when created during change detection', () => {
        let log: string[] = [];

        @Component({
          selector: 'test-cmp',
          template: '',
        })
        class TestCmp {
          ngOnInitRan = false;
          constructor() {
            effect(() => log.push('effect'));
          }

          ngOnInit(): void {
            log.push('init');
          }
        }

        @Component({
          selector: 'driver-cmp',
          imports: [TestCmp],
          template: `
          @if (cond) {
            <test-cmp />
          }
        `,
        })
        class DriverCmp {
          cond = false;
        }

        const fixture = TestBed.createComponent(DriverCmp);
        fixture.detectChanges();
        expect(log).toEqual([]);

        // Toggle the @if, which should create and run the effect.
        fixture.componentInstance.cond = true;
        fixture.detectChanges();
        expect(log).toEqual(['init', 'effect']);
      });

      it('when created dynamically', () => {
        let log: string[] = [];
        @Component({
          selector: 'test-cmp',
          template: '',
        })
        class TestCmp {
          ngOnInitRan = false;
          constructor() {
            effect(() => log.push('effect'));
          }

          ngOnInit(): void {
            log.push('init');
          }
        }

        @Component({
          selector: 'driver-cmp',
          template: '',
        })
        class DriverCmp {
          vcr = inject(ViewContainerRef);
        }

        const componentRef = createComponent(DriverCmp, {
          environmentInjector: TestBed.inject(EnvironmentInjector),
        });
        componentRef.changeDetectorRef.detectChanges();

        componentRef.instance.vcr.createComponent(TestCmp);

        // Verify that simply creating the component didn't schedule the effect.
        TestBed.inject(ApplicationRef).tick();
        expect(log).toEqual([]);
        componentRef.changeDetectorRef.detectChanges();
        expect(log).toEqual(['init', 'effect']);
      });

      it('when created in a service provided in a component', () => {
        let log: string[] = [];

        @Injectable()
        class EffectService {
          constructor() {
            effect(() => log.push('effect'));
          }
        }

        @Component({
          selector: 'test-cmp',
          template: '',
          providers: [EffectService],
        })
        class TestCmp {
          svc = inject(EffectService);

          ngOnInit(): void {
            log.push('init');
          }
        }

        const fixture = TestBed.createComponent(TestCmp);
        TestBed.tick();
        expect(log).toEqual(['init', 'effect']);
      });

      it('if multiple effects are created', () => {
        let log: string[] = [];
        @Component({
          selector: 'test-cmp',
          template: '',
        })
        class TestCmp {
          constructor() {
            effect(() => log.push('effect a'));
            effect(() => log.push('effect b'));
            effect(() => log.push('effect c'));
          }

          ngOnInit(): void {
            log.push('init');
          }
        }

        const fixture = TestBed.createComponent(TestCmp);
        fixture.detectChanges();
        expect(log[0]).toBe('init');
        expect(log).toContain('effect a');
        expect(log).toContain('effect b');
        expect(log).toContain('effect c');
      });
    });

    describe('should disallow creating an effect context', () => {
      it('inside template effect', () => {
        @Component({
          standalone: false,
          template: '{{someFn()}}',
        })
        class Cmp {
          someFn() {
            effect(() => {});
          }
        }

        const fixture = TestBed.createComponent(Cmp);
        expect(() => fixture.detectChanges(true)).toThrowError(
          /effect\(\) cannot be called from within a reactive context./,
        );
      });

      it('inside computed', () => {
        expect(() => {
          computed(() => {
            effect(() => {});
          })();
        }).toThrowError(/effect\(\) cannot be called from within a reactive context./);
      });

      it('inside an effect', () => {
        @Component({
          standalone: false,
          template: '',
        })
        class Cmp {
          constructor() {
            effect(() => {
              this.someFnThatWillCreateAnEffect();
            });
          }

          someFnThatWillCreateAnEffect() {
            effect(() => {});
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
        const fixture = TestBed.createComponent(Cmp);

        expect(() => fixture.detectChanges()).toThrowError(
          /effect\(\) cannot be called from within a reactive context./,
        );
      });
    });
  });
});

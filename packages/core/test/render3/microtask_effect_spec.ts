/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AsyncPipe} from '@angular/common';
import {
  AfterViewInit,
  ApplicationRef,
  Component,
  computed,
  ContentChildren,
  createComponent,
  createEnvironmentInjector,
  destroyPlatform,
  ɵmicrotaskEffect as microtaskEffect,
  EnvironmentInjector,
  ErrorHandler,
  inject,
  Injectable,
  Injector,
  Input,
  NgZone,
  OnChanges,
  QueryList,
  signal,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {TestBed} from '@angular/core/testing';
import {bootstrapApplication} from '@angular/platform-browser';
import {withBody} from '@angular/private/testing';
import {filter, firstValueFrom, map} from 'rxjs';

describe('microtask effects', () => {
  beforeEach(destroyPlatform);
  afterEach(destroyPlatform);

  it(
    'should run effects in the zone in which they get created',
    withBody('<test-cmp></test-cmp>', async () => {
      const log: string[] = [];
      @Component({
        selector: 'test-cmp',
        standalone: true,
        template: '',
      })
      class Cmp {
        constructor(ngZone: NgZone) {
          microtaskEffect(() => {
            log.push(Zone.current.name);
          });

          ngZone.runOutsideAngular(() => {
            microtaskEffect(() => {
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

    @Component({
      standalone: true,
      template: '',
    })
    class App {
      unused = microtaskEffect(() => someSignal());
    }

    const appRef = TestBed.inject(ApplicationRef);
    const componentRef = createComponent(App, {
      environmentInjector: TestBed.inject(EnvironmentInjector),
    });
    // Effect is not scheduled until change detection runs for the component
    await expectAsync(firstValueFrom(appRef.isStable)).toBeResolvedTo(true);

    componentRef.changeDetectorRef.detectChanges();
    const stableEmits: boolean[] = [];
    const p = firstValueFrom(
      appRef.isStable.pipe(
        map((stable) => {
          stableEmits.push(stable);
          return stableEmits;
        }),
        filter((emits) => emits.length === 2),
      ),
    );
    await expectAsync(p).toBeResolvedTo([false, true]);
    componentRef.destroy();
  });

  it('should propagate errors to the ErrorHandler', () => {
    let run = false;

    let lastError: any = null;
    class FakeErrorHandler extends ErrorHandler {
      override handleError(error: any): void {
        lastError = error;
      }
    }

    const injector = createEnvironmentInjector(
      [{provide: ErrorHandler, useFactory: () => new FakeErrorHandler()}],
      TestBed.inject(EnvironmentInjector),
    );
    microtaskEffect(
      () => {
        run = true;
        throw new Error('fail!');
      },
      {injector},
    );
    expect(() => TestBed.flushEffects()).not.toThrow();
    expect(run).toBeTrue();
    expect(lastError.message).toBe('fail!');
  });

  it('should be usable inside an ErrorHandler', async () => {
    const shouldError = signal(false);
    let lastError: any = null;

    class FakeErrorHandler extends ErrorHandler {
      constructor() {
        super();
        microtaskEffect(() => {
          if (shouldError()) {
            throw new Error('fail!');
          }
        });
      }

      override handleError(error: any): void {
        lastError = error;
      }
    }

    @Component({
      standalone: true,
      template: '',
      providers: [{provide: ErrorHandler, useClass: FakeErrorHandler}],
    })
    class App {
      errorHandler = inject(ErrorHandler);
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance.errorHandler).toBeInstanceOf(FakeErrorHandler);
    expect(lastError).toBe(null);

    shouldError.set(true);
    fixture.detectChanges();

    expect(lastError?.message).toBe('fail!');
  });

  it('should run effect cleanup function on destroy', async () => {
    let counterLog: number[] = [];
    let cleanupCount = 0;

    @Component({
      selector: 'test-cmp',
      standalone: true,
      template: '',
    })
    class Cmp {
      counter = signal(0);
      effectRef = microtaskEffect((onCleanup) => {
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

  it('should run effects created in ngAfterViewInit', () => {
    let didRun = false;

    @Component({
      selector: 'test-cmp',
      standalone: true,
      template: '',
    })
    class Cmp implements AfterViewInit {
      injector = inject(Injector);

      ngAfterViewInit(): void {
        microtaskEffect(
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

  it(
    'should disallow writing to signals within effects by default',
    withBody('<test-cmp></test-cmp>', async () => {
      @Component({
        selector: 'test-cmp',
        standalone: true,
        template: '',
      })
      class Cmp {
        counter = signal(0);
        constructor() {
          microtaskEffect(() => {
            expect(() => this.counter.set(1)).toThrow();
          });
        }
      }

      await (await bootstrapApplication(Cmp)).whenStable();
    }),
  );

  it('should allow writing to signals within effects when option set', () => {
    const counter = signal(0);

    microtaskEffect(() => counter.set(1), {
      allowSignalWrites: true,
      injector: TestBed.inject(Injector),
    });
    TestBed.flushEffects();
    expect(counter()).toBe(1);
  });

  it('should allow writing to signals in ngOnChanges', () => {
    @Component({
      selector: 'with-input',
      standalone: true,
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
      standalone: true,
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
      standalone: true,
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
      standalone: true,
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
      standalone: true,
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
      standalone: true,
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
      standalone: true,
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
      standalone: true,
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
      standalone: true,
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
      standalone: true,
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
        microtaskEffect(() => {
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
      standalone: true,
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

  describe('effects created in components should first run after ngOnInit', () => {
    it('when created during bootstrapping', () => {
      let log: string[] = [];
      @Component({
        standalone: true,
        selector: 'test-cmp',
        template: '',
      })
      class TestCmp {
        constructor() {
          microtaskEffect(() => log.push('effect'));
        }

        ngOnInit(): void {
          log.push('init');
        }
      }

      const fixture = TestBed.createComponent(TestCmp);
      TestBed.flushEffects();
      expect(log).toEqual([]);
      fixture.detectChanges();
      expect(log).toEqual(['init', 'effect']);
    });

    it('when created during change detection', () => {
      let log: string[] = [];

      @Component({
        standalone: true,
        selector: 'test-cmp',
        template: '',
      })
      class TestCmp {
        ngOnInitRan = false;
        constructor() {
          microtaskEffect(() => log.push('effect'));
        }

        ngOnInit(): void {
          log.push('init');
        }
      }

      @Component({
        standalone: true,
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
        standalone: true,
        selector: 'test-cmp',
        template: '',
      })
      class TestCmp {
        ngOnInitRan = false;
        constructor() {
          microtaskEffect(() => log.push('effect'));
        }

        ngOnInit(): void {
          log.push('init');
        }
      }

      @Component({
        standalone: true,
        selector: 'driver-cmp',
        template: '',
      })
      class DriverCmp {
        vcr = inject(ViewContainerRef);
      }

      const fixture = TestBed.createComponent(DriverCmp);
      fixture.detectChanges();

      const ref = fixture.componentInstance.vcr.createComponent(TestCmp);

      // Verify that simply creating the component didn't schedule the effect.
      TestBed.flushEffects();
      expect(log).toEqual([]);

      // Running change detection should schedule and run the effect.
      fixture.detectChanges();
      expect(log).toEqual(['init', 'effect']);
      ref.destroy();
    });

    it('when created in a service provided in a component', () => {
      let log: string[] = [];

      @Injectable()
      class EffectService {
        constructor() {
          microtaskEffect(() => log.push('effect'));
        }
      }

      @Component({
        standalone: true,
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
      TestBed.flushEffects();
      expect(log).toEqual([]);
      fixture.detectChanges();
      expect(log).toEqual(['init', 'effect']);
    });

    it('if multiple effects are created', () => {
      let log: string[] = [];
      @Component({
        standalone: true,
        selector: 'test-cmp',
        template: '',
      })
      class TestCmp {
        constructor() {
          microtaskEffect(() => log.push('effect a'));
          microtaskEffect(() => log.push('effect b'));
          microtaskEffect(() => log.push('effect c'));
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
        template: '{{someFn()}}',
      })
      class Cmp {
        someFn() {
          microtaskEffect(() => {});
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
          microtaskEffect(() => {});
        })();
      }).toThrowError(/effect\(\) cannot be called from within a reactive context./);
    });

    it('inside an effect', () => {
      @Component({
        template: '',
      })
      class Cmp {
        constructor() {
          microtaskEffect(() => {
            this.someFnThatWillCreateAnEffect();
          });
        }

        someFnThatWillCreateAnEffect() {
          microtaskEffect(() => {});
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

describe('microtask effects in TestBed', () => {
  it('created in the constructor should run with detectChanges()', () => {
    const log: string[] = [];
    @Component({
      selector: 'test-cmp',
      standalone: true,
      template: '',
    })
    class Cmp {
      constructor() {
        log.push('Ctor');

        microtaskEffect(() => {
          log.push('Effect');
        });
      }

      ngDoCheck() {
        log.push('DoCheck');
      }
    }

    TestBed.createComponent(Cmp).detectChanges();

    expect(log).toEqual([
      // The component gets constructed, which creates the effect. Since the effect is created in a
      // component, it doesn't get scheduled until the component is first change detected.
      'Ctor',

      // Next, the first change detection (update pass) happens.
      'DoCheck',

      // Then the effect runs.
      'Effect',
    ]);
  });

  it('created in ngOnInit should run with detectChanges()', () => {
    const log: string[] = [];
    @Component({
      selector: 'test-cmp',
      standalone: true,
      template: '',
    })
    class Cmp {
      private injector = inject(Injector);

      constructor() {
        log.push('Ctor');
      }

      ngOnInit() {
        microtaskEffect(
          () => {
            log.push('Effect');
          },
          {injector: this.injector},
        );
      }

      ngDoCheck() {
        log.push('DoCheck');
      }
    }

    TestBed.createComponent(Cmp).detectChanges();

    expect(log).toEqual([
      // The component gets constructed.
      'Ctor',

      // Next, the first change detection (update pass) happens, which creates the effect and
      // schedules it for execution.
      'DoCheck',

      // Then the effect runs.
      'Effect',
    ]);
  });

  it('will flush effects automatically when using autoDetectChanges', async () => {
    const val = signal('initial');
    let observed = '';
    @Component({
      selector: 'test-cmp',
      standalone: true,
      template: '',
    })
    class Cmp {
      constructor() {
        microtaskEffect(() => {
          observed = val();
        });
      }
    }

    const fixture = TestBed.createComponent(Cmp);
    fixture.autoDetectChanges();

    expect(observed).toBe('initial');
    val.set('new');
    expect(observed).toBe('initial');
    await fixture.whenStable();
    expect(observed).toBe('new');
  });
});

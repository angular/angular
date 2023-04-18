/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterViewInit, Component, ContentChildren, createComponent, destroyPlatform, effect, EnvironmentInjector, inject, Injector, Input, NgZone, OnChanges, QueryList, signal, SimpleChanges, ViewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {bootstrapApplication} from '@angular/platform-browser';
import {withBody} from '@angular/private/testing';

describe('effects', () => {
  beforeEach(destroyPlatform);
  afterEach(destroyPlatform);

  it('created in the constructor should run during change detection',
     withBody('<test-cmp></test-cmp>', async () => {
       const log: string[] = [];
       @Component({
         selector: 'test-cmp',
         standalone: true,
         template: '',
       })
       class Cmp {
         constructor() {
           log.push('B');

           effect(() => {
             log.push('E');
           });
         }

         ngDoCheck() {
           log.push('C');
         }
       }

       await bootstrapApplication(Cmp);

       expect(log).toEqual([
         // B: component bootstrapped
         'B',
         // E: effect runs during change detection
         'E',
         // C: change detection was observed (first round from `ApplicationRef.tick` called
         // manually)
         'C',
         // C: second change detection happens (from zone becoming stable)
         'C',
       ]);
     }));

  it('created in ngOnInit should run during change detection',
     withBody('<test-cmp></test-cmp>', async () => {
       const log: string[] = [];
       @Component({
         selector: 'test-cmp',
         standalone: true,
         template: '',
       })
       class Cmp {
         private injector = inject(Injector);

         constructor() {
           log.push('B');
         }

         ngOnInit() {
           effect(() => {
             log.push('E');
           }, {injector: this.injector});
         }

         ngDoCheck() {
           log.push('C');
         }
       }

       await bootstrapApplication(Cmp);

       expect(log).toEqual([
         // B: component bootstrapped
         'B',
         // ngDoCheck runs before ngOnInit
         'C',
         // E: effect runs during change detection
         'E',
         // C: second change detection happens (from zone becoming stable)
         'C',
       ]);
     }));

  it('should run effects in the zone in which they get created',
     withBody('<test-cmp></test-cmp>', async () => {
       const log: string[] = [];
       @Component({
         selector: 'test-cmp',
         standalone: true,
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
     }));

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

  it('should run effects created in ngAfterViewInit', async () => {
    let didRun = false;

    @Component({
      selector: 'test-cmp',
      standalone: true,
      template: '',
    })
    class Cmp implements AfterViewInit {
      injector = inject(Injector);

      ngAfterViewInit(): void {
        effect(() => {
          didRun = true;
        }, {injector: this.injector});
      }
    }

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    expect(didRun).toBeTrue();
  });

  it('should disallow writing to signals within effects by default',
     withBody('<test-cmp></test-cmp>', async () => {
       @Component({
         selector: 'test-cmp',
         standalone: true,
         template: '',
       })
       class Cmp {
         counter = signal(0);
         constructor() {
           effect(() => {
             expect(() => this.counter.set(1)).toThrow();
           });
         }
       }

       await bootstrapApplication(Cmp);
     }));

  it('should allow writing to signals within effects when option set',
     withBody('<test-cmp></test-cmp>', async () => {
       @Component({
         selector: 'test-cmp',
         standalone: true,
         template: '',
       })
       class Cmp {
         counter = signal(0);
         constructor() {
           effect(() => {
             expect(() => this.counter.set(1)).not.toThrow();
           }, {allowSignalWrites: true});
         }
       }

       await bootstrapApplication(Cmp);
     }));

  it('should allow writing to signals in ngOnChanges', () => {
    @Component({
      selector: 'with-input',
      standalone: true,
      template: '{{inSignal()}}',
    })
    class WithInput implements OnChanges {
      inSignal = signal<string|undefined>(undefined);
      @Input() in : string|undefined;

      ngOnChanges(changes: SimpleChanges): void {
        if (changes.in) {
          this.inSignal.set(changes.in.currentValue);
        }
      }
    }

    @Component({
      selector: 'test-cmp',
      standalone: true,
      imports: [WithInput],
      template: `<with-input [in]="'A'" />|<with-input [in]="'B'" />`,
    })
    class Cmp {
    }

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
    class Cmp {
    }

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
    class Cmp {
    }

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
    class Cmp {
    }

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
});

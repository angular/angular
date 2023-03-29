/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterViewInit, Component, destroyPlatform, effect, inject, Injector, NgZone, signal} from '@angular/core';
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
      effectRef = effect(() => {
        counterLog.push(this.counter());
        return () => {
          cleanupCount++;
        };
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
});

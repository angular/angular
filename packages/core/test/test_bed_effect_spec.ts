/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, effect, inject, Injector} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('effects in TestBed', () => {
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

        effect(() => {
          log.push('Effect');
        });
      }

      ngDoCheck() {
        log.push('DoCheck');
      }
    }

    TestBed.createComponent(Cmp).detectChanges();

    expect(log).toEqual([
      'Ctor',
      'Effect',
      'DoCheck',
    ]);
  });

  it('created in ngOnInit should not run with detectChanges()', () => {
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
        effect(() => {
          log.push('Effect');
        }, {injector: this.injector});
      }

      ngDoCheck() {
        log.push('DoCheck');
      }
    }

    TestBed.createComponent(Cmp).detectChanges();

    expect(log).toEqual([
      // B: component bootstrapped
      'Ctor',
      // ngDoCheck runs before ngOnInit
      'DoCheck',
    ]);

    // effect should not have executed.
  });
});

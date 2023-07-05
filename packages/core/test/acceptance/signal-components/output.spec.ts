/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Output, output, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('outputs', () => {
  xit('should subscribe to signal directive outputs', () => {
    @Component({
      selector: 'with-output-cmp',
      standalone: true,
      signals: true,
      template: `<button (click)="increment.emit()"></button>`,
    })
    class WithOutputCmp {
      counter = signal(0);
      @Output() increment = output<void>();
    }

    @Component({
      signals: true,
      standalone: true,
      imports: [WithOutputCmp],
      template: `<with-output-cmp (increment)="bumpUp()" />{{inc()}}`,
    })
    class App {
      inc = signal(0);
      onIncrement() {
        this.inc.update(c => c + 1);
      }
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('0');
  });
});

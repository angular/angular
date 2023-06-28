/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('listeners', () => {
  it('should invoke listeners that modify context data', () => {
    @Component({
      signals: true,
      standalone: true,
      template: `<button (click)="counter.set(1)">{{counter()}}</button>`,
    })
    class App {
      counter = signal(0);
    }

    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('0');

    fixture.nativeElement.firstChild.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('1');
  });
});

// todo:  listener restore view was missing in template pipeline

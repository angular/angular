/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Pipe, PipeTransform} from '@angular/core';
import {TestBed} from '@angular/core/testing';

// Basic shared pipe used during testing.
@Pipe({name: 'multiply', pure: true, standalone: true})
class MultiplyPipe implements PipeTransform {
  transform(value: number, amount: number) {
    return value * amount;
  }
}

describe('control flow - switch', () => {
  it('should show a template based on a matching case', () => {
    @Component({
      standalone: true,
      template: `
          @switch (case) {
            @case (0) {case 0}
            @case (1) {case 1}
            @default {default}
          }
        `
    })
    class TestComponent {
      case = 0;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('case 0');

    fixture.componentInstance.case = 1;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('case 1');

    fixture.componentInstance.case = 5;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('default');
  });

  it('should be able to use a pipe in the switch expression', () => {
    @Component({
      standalone: true,
      imports: [MultiplyPipe],
      template: `
          @switch (case | multiply:2) {
            @case (0) {case 0}
            @case (2) {case 2}
            @default {default}
          }
        `
    })
    class TestComponent {
      case = 0;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('case 0');

    fixture.componentInstance.case = 1;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('case 2');

    fixture.componentInstance.case = 5;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('default');
  });

  it('should be able to use a pipe in the case expression', () => {
    @Component({
      standalone: true,
      imports: [MultiplyPipe],
      template: `
          @switch (case) {
            @case (1 | multiply:2) {case 2}
            @case (2 | multiply:2) {case 4}
            @default {default}
          }
        `
    })
    class TestComponent {
      case = 0;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('default');

    fixture.componentInstance.case = 4;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('case 4');

    fixture.componentInstance.case = 2;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('case 2');
  });
});

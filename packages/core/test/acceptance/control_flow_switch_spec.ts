/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, Component, inject, Pipe, PipeTransform} from '@angular/core';
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

  it('should be able to use pipes injecting ChangeDetectorRef in switch blocks', () => {
    @Pipe({name: 'test', standalone: true})
    class TestPipe implements PipeTransform {
      changeDetectorRef = inject(ChangeDetectorRef);

      transform(value: any) {
        return value;
      }
    }

    @Component({
      standalone: true,
      template: `
        @switch (case | test) {
          @case (0 | test) {Zero}
          @case (1 | test) {One}
        }
      `,
      imports: [TestPipe],
    })
    class TestComponent {
      case = 1;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('One');
  });

  it('should project an @switch block into the catch-all slot', () => {
    @Component({
      standalone: true,
      selector: 'test',
      template: 'Main: <ng-content/> Slot: <ng-content select="[foo]"/>',
    })
    class TestComponent {
    }

    @Component({
      standalone: true,
      imports: [TestComponent],
      template: `
      <test>Before @switch (1) {
        @case (1) {
          <span foo>foo</span>
        }
      } After</test>
    `
    })
    class App {
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('Main: Before foo After Slot: ');
  });
});

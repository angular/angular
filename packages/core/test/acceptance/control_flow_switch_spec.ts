/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectorRef,
  Component,
  inject,
  Pipe,
  PipeTransform,
  provideZoneChangeDetection,
} from '../../src/core';
import {TestBed} from '../../testing';

// Basic shared pipe used during testing.
@Pipe({name: 'multiply', pure: true})
class MultiplyPipe implements PipeTransform {
  transform(value: number, amount: number) {
    return value * amount;
  }
}

describe('control flow - switch', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
  });
  it('should show a template based on a matching case', () => {
    @Component({
      template: `
        @switch (case) {
          @case (0) {
            case 0
          }
          @case (1) {
            case 1
          }
          @default {
            default
          }
        }
      `,
    })
    class TestComponent {
      case = 0;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe(' case 0 ');

    fixture.componentInstance.case = 1;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' case 1 ');

    fixture.componentInstance.case = 5;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' default ');
  });

  it('should be able to use a pipe in the switch expression', () => {
    @Component({
      imports: [MultiplyPipe],
      template: `
        @switch (case | multiply: 2) {
          @case (0) {
            case 0
          }
          @case (2) {
            case 2
          }
          @default {
            default
          }
        }
      `,
    })
    class TestComponent {
      case = 0;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe(' case 0 ');

    fixture.componentInstance.case = 1;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' case 2 ');

    fixture.componentInstance.case = 5;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' default ');
  });

  it('should be able to use a pipe in the case expression', () => {
    @Component({
      imports: [MultiplyPipe],
      template: `
        @switch (case) {
          @case (1 | multiply: 2) {
            case 2
          }
          @case (2 | multiply: 2) {
            case 4
          }
          @default {
            default
          }
        }
      `,
    })
    class TestComponent {
      case = 0;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe(' default ');

    fixture.componentInstance.case = 4;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' case 4 ');

    fixture.componentInstance.case = 2;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' case 2 ');
  });

  it('should be able to use pipes injecting ChangeDetectorRef in switch blocks', () => {
    @Pipe({name: 'test'})
    class TestPipe implements PipeTransform {
      changeDetectorRef = inject(ChangeDetectorRef);

      transform(value: any) {
        return value;
      }
    }

    @Component({
      template: `
        @switch (case | test) {
          @case (0 | test) {
            Zero
          }
          @case (1 | test) {
            One
          }
        }
      `,
      imports: [TestPipe],
    })
    class TestComponent {
      case = 1;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' One ');
  });

  it('should project @switch cases into appropriate slots when selectors are used for all cases', () => {
    @Component({
      selector: 'test',
      template:
        'case 1: (<ng-content select="[case_1]"/>), case 2: (<ng-content select="[case_2]"/>), case 3: (<ng-content select="[case_3]"/>)',
    })
    class TestComponent {}

    @Component({
      imports: [TestComponent],
      template: `
        <test>
          @switch (value) {
            @case (1) {
              <span case_1>value 1</span>
            }
            @case (2) {
              <span case_2>value 2</span>
            }
            @case (3) {
              <span case_3>value 3</span>
            }
          }
        </test>
      `,
    })
    class App {
      value = 1;
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('case 1: (value 1), case 2: (), case 3: ()');

    fixture.componentInstance.value = 2;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('case 1: (), case 2: (value 2), case 3: ()');

    fixture.componentInstance.value = 3;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('case 1: (), case 2: (), case 3: (value 3)');
  });

  it('should project @switch cases into appropriate slots when selectors are used for some cases', () => {
    @Component({
      selector: 'test',
      template:
        'case 1: (<ng-content select="[case_1]"/>), case 2: (<ng-content />), case 3: (<ng-content select="[case_3]"/>)',
    })
    class TestComponent {}

    @Component({
      imports: [TestComponent],
      template: `
        <test>
          @switch (value) {
            @case (1) {
              <span case_1>value 1</span>
            }
            @case (2) {
              <span>value 2</span>
            }
            @case (3) {
              <span case_3>value 3</span>
            }
          }
        </test>
      `,
    })
    class App {
      value = 1;
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('case 1: (value 1), case 2: (), case 3: ()');

    fixture.componentInstance.value = 2;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('case 1: (), case 2: (value 2), case 3: ()');

    fixture.componentInstance.value = 3;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('case 1: (), case 2: (), case 3: (value 3)');
  });

  it('should support consecutive cases for the same block', () => {
    @Component({
      template: `
        @switch (case) {
          @case (0)
          @case (1) {
            case 0 or 1
          }
          @case (2) {
            case 2
          }
          @default {
            default
          }
        }
      `,
    })
    class TestComponent {
      case = 0;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe(' case 0 or 1 ');

    fixture.componentInstance.case = 1;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' case 0 or 1 ');

    fixture.componentInstance.case = 2;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' case 2 ');

    fixture.componentInstance.case = 3;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' default ');
  });

  it('should support a case following a default case in the same group', () => {
    @Component({
      template: `
        @switch (case) {
          @case (0) {
            case 0
          }
          @default
          @case (1) {
            default or case 1
          }
        }
      `,
    })
    class TestComponent {
      case = 0;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe(' case 0 ');

    fixture.componentInstance.case = 1;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' default or case 1 ');

    fixture.componentInstance.case = 5;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' default or case 1 ');
  });

  it('should support an empty case block', () => {
    // prettier-ignore
    @Component({
      template: `
        @switch (case) {
          @case (0) {}
          @case (1) { <!-- empty --> }
          @case (2) {

          }
          @case(3)
          @case (4) {
            case 3-4
          }
          @default {
            default
          }
        }
      `,
    })
    class TestComponent {
      case = 0;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('');

    fixture.componentInstance.case = 1;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('');

    fixture.componentInstance.case = 2;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('');

    fixture.componentInstance.case = 3;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' case 3-4 ');

    fixture.componentInstance.case = 4;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' case 3-4 ');

    fixture.componentInstance.case = 5;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' default ');
  });

  it('should support exhaustive switch checking', () => {
    @Component({
      template: `
        Between here
        @switch (case) {
          @case (0) {
            case 0
          }
          @case (1) {
            case 1
          }
          @default never; 
        }
        and there.
      `,
    })
    class TestComponent {
      case: 0 | 1 = 2 as 1; // Intentionally incorrect to test exhaustive checking at runtime
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' Between here  and there. ');
    fixture.componentInstance.case = 0;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(' Between here  case 0  and there. ');
  });
});

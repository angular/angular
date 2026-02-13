/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {expectScreenText, waitFor} from '@angular/private/testing';

import {ChangeDetectorRef, Component, inject, Pipe, PipeTransform, signal} from '../../src/core';
import {TestBed} from '../../testing';

// Basic shared pipe used during testing.
@Pipe({name: 'multiply', pure: true})
class MultiplyPipe implements PipeTransform {
  transform(value: number, amount: number) {
    return value * amount;
  }
}

describe('control flow - switch', () => {
  it('should show a template based on a matching case', async () => {
    @Component({
      template: `
        @switch (case()) {
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
      case = signal(0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText(' case 0 ', {container: fixture.nativeElement});

    fixture.componentInstance.case.set(1);
    await expectScreenText(' case 1 ', {container: fixture.nativeElement});

    fixture.componentInstance.case.set(5);
    await expectScreenText(' default ', {container: fixture.nativeElement});
  });

  it('should be able to use a pipe in the switch expression', async () => {
    @Component({
      imports: [MultiplyPipe],
      template: `
        @switch (case() | multiply: 2) {
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
      case = signal(0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText(' case 0 ', {container: fixture.nativeElement});

    fixture.componentInstance.case.set(1);
    await expectScreenText(' case 2 ', {container: fixture.nativeElement});

    fixture.componentInstance.case.set(5);
    await expectScreenText(' default ', {container: fixture.nativeElement});
  });

  it('should be able to use a pipe in the case expression', async () => {
    @Component({
      imports: [MultiplyPipe],
      template: `
        @switch (case()) {
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
      case = signal(0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText(' default ', {container: fixture.nativeElement});

    fixture.componentInstance.case.set(4);
    await expectScreenText(' case 4 ', {container: fixture.nativeElement});

    fixture.componentInstance.case.set(2);
    await expectScreenText(' case 2 ', {container: fixture.nativeElement});
  });

  it('should be able to use pipes injecting ChangeDetectorRef in switch blocks', async () => {
    @Pipe({name: 'test'})
    class TestPipe implements PipeTransform {
      changeDetectorRef = inject(ChangeDetectorRef);

      transform(value: any) {
        return value;
      }
    }

    @Component({
      template: `
        @switch (case() | test) {
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
      case = signal(1);
    }

    const fixture = TestBed.createComponent(TestComponent);

    await expectScreenText(' One ', {container: fixture.nativeElement});
  });

  it('should project @switch cases into appropriate slots when selectors are used for all cases', async () => {
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
          @switch (value()) {
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
      value = signal(1);
    }

    const fixture = TestBed.createComponent(App);
    await expectScreenText('case 1: (value 1), case 2: (), case 3: ()', {
      container: fixture.nativeElement,
    });

    fixture.componentInstance.value.set(2);
    await expectScreenText('case 1: (), case 2: (value 2), case 3: ()', {
      container: fixture.nativeElement,
    });

    fixture.componentInstance.value.set(3);
    await expectScreenText('case 1: (), case 2: (), case 3: (value 3)', {
      container: fixture.nativeElement,
    });
  });

  it('should project @switch cases into appropriate slots when selectors are used for some cases', async () => {
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
          @switch (value()) {
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
      value = signal(1);
    }

    const fixture = TestBed.createComponent(App);
    await expectScreenText('case 1: (value 1), case 2: (), case 3: ()', {
      container: fixture.nativeElement,
    });

    fixture.componentInstance.value.set(2);
    await expectScreenText('case 1: (), case 2: (value 2), case 3: ()', {
      container: fixture.nativeElement,
    });

    fixture.componentInstance.value.set(3);
    await expectScreenText('case 1: (), case 2: (), case 3: (value 3)', {
      container: fixture.nativeElement,
    });
  });

  it('should support consecutive cases for the same block', async () => {
    @Component({
      template: `
        @switch (case()) {
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
      case = signal(0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText(' case 0 or 1 ', {container: fixture.nativeElement});

    fixture.componentInstance.case.set(1);
    await expectScreenText(' case 0 or 1 ', {container: fixture.nativeElement});

    fixture.componentInstance.case.set(2);
    await expectScreenText(' case 2 ', {container: fixture.nativeElement});

    fixture.componentInstance.case.set(3);
    await expectScreenText(' default ', {container: fixture.nativeElement});
  });

  it('should support a case following a default case in the same group', async () => {
    @Component({
      template: `
        @switch (case()) {
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
      case = signal(0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText(' case 0 ', {container: fixture.nativeElement});

    fixture.componentInstance.case.set(1);
    await expectScreenText(' default or case 1 ', {container: fixture.nativeElement});

    fixture.componentInstance.case.set(5);
    await expectScreenText(' default or case 1 ', {container: fixture.nativeElement});
  });

  it('should support an empty case block', async () => {
    // prettier-ignore
    @Component({
      template: `
        @switch (case()) {
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
      case = signal(0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    // For empty content, we still need to check textContent directly as screen.getByText('') won't find it effectively.
    await waitFor(() => throwUnless(fixture.nativeElement.textContent).toBe(''));

    fixture.componentInstance.case.set(1);
    await waitFor(() => throwUnless(fixture.nativeElement.textContent).toBe(''));

    fixture.componentInstance.case.set(2);
    await waitFor(() => throwUnless(fixture.nativeElement.textContent).toBe(''));

    fixture.componentInstance.case.set(3);
    await expectScreenText(' case 3-4 ', {container: fixture.nativeElement});

    fixture.componentInstance.case.set(4);
    await expectScreenText(' case 3-4 ', {container: fixture.nativeElement});

    fixture.componentInstance.case.set(5);
    await expectScreenText(' default ', {container: fixture.nativeElement});
  });

  it('should support exhaustive switch checking', async () => {
    @Component({
      template: `
        Between here
        @switch (val()) {
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
      val = signal<0 | 1>(2 as 1); // Intentionally incorrect to test exhaustive checking at runtime
    }

    const fixture = TestBed.createComponent(TestComponent);
    await expectScreenText(' Between here  and there. ', {container: fixture.nativeElement});
    fixture.componentInstance.val.set(0);
    await expectScreenText(' Between here  case 0  and there. ', {
      container: fixture.nativeElement,
    });
  });
});

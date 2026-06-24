/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  Directive,
  Output,
  EventEmitter,
  ErrorHandler,
  Pipe,
  PipeTransform,
  inject,
  ChangeDetectorRef,
  ViewChild,
  provideZoneChangeDetection,
} from '../../src/core';
import {TestBed} from '../../testing';

describe('@let declarations', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
  });
  it('should update the value of a @let declaration over time', () => {
    @Component({
      template: `
        @let multiplier = 2;
        @let result = value * multiplier;
        {{value}} times {{multiplier}} is {{result}}
      `,
    })
    class TestComponent {
      value = 0;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('0 times 2 is 0');

    fixture.componentInstance.value = 1;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('1 times 2 is 2');

    fixture.componentInstance.value = 2;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('2 times 2 is 4');
  });

  it('should be able to use @let declarations inside event listeners', () => {
    const values: number[] = [];

    @Component({
      template: `
        @let result = value * 2;
        <button (click)="log(result)"></button>
      `,
    })
    class TestComponent {
      value = 0;

      log(value: number) {
        values.push(value);
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    fixture.detectChanges();
    expect(values).toEqual([]);

    button.click();
    expect(values).toEqual([0]);

    fixture.componentInstance.value = 2;
    fixture.detectChanges();
    button.click();
    expect(values).toEqual([0, 4]);
  });

  it('should be able to access @let declarations through multiple levels of views', () => {
    @Component({
      template: `
        @if (true) {
          @if (true) {
            @let three = two + 1;
            The result is {{three}}
          }
          @let two = one + 1;
        }

        @let one = value + 1;
      `,
    })
    class TestComponent {
      value = 0;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('The result is 3');

    fixture.componentInstance.value = 2;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('The result is 5');
  });

  it('should be able to access @let declarations from parent view before they are declared', () => {
    @Component({
      template: `
        @if (true) {
          {{value}} times {{multiplier}} is {{result}}
        }

        @let multiplier = 2;
        @let result = value * multiplier;
      `,
    })
    class TestComponent {
      value = 0;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('0 times 2 is 0');

    fixture.componentInstance.value = 1;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('1 times 2 is 2');

    fixture.componentInstance.value = 2;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('2 times 2 is 4');
  });

  it('should throw if a @let declaration is accessed before it is initialized', () => {
    const errors: string[] = [];

    @Directive({
      selector: '[dir]',
    })
    class TestDirective {
      @Output() testEvent = new EventEmitter<void>();

      ngOnInit() {
        this.testEvent.emit();
      }
    }

    @Component({
      imports: [TestDirective],
      template: `
        <div dir (testEvent)="callback(value)"></div>
        @let value = 1;
      `,
    })
    class TestComponent {
      callback(_value: number) {}
    }

    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        // We can't use `toThrow` in the tests, because errors in listeners
        // are caught. Capture them using a custom ErrorHandler instead.
        {
          provide: ErrorHandler,
          useValue: {
            handleError: (error: Error) => errors.push(error.message),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain(
      'Attempting to access a @let declaration whose value is not available yet',
    );
  });

  it('should be able to use pipes injecting ChangeDetectorRef in a let declaration', () => {
    @Pipe({name: 'double'})
    class DoublePipe implements PipeTransform {
      changeDetectorRef = inject(ChangeDetectorRef);

      transform(value: number) {
        return value * 2;
      }
    }

    @Component({
      template: `
        @let result = value | double;
        Result: {{result}}
      `,
      imports: [DoublePipe],
    })
    class TestComponent {
      value = 2;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Result: 4');

    fixture.componentInstance.value = 5;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Result: 10');
  });

  it('should be able to use local references inside @let declarations', () => {
    @Component({
      template: `
        <input #firstName value="Frodo" name="first-name">
        <input #lastName value="Baggins">
        @let fullName = firstName.value + ' ' + lastName.value;
        Hello, {{fullName}}
      `,
    })
    class TestComponent {}

    const fixture = TestBed.createComponent(TestComponent);
    const firstNameInput = fixture.nativeElement.querySelector('[name="first-name"]');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Hello, Frodo Baggins');

    firstNameInput.value = 'Bilbo';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Hello, Bilbo Baggins');
  });

  it('should be able to proxy a local reference through @let declarations', () => {
    @Component({
      template: `
        <input #input value="foo">

        @let one = input;

        @if (true) {
          @let two = one;

          @if (true) {
            The value is {{two.value}}
          }
        }
      `,
    })
    class TestComponent {}

    const fixture = TestBed.createComponent(TestComponent);
    const input = fixture.nativeElement.querySelector('input');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('The value is foo');

    input.value = 'bar';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('The value is bar');
  });

  it('should evaluate unused let declarations', () => {
    let calls = 0;

    @Component({
      template: `
        @let one = getOne();
        @let two = one + getTwo();
        @let three = two + getThree();
      `,
    })
    class TestComponent {
      getOne(): number {
        calls++;
        return 1;
      }

      getTwo(): number {
        calls++;
        return 2;
      }

      getThree(): number {
        calls++;
        return 3;
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(calls).toBeGreaterThan(0);
  });

  it('should resolve a @let declaration correctly within an embedded view that uses a value from parent view and cannot be optimized', () => {
    @Component({
      template: `
        @let foo = value + 1;

        @if (true) {
          <div>
            @let bar = foo + 1;
            bar is {{bar}}
            <button (click)="callback(bar)">I'm here to prevent the optimization of "bar"</button>
          </div>
        }
      `,
    })
    class TestComponent {
      value = 0;
      callback(value: number) {}
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('bar is 2');

    fixture.componentInstance.value = 2;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('bar is 4');
  });

  it('should not be able to access @let declarations using a query', () => {
    @Component({
      template: `
        @let value = 1;
        {{value}}
      `,
    })
    class TestComponent {
      @ViewChild('value') value: any;
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBeUndefined();
  });

  it('should be able to access @let declaration from inside ng-content', () => {
    @Component({
      selector: 'inner',
      template: `
        @let value = 123;
        <ng-content>The value is {{value}}</ng-content>
      `,
    })
    class InnerComponent {}

    @Component({
      template: '<inner/>',
      imports: [InnerComponent],
    })
    class TestComponent {}

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('The value is 123');
  });

  it('should not project let declarations', () => {
    @Component({
      selector: 'inner',
      template: `
        <ng-content select="header">Fallback header</ng-content>
        <ng-content>Fallback content</ng-content>
        <ng-content select="footer">Fallback footer</ng-content>
      `,
    })
    class InnerComponent {}

    @Component({
      template: `
        <inner>
          @let one = 1;
          <footer>|Footer value {{one}}</footer>
          @let two = one + 1;
          <header>Header value {{two}}|</header>
        </inner>
      `,
      imports: [InnerComponent],
    })
    class TestComponent {}

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain(
      '<inner><!--container--><header>Header value 2|</header>' +
        'Fallback content<!--container--><!--container-->' +
        '<footer>|Footer value 1</footer></inner>',
    );
  });

  it('should give precedence to @let declarations over component properties', () => {
    @Component({
      template: `
        @let value = '@let';

        @if (true) {
          The value comes from {{value}}
        }
      `,
    })
    class TestComponent {
      value = 'component';
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('The value comes from @let');
  });

  it('should give precedence to local @let definition over one from a parent view', () => {
    @Component({
      template: `
        @let value = 'parent';

        @if (true) {
          @let value = 'local';
          The value comes from {{value}}
        }
      `,
    })
    class TestComponent {}

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('The value comes from local');
  });

  it('should be able to use @for loop variables in @let declarations', () => {
    @Component({
      template: `
        @for (value of values; track $index) {
          @let calculation = value * $index;
          {{calculation}}|
        }
      `,
    })
    class TestComponent {
      values = [1, 2, 3];
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('0|  2|  6|');
  });
});

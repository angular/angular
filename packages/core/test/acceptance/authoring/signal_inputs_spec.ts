/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  computed,
  Directive,
  effect,
  EventEmitter,
  input,
  Output,
  ViewChild,
} from '@angular/core';
import {SIGNAL} from '../../../primitives/signals';
import {TestBed} from '../../../testing';

describe('signal inputs', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      errorOnUnknownProperties: true,
    }),
  );

  it('should be possible to bind to an input', () => {
    @Component({
      selector: 'input-comp',
      template: 'input:{{input()}}',
    })
    class InputComp {
      input = input<number>();
    }

    @Component({
      template: `<input-comp [input]="value" />`,
      imports: [InputComp],
    })
    class TestCmp {
      value = 1;
    }

    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('input:1');

    fixture.componentInstance.value = 2;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('input:2');
  });

  it('should be possible to use an input in a computed expression', () => {
    @Component({
      selector: 'input-comp',
      template: 'changed:{{changed()}}',
    })
    class InputComp {
      input = input<number>();
      changed = computed(() => `computed-${this.input()}`);
    }

    @Component({
      template: `<input-comp [input]="value" />`,
      imports: [InputComp],
    })
    class TestCmp {
      value = 1;
    }

    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('changed:computed-1');

    fixture.componentInstance.value = 2;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('changed:computed-2');
  });

  it('should be possible to use an input in an effect', () => {
    let effectLog: unknown[] = [];

    @Component({
      selector: 'input-comp',
      template: '',
    })
    class InputComp {
      input = input<number>();

      constructor() {
        effect(() => {
          effectLog.push(this.input());
        });
      }
    }

    @Component({
      template: `<input-comp [input]="value" />`,
      imports: [InputComp],
    })
    class TestCmp {
      value = 1;
    }

    const fixture = TestBed.createComponent(TestCmp);

    expect(effectLog).toEqual([]);
    fixture.detectChanges();

    expect(effectLog).toEqual([1]);

    fixture.componentInstance.value = 2;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(effectLog).toEqual([1, 2]);
  });

  it('should support transforms', () => {
    @Component({
      selector: 'input-comp',
      template: 'input:{{input()}}',
    })
    class InputComp {
      input = input(0, {transform: (v: number) => v + 1000});
    }

    @Component({
      template: `<input-comp [input]="value" />`,
      imports: [InputComp],
    })
    class TestCmp {
      value = 1;
    }

    const fixture = TestBed.createComponent(TestCmp);
    const inputComp = fixture.debugElement.children[0].componentInstance as InputComp;
    expect(inputComp.input()).withContext('should not run transform on initial value').toBe(0);

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('input:1001');
  });

  it('should not run transforms lazily', () => {
    let transformRunCount = 0;
    @Component({
      selector: 'input-comp',
      template: '',
    })
    class InputComp {
      input = input(0, {
        transform: (v: number) => (transformRunCount++, v + 1000),
      });
    }

    @Component({
      template: `<input-comp [input]="value" />`,
      imports: [InputComp],
    })
    class TestCmp {
      value = 1;
    }

    const fixture = TestBed.createComponent(TestCmp);
    expect(transformRunCount).toBe(0);

    fixture.detectChanges();
    expect(transformRunCount).toBe(1);
  });

  it('should throw error if a required input is accessed too early', () => {
    @Component({
      selector: 'input-comp',
      template: 'input:{{input()}}',
    })
    class InputComp {
      input = input.required<number>({debugName: 'input'});

      constructor() {
        this.input();
      }
    }

    @Component({
      template: `<input-comp [input]="value" />`,
      imports: [InputComp],
    })
    class TestCmp {
      value = 1;
    }

    expect(() => TestBed.createComponent(TestCmp)).toThrowError(
      /Input "input" is required but no value is available yet/,
    );
  });

  it('should be possible to bind to an inherited input', () => {
    @Directive()
    class BaseDir {
      input = input<number>();
    }

    @Component({
      selector: 'input-comp',
      template: 'input:{{input()}}',
    })
    class InputComp extends BaseDir {}

    @Component({
      template: `<input-comp [input]="value" />`,
      imports: [InputComp],
    })
    class TestCmp {
      value = 1;
    }

    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('input:1');

    fixture.componentInstance.value = 2;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('input:2');
  });

  it('should support two-way binding to signal input and @Output decorated member', () => {
    @Directive({selector: '[dir]'})
    class Dir {
      value = input(0);
      @Output() valueChange = new EventEmitter<number>();
    }

    @Component({
      template: '<div [(value)]="value" dir></div>',
      imports: [Dir],
    })
    class App {
      @ViewChild(Dir) dir!: Dir;
      value = 1;
    }

    const fixture = TestBed.createComponent(App);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    // Initial value.
    expect(host.value).toBe(1);
    expect(host.dir.value()).toBe(1);

    // Changing the value from within the directive.
    host.dir.valueChange.emit(2);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(host.value).toBe(2);
    expect(host.dir.value()).toBe(2);

    // Changing the value from the outside.
    host.value = 3;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(host.value).toBe(3);
    expect(host.dir.value()).toBe(3);
  });

  it('should assign a debugName to the input signal node when a debugName is provided', () => {
    @Directive({selector: '[dir]'})
    class Dir {
      value = input(0, {debugName: 'TEST_DEBUG_NAME'});
    }

    @Component({
      template: '<div [value]="1" dir></div>',
      imports: [Dir],
    })
    class App {
      @ViewChild(Dir) dir!: Dir;
    }

    const fixture = TestBed.createComponent(App);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    expect(host.dir.value[SIGNAL].debugName).toBe('TEST_DEBUG_NAME');
  });

  it('should assign a debugName to the input signal node when a debugName is provided to a required input', () => {
    @Directive({selector: '[dir]'})
    class Dir {
      value = input.required({debugName: 'TEST_DEBUG_NAME'});
    }

    @Component({
      template: '<div [value]="1" dir></div>',
      imports: [Dir],
    })
    class App {
      @ViewChild(Dir) dir!: Dir;
    }

    const fixture = TestBed.createComponent(App);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    expect(host.dir.value[SIGNAL].debugName).toBe('TEST_DEBUG_NAME');
  });
});

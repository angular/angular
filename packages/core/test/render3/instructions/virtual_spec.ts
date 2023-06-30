/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {input, signal, ViewEncapsulation, ɵɵdefineComponent as defineComponent, ɵɵelement as element, ɵɵpropertyCreate as propertyCreate, ɵɵtext as text, ɵɵtextInterpolate as textInterpolate} from '@angular/core';
import {TestBed} from '@angular/core/testing';


describe('virtual instructions', () => {
  it('should support DOM bindings', () => {
    class TestCmp {
      value = 'hello';

      static ɵfac = () => new TestCmp();
      static ɵcmp = defineComponent({
        type: TestCmp,
        template:
            function TestCmp_Template(rf, ctx) {
              if (rf & 1) {
                element(0, 'input');
                propertyCreate(1, 'value', () => ctx.value);
              }
            },
        decls: 2,
        vars: 1,
        standalone: true,
        selectors: [['test-cmp']],
      });
    }

    const fixture = TestBed.createComponent(TestCmp);
    const el = fixture.nativeElement.firstChild as HTMLInputElement;
    fixture.detectChanges();

    expect(el.value).toEqual('hello');

    fixture.componentInstance.value = 'bye';
    fixture.detectChanges();
    // property bindings are wrapped into computed so don't update if the reactive value didn't
    // change
    expect(el.value).toEqual('hello');
  });

  it('should support signal -> signal bindings', () => {
    class SignalCmp {
      readonly value = input(0);

      static ɵfac = () => new SignalCmp();
      static ɵcmp = defineComponent({
        type: SignalCmp,
        template:
            function SignalCmp_Template(rf, ctx) {
              if (rf & 1) {
                text(0);
              }
              if (rf & 2) {
                textInterpolate(ctx.value());
              }
            },
        decls: 1,
        vars: 2,
        standalone: true,
        selectors: [['signal-cmp']],
        inputs: {'value': 'value'},
        signals: true,
        encapsulation: ViewEncapsulation.None,
      });
    }

    class TestCmp {
      value = signal(1);

      static ɵfac = () => new TestCmp();
      static ɵcmp = defineComponent({
        type: TestCmp,
        template:
            function TestCmp_Template(rf, ctx) {
              if (rf & 1) {
                element(0, 'signal-cmp');
                propertyCreate(1, 'value', () => ctx.value());
              }
            },
        decls: 2,
        vars: 1,
        standalone: true,
        selectors: [['test-cmp']],
        dependencies: [SignalCmp],
        signals: true,
        encapsulation: ViewEncapsulation.None,
      });
    }

    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    fixture.componentInstance.value.set(2);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe('<signal-cmp>2</signal-cmp>');
  });

  it('should support signal -> zone bindings', () => {
    class ZoneCmp {
      value = 0;

      static ɵfac = () => new ZoneCmp();
      static ɵcmp = defineComponent({
        type: ZoneCmp,
        template:
            function ZoneCmp_Template(rf, ctx) {
              if (rf & 1) {
                text(0);
              }
              if (rf & 2) {
                textInterpolate(ctx.value);
              }
            },
        decls: 1,
        vars: 2,
        standalone: true,
        selectors: [['zone-cmp']],
        inputs: {'value': 'value'},
        encapsulation: ViewEncapsulation.None,
      });
    }

    class TestCmp {
      value = signal(1);

      static ɵfac = () => new TestCmp();
      static ɵcmp = defineComponent({
        type: TestCmp,
        template:
            function TestCmp_Template(rf, ctx) {
              if (rf & 1) {
                element(0, 'zone-cmp');
                propertyCreate(1, 'value', () => ctx.value());
              }
            },
        decls: 2,
        vars: 1,
        standalone: true,
        selectors: [['test-cmp']],
        dependencies: [ZoneCmp],
        signals: true,
        encapsulation: ViewEncapsulation.None,
      });
    }

    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    fixture.componentInstance.value.set(2);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe('<zone-cmp ng-reflect-value="2">2</zone-cmp>');
  });
});

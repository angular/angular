# /out/two_way_to_any.ngtypecheck.ts
```ts
/**
 * TCB for /two_way_to_any.ts
 * @generated
 */

import * as i0 from './two_way_to_any';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*204,237*/ = null! as i0.NgModelDirective; /*T:VAE*/
    _t1.ngModel[i1.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] /*213,220*/ = i1.ɵunwrapWritableSignal(
      this.value /*229,234*/ /*229,234*/ as any /*224,235*/,
    ) /*211,236*/;
    _t1['ngModel'] /*213,220*/
      .subscribe(($event /*T:EP*/): any => {
        this.value /*229,234*/ /*229,234*/ as any /*224,235*/;
      }) /*211,236*/;
  }
}

```

# /out/two_way_to_any.ts
```ts
import { Component, Directive, model } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class NgModelDirective {
  ngModel = model(
    '',
    ...((ngDevMode ? [{ debugName: 'ngModel' }] : /* istanbul ignore next */ []) as []),
  );
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NgModelDirective, never> = function NgModelDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NgModelDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    NgModelDirective,
    '[ngModel]',
    never,
    { 'ngModel': { 'alias': 'ngModel'; 'required': false; 'isSignal': true } },
    { 'ngModel': 'ngModelChange' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: NgModelDirective,
    selectors: [['', 'ngModel', '']],
    inputs: { ngModel: [1, 'ngModel'] },
    outputs: { ngModel: 'ngModelChange' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NgModelDirective,
        [{ type: Directive, args: [{ selector: '[ngModel]' }] }],
        null,
        {
          ngModel: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'ngModel', required: false }] },
            { type: i0.Output, args: ['ngModelChange'] },
          ],
        },
      );
  }
}

export class TestCmp {
  value = 123;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never> = function TestCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCmp,
    'test-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [['test-cmp']],
    decls: 1,
    vars: 1,
    consts: [[3, 'ngModelChange', 'ngModel']],
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'input', 0);
        i0.ɵɵcontrolCreate();
        i0.ɵɵtwoWayListener(
          'ngModelChange',
          function TestCmp_Template_input_ngModelChange_0_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event);
            return $event;
          },
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵtwoWayProperty('ngModel', ctx.value);
        i0.ɵɵcontrol();
      }
    },
    dependencies: [NgModelDirective],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-cmp',
                template: '<input [(ngModel)]="$any(value)">',
                imports: [NgModelDirective],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: 'TestCmp',
      filePath: 'two_way_to_any.ts',
      lineNumber: 13,
    });
})();

```
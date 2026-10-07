# /out/two_way_binding_to_signal_loop_variable.ngtypecheck.ts
```ts
/**
 * TCB for /two_way_binding_to_signal_loop_variable.ts
 * @generated
 */

import * as i0 from './two_way_binding_to_signal_loop_variable';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    for (const _t1 /*219,223*/ of this.names /*227,232*/ /*227,232*/! /*227,232*/) {
      var _t2 /*249,249*/ = null! as number; /*T:VAE*/ /*249,249*/
      var _t3 /*T:DIR:0*/ /*256,284*/ = null! as i0.NgModelDirective; /*T:VAE*/
      _t3.ngModel[i1.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] /*265,272*/ = i1.ɵunwrapWritableSignal(
        _t1 /*276,280*/,
      ) /*263,281*/;
      _t3['ngModel'] /*265,272*/
        .subscribe(($event /*T:EP*/): any => {
          _t1 /*276,280*/;
        }) /*263,281*/;
      _t2 /*240,246*/;
    }
  }
}

```

# /out/two_way_binding_to_signal_loop_variable.ts
```ts
import { Component, Directive, model, signal } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function TestCmp_For_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r1: any = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, 'input', 1);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener(
      'ngModelChange',
      function TestCmp_For_1_Template_input_ngModelChange_0_listener($event: any): any {
        const name_r2: any = i0.ɵɵrestoreView(_r1).$implicit;
        i0.ɵɵtwoWayBindingSet(name_r2, $event);
        return i0.ɵɵresetView($event);
      },
    );
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const name_r2: any = ctx.$implicit;
    i0.ɵɵtwoWayProperty('ngModel', name_r2);
    i0.ɵɵcontrol();
  }
}

export class NgModelDirective {
  ngModel = model.required<string>(
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
    { 'ngModel': { 'alias': 'ngModel'; 'required': true; 'isSignal': true } },
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
        [
          {
            type: Directive,
            args: [
              {
                selector: '[ngModel]',
              },
            ],
          },
        ],
        null,
        {
          ngModel: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'ngModel', required: true }] },
            { type: i0.Output, args: ['ngModelChange'] },
          ],
        },
      );
  }
}

export class TestCmp {
  names = [signal('Angular')];
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never> = function TestCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCmp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [['ng-component']],
    decls: 2,
    vars: 0,
    consts: [
      [3, 'ngModel'],
      [3, 'ngModelChange', 'ngModel'],
    ],
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(0, TestCmp_For_1_Template, 1, 1, 'input', 0, i0.ɵɵrepeaterTrackByIndex);
      }
      if (rf & 2) {
        i0.ɵɵrepeater(ctx.names);
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
                template: `
        @for (name of names; track $index) {
          <input [(ngModel)]="name" />
        }
      `,
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
      filePath: 'two_way_binding_to_signal_loop_variable.ts',
      lineNumber: 18,
    });
})();

```
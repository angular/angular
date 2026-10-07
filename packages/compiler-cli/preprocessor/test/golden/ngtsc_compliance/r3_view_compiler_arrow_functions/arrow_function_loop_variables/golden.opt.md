# /out/arrow_function_loop_variables.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_loop_variables.ts
 * @generated
 */

import * as i0 from './arrow_function_loop_variables';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    for (const _t1 /*79,83*/ of this.items /*87,92*/ /*87,92*/! /*87,92*/) {
      var _t2 /*132,132*/ = null! as number; /*T:VAE*/ /*132,132*/
      var _t5 /*112,121*/ = null! as boolean; /*T:VAE*/ /*112,129*/
      for (const _t3 /*145,152*/ of _t1 /*156,160*/.subItems /*161,169*/ /*156,169*/! /*156,169*/) {
        var _t4 /*186,186*/ = null! as number; /*T:VAE*/ /*186,186*/
        var _t6 /*186,186*/ = null! as boolean; /*T:VAE*/ /*186,186*/
        '' +
          (
            () => _t5 /*196,205*/ || _t6 /*209,214*/ /*196,214*/ || _t4 /*218,224*/ /*196,224*/
          )() /*189,227*/;
        _t4; /*177,183*/
      }
      _t2; /*100,106*/
    }
  }
}

```

# /out/arrow_function_loop_variables.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const arrowFn0 =
  (ctx: any, view: any): any =>
  (): any => {
    const ctx_r0: any = i0.ɵɵrestoreView(view);
    const $index_r2: any = ctx_r0.$index;
    const ɵ$index_2_r3: any = ctx_r0.$index;
    const ɵ$index_1_r4: any = i0.ɵɵnextContext().$index;
    return i0.ɵɵresetView(ɵ$index_1_r4 % 2 === 0 || ɵ$index_2_r3 % 2 === 0 || $index_r2);
  };
function TestComp_For_1_For_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(' ', i0.ɵɵarrowFunction(1, arrowFn0, ctx)(), ' ');
  }
}
function TestComp_For_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵrepeaterCreate(
      0,
      TestComp_For_1_For_1_Template,
      1,
      2,
      null,
      null,
      i0.ɵɵrepeaterTrackByIndex,
    );
  }
  if (rf & 2) {
    const item_r5: any = ctx.$implicit;
    i0.ɵɵrepeater(item_r5.subItems);
  }
}

export class TestComp {
  items = [
    { name: 'one', subItems: ['sub one', 'sub two', 'sub three'] },
    { name: 'two', subItems: ['sub one', 'sub two', 'sub three'] },
    { name: 'three', subItems: ['sub one', 'sub two', 'sub three'] },
  ];
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never> = function TestComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [['ng-component']],
    decls: 2,
    vars: 0,
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(
          0,
          TestComp_For_1_Template,
          2,
          0,
          null,
          null,
          i0.ɵɵrepeaterTrackByIndex,
        );
      }
      if (rf & 2) {
        i0.ɵɵrepeater(ctx.items);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestComp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        @for (item of items; track $index; let outerEven = $even) {
          @for (subitem of item.subItems; track $index) {
            {{(() => outerEven || $even || $index)()}}
          }
        }
      `,
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
    i0.ɵsetClassDebugInfo(TestComp, {
      className: 'TestComp',
      filePath: 'arrow_function_loop_variables.ts',
      lineNumber: 12,
    });
})();

```
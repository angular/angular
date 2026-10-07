# /out/for_data_slots.ngtypecheck.ts
```ts
/**
 * TCB for /for_data_slots.ts
 * @generated
 */

import * as i0 from './for_data_slots';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    for (const _t1 /*212,216*/ of this.items /*220,225*/ /*220,225*/! /*220,225*/) {
      '' + _t1 /*243,247*/;
      _t1 /*233,237*/;
    }
  }
}

```

# /out/for_data_slots.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_ng_template_0_Template(rf: number, ctx: any): any {}
function MyApp_For_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const item_r1: any = ctx.$implicit;
    i0.ɵɵtextInterpolate1(' ', item_r1, ' ');
  }
}
function MyApp_ForEmpty_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Empty ');
  }
}
function MyApp_ng_template_4_Template(rf: number, ctx: any): any {}

// We verify the data slots by defining templates before/after
// and checking that the indexes are sequential.
export class MyApp {
  items = ['one', 'two', 'three'];
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    standalone: false,
    decls: 5,
    vars: 1,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyApp_ng_template_0_Template, 0, 0, 'ng-template');
        i0.ɵɵrepeaterCreate(
          1,
          MyApp_For_2_Template,
          1,
          1,
          null,
          null,
          i0.ɵɵrepeaterTrackByIdentity,
          false,
          MyApp_ForEmpty_3_Template,
          1,
          0,
        );
        i0.ɵɵtemplate(4, MyApp_ng_template_4_Template, 0, 0, 'ng-template');
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵrepeater(ctx.items);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        <ng-template/>
        @for (item of items; track item) {
          {{item}}
        } @empty {
          Empty
        }
        <ng-template/>
      `,
                standalone: false,
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'for_data_slots.ts',
      lineNumber: 17,
    });
})();

```
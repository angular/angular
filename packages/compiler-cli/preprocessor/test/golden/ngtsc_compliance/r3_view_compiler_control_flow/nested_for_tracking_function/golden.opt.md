# /out/nested_for_tracking_function.ngtypecheck.ts
```ts
/**
 * TCB for /nested_for_tracking_function.ts
 * @generated
 */

import * as i0 from './nested_for_tracking_function';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    for (const _t1 /*81,92*/ of this.items /*96,101*/ /*96,101*/! /*96,101*/) {
      var _t2 /*151,151*/ = null! as number; /*T:VAE*/ /*151,151*/
      for (const _t3 /*164,170*/ of _t1 /*174,185*/.items /*186,191*/ /*174,191*/! /*174,191*/) {
        var _t4 /*231,231*/ = null! as number; /*T:VAE*/ /*231,231*/
        for (const _t5 /*246,251*/ of _t3 /*255,261*/.items /*262,267*/ /*255,267*/! /*255,267*/) {
          var _t6 /*305,305*/ = null! as number; /*T:VAE*/ /*305,305*/
          this.trackByChild(/*275,287*/ _t5 /*288,293*/, _t6 /*295,301*/) /*275,302*/;
        }
        this.trackByParent(/*199,212*/ _t3 /*213,219*/, _t4 /*221,227*/) /*199,228*/;
      }
      this.trackByGrandparent(/*109,127*/ _t1 /*128,139*/, _t2 /*141,147*/) /*109,148*/;
    }
  }
}

```

# /out/nested_for_tracking_function.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function _forTrack0($index: number, $item: any): any {
  /* @ts-ignore */
  return this.trackByGrandparent($item, $index);
}
function _forTrack1($index: number, $item: any): any {
  /* @ts-ignore */
  return this.trackByParent($item, $index);
}
function _forTrack2($index: number, $item: any): any {
  /* @ts-ignore */
  return this.trackByChild($item, $index);
}
function MyApp_For_1_For_1_For_1_Template(rf: number, ctx: any): any {}
function MyApp_For_1_For_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, MyApp_For_1_For_1_For_1_Template, 0, 0, null, null, _forTrack2, true);
  }
  if (rf & 2) {
    const parent_r1: any = ctx.$implicit;
    i0.ɵɵrepeater(parent_r1.items);
  }
}
function MyApp_For_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, MyApp_For_1_For_1_Template, 2, 0, null, null, _forTrack1, true);
  }
  if (rf & 2) {
    const grandparent_r2: any = ctx.$implicit;
    i0.ɵɵrepeater(grandparent_r2.items);
  }
}

export class MyApp {
  items: any[] = [];
  trackByGrandparent = (item: any, index: number) => index;
  trackByParent = (item: any, index: number) => index;
  trackByChild = (item: any, index: number) => index;
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
    decls: 2,
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(0, MyApp_For_1_Template, 2, 0, null, null, _forTrack0, true);
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
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        @for (grandparent of items; track trackByGrandparent(grandparent, $index)) {
          @for (parent of grandparent.items; track trackByParent(parent, $index)) {
            @for (child of parent.items; track trackByChild(child, $index)) {

            }
          }
        }
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
      filePath: 'nested_for_tracking_function.ts',
      lineNumber: 15,
    });
})();

```
# /out/for_pure_track_reuse.ngtypecheck.ts
```ts
/**
 * TCB for /for_pure_track_reuse.ts
 * @generated
 */

import * as i0 from './for_pure_track_reuse';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    for (const _t1 /*81,85*/ of this.items /*89,94*/ /*89,94*/! /*89,94*/) {
      '' + _t1 /*134,138*/.name /*139,143*/ /*134,143*/;
      _t1 /*102,106*/.name /*107,111*/ /*102,111*/[0 /*112,113*/] /*102,114*/
        .toUpperCase /*115,126*/
        () /*102,128*/;
    }
    for (const _t2 /*169,178*/ of this.otherItems /*182,192*/ /*182,192*/! /*182,192*/) {
      '' + _t2 /*237,246*/.name /*247,251*/ /*237,251*/;
      _t2 /*200,209*/.name /*210,214*/ /*200,214*/[0 /*215,216*/] /*200,217*/
        .toUpperCase /*218,229*/
        () /*200,231*/;
    }
  }
}

```

# /out/for_pure_track_reuse.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _forTrack0 = ($index: number, $item: any): any => $item.name[0].toUpperCase();
function MyApp_For_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const item_r1: any = ctx.$implicit;
    i0.ɵɵtextInterpolate1(' ', item_r1.name, ' ');
  }
}
function MyApp_For_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const otherItem_r2: any = ctx.$implicit;
    i0.ɵɵtextInterpolate1(' ', otherItem_r2.name, ' ');
  }
}

export class MyApp {
  items = [{ name: 'one' }, { name: 'two' }, { name: 'three' }];
  otherItems = [{ name: 'four' }, { name: 'five' }, { name: 'six' }];
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
    decls: 4,
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(0, MyApp_For_1_Template, 1, 1, null, null, _forTrack0);
        i0.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 1, 1, null, null, _forTrack0);
      }
      if (rf & 2) {
        i0.ɵɵrepeater(ctx.items);
        i0.ɵɵadvance(2);
        i0.ɵɵrepeater(ctx.otherItems);
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
        @for (item of items; track item.name[0].toUpperCase()) {
          {{item.name}}
        }

        @for (otherItem of otherItems; track otherItem.name[0].toUpperCase()) {
          {{otherItem.name}}
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
      filePath: 'for_pure_track_reuse.ts',
      lineNumber: 15,
    });
})();

```
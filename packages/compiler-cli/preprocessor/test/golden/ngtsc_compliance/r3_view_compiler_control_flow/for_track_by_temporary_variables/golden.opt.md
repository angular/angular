# /out/for_track_by_temporary_variables.ngtypecheck.ts
```ts
/**
 * TCB for /for_track_by_temporary_variables.ts
 * @generated
 */

import * as i0 from './for_track_by_temporary_variables';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    for (const _t1 /*79,83*/ of this.items /*87,92*/ /*87,92*/! /*87,92*/) {
      _t1 /*100,104*/?.name /*106,110*/ /*100,110*/?.[0 /*113,114*/] /*100,115*/
        ?.toUpperCase /*117,128*/ /*100,128*/
        ?.() /*100,130*/ ?? this.foo /*134,137*/ /*134,137*/ /*100,137*/;
    }
    for (const _t2 /*152,156*/ of this.items /*160,165*/ /*160,165*/! /*160,165*/) {
      var _t3 /*202,202*/ = null! as number; /*T:VAE*/ /*202,202*/
      _t2 /*173,177*/.name /*178,182*/ /*173,182*/ ??
        _t3 /*186,192*/ /*173,192*/ ??
        this.foo /*196,199*/ /*196,199*/ /*173,199*/;
    }
  }
}

```

# /out/for_track_by_temporary_variables.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function _forTrack0($index: number, $item: any): any {
  /* @ts-ignore */
  return $item?.name?.[0]?.toUpperCase() ?? this.foo;
}
function _forTrack1($index: number, $item: any): any {
  /* @ts-ignore */
  return $item.name ?? $index ?? this.foo;
}
function MyApp_For_1_Template(rf: number, ctx: any): any {}
function MyApp_For_3_Template(rf: number, ctx: any): any {}

export class MyApp {
  foo: any;
  items: { name?: string }[] = [];
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
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    decls: 4,
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(0, MyApp_For_1_Template, 0, 0, null, null, _forTrack0, true);
        i0.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 0, 0, null, null, _forTrack1, true);
      }
      if (rf & 2) {
        i0.ɵɵrepeater(ctx.items);
        i0.ɵɵadvance(2);
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
        @for (item of items; track item?.name?.[0]?.toUpperCase() ?? foo) {}
        @for (item of items; track item.name ?? $index ?? foo) {}
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'for_track_by_temporary_variables.ts',
      lineNumber: 9,
    });
})();

```
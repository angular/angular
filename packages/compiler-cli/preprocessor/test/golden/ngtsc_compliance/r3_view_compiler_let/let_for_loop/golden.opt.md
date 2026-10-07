# /out/let_for_loop.ngtypecheck.ts
```ts
/**
 * TCB for /let_for_loop.ts
 * @generated
 */

import * as i0 from './let_for_loop';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    for (const _t1 /*79,83*/ of this.items /*87,92*/ /*87,92*/! /*87,92*/) {
      var _t3 /*107,107*/ = null! as boolean; /*T:VAE*/ /*107,107*/
      const _t2 /*119,129*/ = _t3 /*132,138*/; /*114,139*/
      for (const _t4 /*153,160*/ of _t1 /*164,168*/.children /*169,177*/ /*164,177*/! /*164,177*/) {
        var _t6 /*195,195*/ = null! as boolean; /*T:VAE*/ /*195,195*/
        const _t5 /*209,219*/ = _t6 /*222,228*/; /*204,229*/
        '' + (_t2 /*232,242*/ || _t5 /*246,256*/) /*232,256*/;
        _t4 /*185,192*/;
      }
      _t1 /*100,104*/;
    }
  }
}

```

# /out/let_for_loop.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_1_For_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ɵ$index_3_r1: any = ctx.$index;
    i0.ɵɵnextContext();
    const outerFirst_r2: any = i0.ɵɵreadContextLet(0);
    const innerFirst_r3: any = ɵ$index_3_r1 === 0;
    i0.ɵɵtextInterpolate1(' ', outerFirst_r2 || innerFirst_r3, ' ');
  }
}
function MyApp_For_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵrepeaterCreate(
      1,
      MyApp_For_1_For_2_Template,
      1,
      1,
      null,
      null,
      i0.ɵɵrepeaterTrackByIdentity,
    );
  }
  if (rf & 2) {
    const item_r4: any = ctx.$implicit;
    const ɵ$index_1_r5: any = ctx.$index;
    i0.ɵɵstoreLet(ɵ$index_1_r5 === 0);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(item_r4.children);
  }
}

export class MyApp {
  items: { children: any[] }[] = [];
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
    decls: 2,
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(
          0,
          MyApp_For_1_Template,
          3,
          1,
          null,
          null,
          i0.ɵɵrepeaterTrackByIdentity,
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
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        @for (item of items; track item) {
          @let outerFirst = $first;

          @for (subitem of item.children; track subitem) {
            @let innerFirst = $first;

            {{outerFirst || innerFirst}}
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'let_for_loop.ts',
      lineNumber: 16,
    });
})();

```
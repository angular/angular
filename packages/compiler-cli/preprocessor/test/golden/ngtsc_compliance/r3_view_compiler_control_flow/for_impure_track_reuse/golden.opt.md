# /out/for_impure_track_reuse.ngtypecheck.ts
```ts
/**
 * TCB for /for_impure_track_reuse.ts
 * @generated
 */

import * as i0 from './for_impure_track_reuse';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    for (const _t1 /*81,85*/ of this.items /*89,94*/ /*89,94*/! /*89,94*/) {
      '' + _t1 /*130,134*/.name /*135,139*/ /*130,139*/;
      this.trackFn(/*102,109*/ _t1 /*110,114*/, this.message /*116,123*/ /*116,123*/) /*102,124*/;
    }
    for (const _t2 /*165,174*/ of this.otherItems /*178,188*/ /*178,188*/! /*178,188*/) {
      '' + _t2 /*229,238*/.name /*239,243*/ /*229,243*/;
      this.trackFn(/*196,203*/ _t2 /*204,213*/, this.message /*215,222*/ /*215,222*/) /*196,223*/;
    }
  }
}

```

# /out/for_impure_track_reuse.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function _forTrack0($index: number, $item: any): any {
  /* @ts-ignore */
  return this.trackFn($item, this.message);
}
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
  message = 'hello';
  items = [{ name: 'one' }, { name: 'two' }, { name: 'three' }];
  otherItems = [{ name: 'four' }, { name: 'five' }, { name: 'six' }];

  trackFn(item: any, message: string) {
    return message + item.name;
  }
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
        i0.ɵɵrepeaterCreate(0, MyApp_For_1_Template, 1, 1, null, null, _forTrack0, true);
        i0.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 1, 1, null, null, _forTrack0, true);
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
        @for (item of items; track trackFn(item, message)) {
          {{item.name}}
        }

        @for (otherItem of otherItems; track trackFn(otherItem, message)) {
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
      filePath: 'for_impure_track_reuse.ts',
      lineNumber: 15,
    });
})();

```
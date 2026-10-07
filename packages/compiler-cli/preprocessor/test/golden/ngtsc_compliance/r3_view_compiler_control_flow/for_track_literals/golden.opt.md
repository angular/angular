# /out/for_track_literals.ngtypecheck.ts
```ts
/**
 * TCB for /for_track_literals.ts
 * @generated
 */

import * as i0 from './for_track_literals';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    for (const _t1 /*81,85*/ of this.items /*89,94*/ /*89,94*/! /*89,94*/) {
      '' + _t1 /*153,157*/.name /*158,162*/ /*153,162*/;
      this.trackFn(
        /*102,109*/ {
          'foo' /*111,114*/: _t1 /*116,120*/,
          'bar' /*122,125*/: _t1 /*127,131*/,
        } /*110,132*/,
        [_t1 /*135,139*/, _t1 /*141,145*/] /*134,146*/,
      ) /*102,147*/;
    }
  }
}

```

# /out/for_track_literals.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function _forTrack0($index: number, $item: any): any {
  /* @ts-ignore */
  return this.trackFn({ foo: $item, bar: $item }, [$item, $item]);
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

export class MyApp {
  items: { name: string }[] = [];

  trackFn(obj: any, arr: any[]) {
    return null;
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
    decls: 2,
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(0, MyApp_For_1_Template, 1, 1, null, null, _forTrack0, true);
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
        @for (item of items; track trackFn({foo: item, bar: item}, [item, item])) {
          {{item.name}}
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
      filePath: 'for_track_literals.ts',
      lineNumber: 11,
    });
})();

```
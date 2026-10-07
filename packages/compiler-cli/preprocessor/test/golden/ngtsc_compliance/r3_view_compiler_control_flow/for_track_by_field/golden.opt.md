# /out/for_track_by_field.ngtypecheck.ts
```ts
/**
 * TCB for /for_track_by_field.ts
 * @generated
 */

import * as i0 from './for_track_by_field';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*83,90*/ /*83,90*/;
    for (const _t1 /*111,115*/ of this.items /*119,124*/ /*119,124*/! /*119,124*/) {
      '' + _t1 /*164,168*/.name /*169,173*/ /*164,173*/;
      _t1 /*132,136*/.name /*137,141*/ /*132,141*/[0 /*142,143*/] /*132,144*/
        .toUpperCase /*145,156*/
        () /*132,158*/;
    }
  }
}

```

# /out/for_track_by_field.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _forTrack0 = ($index: number, $item: any): any => $item.name[0].toUpperCase();
function MyApp_For_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const item_r1: any = ctx.$implicit;
    i0.ɵɵtextInterpolate1(' ', item_r1.name, ' ');
  }
}

export class MyApp {
  message = 'hello';
  items = [{ name: 'one' }, { name: 'two' }, { name: 'three' }];
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
    vars: 1,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 1, 1, null, null, _forTrack0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.message, ' ');
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
        <div>
          {{message}}
          @for (item of items; track item.name[0].toUpperCase()) {
            {{item.name}}
          }
        </div>
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
      filePath: 'for_track_by_field.ts',
      lineNumber: 14,
    });
})();

```
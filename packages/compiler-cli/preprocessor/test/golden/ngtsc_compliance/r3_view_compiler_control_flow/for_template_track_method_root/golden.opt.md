# /out/for_template_track_method_root.ngtypecheck.ts
```ts
/**
 * TCB for /for_template_track_method_root.ts
 * @generated
 */

import * as i0 from './for_template_track_method_root';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*83,90*/ /*83,90*/;
    for (const _t1 /*111,115*/ of this.items /*119,124*/ /*119,124*/! /*119,124*/) {
      var _t2 /*156,156*/ = null! as number; /*T:VAE*/ /*156,156*/
      this.trackFn(/*132,139*/ _t2 /*140,146*/, _t1 /*148,152*/) /*132,153*/;
    }
  }
}

```

# /out/for_template_track_method_root.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_3_Template(rf: number, ctx: any): any {}

export class MyApp {
  message = 'hello';
  items = [{ name: 'one' }, { name: 'two' }, { name: 'three' }];

  trackFn(_index: number, item: any) {
    return item;
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
    vars: 1,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 0, 0, null, null, ctx.trackFn, true);
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
          @for (item of items; track trackFn($index, item)) {}
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
      filePath: 'for_template_track_method_root.ts',
      lineNumber: 12,
    });
})();

```
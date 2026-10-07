# /out/for_template_track_method_nested.ngtypecheck.ts
```ts
/**
 * TCB for /for_template_track_method_nested.ts
 * @generated
 */

import * as i0 from './for_template_track_method_nested';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*83,90*/ /*83,90*/;
    {
      for (const _t1 /*133,137*/ of this.items /*141,146*/ /*141,146*/! /*141,146*/) {
        var _t2 /*178,178*/ = null! as number; /*T:VAE*/ /*178,178*/
        this.trackFn(/*154,161*/ _t2 /*162,168*/, _t1 /*170,174*/) /*154,175*/;
      }
    }
  }
}

```

# /out/for_template_track_method_nested.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_ng_template_2_For_1_Template(rf: number, ctx: any): any {}
function MyApp_ng_template_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵrepeaterCreate(
      0,
      MyApp_ng_template_2_For_1_Template,
      0,
      0,
      null,
      null,
      i0.ɵɵcomponentInstance().trackFn,
      true,
    );
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r0.items);
  }
}

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
    decls: 3,
    vars: 1,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵtemplate(2, MyApp_ng_template_2_Template, 2, 0, 'ng-template');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.message, ' ');
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
          <ng-template>
            @for (item of items; track trackFn($index, item)) {}
          </ng-template>
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
      filePath: 'for_template_track_method_nested.ts',
      lineNumber: 14,
    });
})();

```
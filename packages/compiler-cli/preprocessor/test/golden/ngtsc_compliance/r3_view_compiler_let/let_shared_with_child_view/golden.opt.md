# /out/let_shared_with_child_view.ngtypecheck.ts
```ts
/**
 * TCB for /let_shared_with_child_view.ts
 * @generated
 */

import * as i0 from './let_shared_with_child_view';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    const _t1 /*78,83*/ = 123 /*86,89*/; /*73,90*/
    '' + _t1 /*93,98*/;
    {
      '' + _t1 /*124,129*/;
    }
  }
}

```

# /out/let_shared_with_child_view.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_ng_template_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const value_r1: any = i0.ɵɵreadContextLet(0);
    i0.ɵɵtextInterpolate(value_r1);
  }
}

export class MyApp {
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
    decls: 3,
    vars: 2,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdeclareLet(0);
        i0.ɵɵtext(1);
        i0.ɵɵdomTemplate(2, MyApp_ng_template_2_Template, 1, 1, 'ng-template');
      }
      if (rf & 2) {
        const value_r2: any = i0.ɵɵstoreLet(123);
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', value_r2, ' ');
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
        @let value = 123;
        {{value}}
        <ng-template>{{value}}</ng-template>
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
      filePath: 'let_shared_with_child_view.ts',
      lineNumber: 10,
    });
})();

```
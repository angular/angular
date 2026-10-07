# /out/ng_project_as_attribute.ngtypecheck.ts
```ts
/**
 * TCB for /ng_project_as_attribute.ts
 * @generated
 */

import * as i0 from './ng_project_as_attribute';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
  }
}

```

# /out/ng_project_as_attribute.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'div', 1);
  }
}

export class MyApp {
  show = true;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['my-app']],
    standalone: false,
    decls: 1,
    vars: 1,
    consts: [
      ['ngProjectAs', '.someclass', 5, ['', 8, 'someclass'], 4, 'ngIf'],
      ['ngProjectAs', '.someclass', 5, ['', 8, 'someclass']],
    ],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyApp_div_0_Template, 1, 0, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngIf', ctx.show);
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
                selector: 'my-app',
                template: '<div *ngIf="show" ngProjectAs=".someclass"></div>',
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
      filePath: 'ng_project_as_attribute.ts',
      lineNumber: 7,
    });
})();

```
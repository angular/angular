# /out/switch_without_default.ngtypecheck.ts
```ts
/**
 * TCB for /switch_without_default.ts
 * @generated
 */

import * as i0 from './switch_without_default';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*83,90*/ /*83,90*/;
    switch (
      this
        .value /*114,119*/
        () /*114,121*/
    ) {
      case 0 /*140,141*/:
        break;
      case 1 /*187,188*/:
        break;
      case 2 /*234,235*/:
        break;
    }
  }
}

```

# /out/switch_without_default.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Case_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' case 0 ');
  }
}
function MyApp_Case_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' case 1 ');
  }
}
function MyApp_Case_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' case 2 ');
  }
}

export class MyApp {
  message = 'hello';
  value = () => 1;
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
    decls: 5,
    vars: 2,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵconditionalCreate(2, MyApp_Case_2_Template, 1, 0)(3, MyApp_Case_3_Template, 1, 0)(
          4,
          MyApp_Case_4_Template,
          1,
          0,
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        let tmp_1_0;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.message, ' ');
        i0.ɵɵadvance();
        i0.ɵɵconditional(
          (tmp_1_0 = ctx.value()) === 0 ? 2 : tmp_1_0 === 1 ? 3 : tmp_1_0 === 2 ? 4 : -1,
        );
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
          @switch (value()) {
            @case (0) {
              case 0
            }
            @case (1) {
              case 1
            }
            @case (2) {
              case 2
            }
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
      filePath: 'switch_without_default.ts',
      lineNumber: 22,
    });
})();

```
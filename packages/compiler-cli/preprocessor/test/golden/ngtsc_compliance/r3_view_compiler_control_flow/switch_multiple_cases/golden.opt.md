# /out/switch_multiple_cases.ngtypecheck.ts
```ts
/**
 * TCB for /switch_multiple_cases.ts
 * @generated
 */

import * as i0 from './switch_multiple_cases';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*85,92*/ /*85,92*/;
    switch (
      this
        .value /*116,121*/
        () /*116,123*/
    ) {
      case -1 /*143,144*/ /*142,144*/:
        break;
      case 0 /*164,165*/:
      case 1 /*173,174*/:
        break;
      case 2 /*221,222*/:
        break;
      default:
        break;
    }
  }
}

```

# /out/switch_multiple_cases.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Case_2_Template(rf: number, ctx: any): any {}
function MyApp_Case_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' case 01 ');
  }
}
function MyApp_Case_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' case 2 ');
  }
}
function MyApp_Case_5_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' default ');
  }
}

export class MyApp {
  message = 'hello';

  value() {
    return 1;
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
    decls: 6,
    vars: 2,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵconditionalCreate(2, MyApp_Case_2_Template, 0, 0)(3, MyApp_Case_3_Template, 1, 0)(
          4,
          MyApp_Case_4_Template,
          1,
          0,
        )(5, MyApp_Case_5_Template, 1, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        let tmp_1_0;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.message, ' ');
        i0.ɵɵadvance();
        i0.ɵɵconditional(
          (tmp_1_0 = ctx.value()) === -1
            ? 2
            : tmp_1_0 === 0
              ? 3
              : tmp_1_0 === 1
                ? 3
                : tmp_1_0 === 2
                  ? 4
                  : 5,
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
            @case (-1) {}
            @case (0) @case(1) {
              case 01
            }
            @case (2) {
              case 2
            }
            @default {
              default
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
      filePath: 'switch_multiple_cases.ts',
      lineNumber: 23,
    });
})();

```
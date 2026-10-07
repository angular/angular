# /out/else_if_multiple_with_alias.ngtypecheck.ts
```ts
/**
 * TCB for /else_if_multiple_with_alias.ts
 * @generated
 */

import * as i0 from './else_if_multiple_with_alias';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*81,88*/ /*81,88*/;
    var _t1 /*116,119*/ = this.one /*108,111*/ /*108,111*/; /*116,119*/
    var _t2 /*218,221*/ = this.three /*208,213*/ /*208,213*/; /*218,221*/
    var _t3 /*275,278*/ = this.four /*266,270*/ /*266,270*/; /*275,278*/
    if (this.one /*108,111*/ /*108,111*/ && _t1) {
      '' + _t1 /*130,133*/;
    } else if (this.two /*162,165*/ /*162,165*/) {
      '' + this.two /*176,179*/ /*176,179*/;
    } else if (this.three /*208,213*/ /*208,213*/ && _t2) {
      '' + _t2 /*234,237*/;
    } else if (this.four /*266,270*/ /*266,270*/ && _t3) {
      '' + _t3 /*290,293*/;
    } else if (this.five /*322,326*/ /*322,326*/) {
      '' + this.five /*338,342*/ /*338,342*/;
    }
  }
}

```

# /out/else_if_multiple_with_alias.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Conditional_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(' One: ', ctx, ' ');
  }
}
function MyApp_Conditional_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(' Two: ', ctx_r0.two, ' ');
  }
}
function MyApp_Conditional_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(' Three: ', ctx, ' ');
  }
}
function MyApp_Conditional_5_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(' Four: ', ctx, ' ');
  }
}
function MyApp_Conditional_6_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(' Five: ', ctx_r0.five, ' ');
  }
}

export class MyApp {
  message = 'hello';
  one = 1;
  two = 2;
  three = 3;
  four = 4;
  five = 5;
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
    decls: 7,
    vars: 2,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 1, 1)(
          3,
          MyApp_Conditional_3_Template,
          1,
          1,
        )(4, MyApp_Conditional_4_Template, 1, 1)(5, MyApp_Conditional_5_Template, 1, 1)(
          6,
          MyApp_Conditional_6_Template,
          1,
          1,
        );
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        let tmp_1_0;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.message, ' ');
        i0.ɵɵadvance();
        i0.ɵɵconditional(
          (tmp_1_0 = ctx.one)
            ? 2
            : ctx.two
              ? 3
              : (tmp_1_0 = ctx.three)
                ? 4
                : (tmp_1_0 = ctx.four)
                  ? 5
                  : ctx.five
                    ? 6
                    : -1,
          tmp_1_0,
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
          @if (one; as foo) {
            One: {{foo}}
          } @else if (two) {
            Two: {{two}}
          } @else if (three; as bar) {
            Three: {{bar}}
          } @else if (four; as baz) {
            Four: {{baz}}
          } @else if (five) {
            Five: {{five}}
          }
        </div>
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
      filePath: 'else_if_multiple_with_alias.ts',
      lineNumber: 21,
    });
})();

```
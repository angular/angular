# /out/nested_if.ngtypecheck.ts
```ts
/**
 * TCB for /nested_if.ts
 * @generated
 */

import * as i0 from './nested_if';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*83,90*/ /*83,90*/;
    if (this.val /*110,113*/ /*110,113*/ === 0 /*118,119*/ /*110,119*/) {
    } else if (this.val /*154,157*/ /*154,157*/ === 1 /*162,163*/ /*154,163*/) {
    } else if (this.val /*197,200*/ /*197,200*/ === 2 /*205,206*/ /*197,206*/) {
      if (this.innerVal /*223,231*/ /*223,231*/ === 0 /*236,237*/ /*223,237*/) {
      } else if (this.innerVal /*282,290*/ /*282,290*/ === 1 /*295,296*/ /*282,296*/) {
      } else if (this.innerVal /*340,348*/ /*340,348*/ === 2 /*353,354*/ /*340,354*/) {
      } else {
      }
    } else {
    }
  }
}

```

# /out/nested_if.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Conditional_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' zero ');
  }
}
function MyApp_Conditional_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' one ');
  }
}
function MyApp_Conditional_4_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' inner zero ');
  }
}
function MyApp_Conditional_4_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' inner one ');
  }
}
function MyApp_Conditional_4_Conditional_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' inner two ');
  }
}
function MyApp_Conditional_4_Conditional_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' inner three ');
  }
}
function MyApp_Conditional_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵconditionalCreate(0, MyApp_Conditional_4_Conditional_0_Template, 1, 0)(
      1,
      MyApp_Conditional_4_Conditional_1_Template,
      1,
      0,
    )(2, MyApp_Conditional_4_Conditional_2_Template, 1, 0)(
      3,
      MyApp_Conditional_4_Conditional_3_Template,
      1,
      0,
    );
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵconditional(
      ctx_r0.innerVal === 0 ? 0 : ctx_r0.innerVal === 1 ? 1 : ctx_r0.innerVal === 2 ? 2 : 3,
    );
  }
}
function MyApp_Conditional_5_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' three ');
  }
}

export class MyApp {
  message = 'hello';
  val = 1;
  innerVal = 2;
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
        i0.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 1, 0)(
          3,
          MyApp_Conditional_3_Template,
          1,
          0,
        )(4, MyApp_Conditional_4_Template, 4, 1)(5, MyApp_Conditional_5_Template, 1, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.message, ' ');
        i0.ɵɵadvance();
        i0.ɵɵconditional(ctx.val === 0 ? 2 : ctx.val === 1 ? 3 : ctx.val === 2 ? 4 : 5);
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
          @if (val === 0) {
            zero
          } @else if (val === 1) {
            one
          } @else if (val === 2) {
            @if (innerVal === 0) {
              inner zero
            } @else if (innerVal === 1) {
              inner one
            } @else if (innerVal === 2) {
              inner two
            } @else {
              inner three
            }
          } @else {
            three
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
    i0.ɵsetClassDebugInfo(MyApp, { className: 'MyApp', filePath: 'nested_if.ts', lineNumber: 28 });
})();

```
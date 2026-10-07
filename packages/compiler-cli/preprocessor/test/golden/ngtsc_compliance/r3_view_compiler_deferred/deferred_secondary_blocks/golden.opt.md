# /out/deferred_secondary_blocks.ngtypecheck.ts
```ts
/**
 * TCB for /deferred_secondary_blocks.ts
 * @generated
 */

import * as i0 from './deferred_secondary_blocks';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*83,90*/ /*83,90*/;
    '' + this.loadingMessage /*161,175*/ /*161,175*/;
  }
}

```

# /out/deferred_secondary_blocks.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Defer_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'button');
  }
}
function MyApp_DeferLoading_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(' ', ctx_r0.loadingMessage, ' ');
  }
}
function MyApp_DeferPlaceholder_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'img', 0);
  }
}
function MyApp_DeferError_5_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Calendar failed to load ');
    i0.ɵɵelementStart(1, 'i');
    i0.ɵɵtext(2, 'sad');
    i0.ɵɵelementEnd();
  }
}

export class MyApp {
  message = 'hello';
  loadingMessage = 'Calendar is loading';
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
    decls: 8,
    vars: 1,
    consts: [['src', 'loading.gif']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵdomTemplate(2, MyApp_Defer_2_Template, 1, 0)(3, MyApp_DeferLoading_3_Template, 1, 1)(
          4,
          MyApp_DeferPlaceholder_4_Template,
          1,
          0,
        )(5, MyApp_DeferError_5_Template, 3, 0);
        i0.ɵɵdefer(6, 2, null, 3, 4, 5);
        i0.ɵɵdeferOnIdle();
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
          @defer {
            <button></button>
          } @loading {
            {{loadingMessage}}
          } @placeholder {
            <img src="loading.gif">
          } @error {
            Calendar failed to load <i>sad</i>
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
      filePath: 'deferred_secondary_blocks.ts',
      lineNumber: 20,
    });
})();

```
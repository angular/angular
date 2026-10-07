# /out/deferred_with_implicit_triggers.ngtypecheck.ts
```ts
/**
 * TCB for /deferred_with_implicit_triggers.ts
 * @generated
 */

import * as i0 from './deferred_with_implicit_triggers';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*162,169*/ /*162,169*/;
  }
}

```

# /out/deferred_with_implicit_triggers.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(' ', ctx_r0.message, ' ');
  }
}
function MyApp_DeferPlaceholder_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'button');
    i0.ɵɵtext(1, 'Click me');
    i0.ɵɵelementEnd();
  }
}

export class MyApp {
  message = 'hello';
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
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 1)(
          1,
          MyApp_DeferPlaceholder_1_Template,
          2,
          0,
        );
        i0.ɵɵdefer(2, 0, null, null, 1);
        i0.ɵɵdeferOnHover(0, -1);
        i0.ɵɵdeferOnInteraction(0, -1);
        i0.ɵɵdeferOnViewport(0, -1);
        i0.ɵɵdeferPrefetchOnHover(0, -1);
        i0.ɵɵdeferPrefetchOnInteraction(0, -1);
        i0.ɵɵdeferPrefetchOnViewport(0, -1);
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
        @defer (on hover, interaction, viewport; prefetch on hover, interaction, viewport) {
          {{message}}
        } @placeholder {
          <button>Click me</button>
        }
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
      filePath: 'deferred_with_implicit_triggers.ts',
      lineNumber: 13,
    });
})();

```
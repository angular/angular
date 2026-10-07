# /out/deferred_prefetch_on_viewport_with_options.ngtypecheck.ts
```ts
/**
 * TCB for /deferred_prefetch_on_viewport_with_options.ts
 * @generated
 */

import * as i0 from './deferred_prefetch_on_viewport_with_options';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*71,78*/ /*71,78*/;
    new IntersectionObserver(
      null!,
      {
        'rootMargin' /*136,146*/: '123px' /*148,155*/,
        'threshold' /*157,166*/: 59 /*168,170*/,
      } /*118,171*/,
    );
    '' + this.message /*178,185*/ /*178,185*/;
  }
}

```

# /out/deferred_prefetch_on_viewport_with_options.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Defer_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(' ', ctx_r0.message, ' ');
  }
}
function MyApp_DeferPlaceholder_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdomElementStart(0, 'button', null, 0);
    i0.ɵɵtext(2, 'Click me');
    i0.ɵɵdomElementEnd();
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
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    decls: 5,
    vars: 1,
    consts: [['button', '']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 1, 1)(
          2,
          MyApp_DeferPlaceholder_2_Template,
          3,
          0,
        );
        i0.ɵɵdefer(3, 1, null, null, 2);
        i0.ɵɵdeferPrefetchOnViewport(0, -1, { rootMargin: '123px', threshold: 59 });
        i0.ɵɵdeferOnIdle();
      }
      if (rf & 2) {
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
        {{message}}
        @defer (prefetch on viewport({trigger: button, rootMargin: '123px', threshold: 59})) {
          {{message}}
        } @placeholder {
          <button #button>Click me</button>
        }
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
      filePath: 'deferred_prefetch_on_viewport_with_options.ts',
      lineNumber: 13,
    });
})();

```
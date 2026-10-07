# /out/deferred_interaction_same_view_trigger.ngtypecheck.ts
```ts
/**
 * TCB for /deferred_interaction_same_view_trigger.ts
 * @generated
 */

import * as i0 from './deferred_interaction_same_view_trigger';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*73,80*/ /*73,80*/;
  }
}

```

# /out/deferred_interaction_same_view_trigger.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Defer_1_Template(rf: number, ctx: any): any {}

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
    decls: 10,
    vars: 1,
    consts: [['button', '']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 0, 0);
        i0.ɵɵdefer(2, 1);
        i0.ɵɵdeferOnInteraction(7);
        i0.ɵɵdeferPrefetchOnInteraction(7);
        i0.ɵɵelementStart(4, 'div')(5, 'div')(6, 'div')(7, 'button', null, 0);
        i0.ɵɵtext(9, 'Click me');
        i0.ɵɵelementEnd()()()();
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
        @defer (on interaction(button); prefetch on interaction(button)) {}

        <div>
          <div>
            <div>
              <button #button>Click me</button>
            </div>
          </div>
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
      filePath: 'deferred_interaction_same_view_trigger.ts',
      lineNumber: 18,
    });
})();

```
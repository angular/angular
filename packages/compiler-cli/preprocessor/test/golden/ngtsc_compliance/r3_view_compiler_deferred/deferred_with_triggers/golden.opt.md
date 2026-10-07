# /out/deferred_with_triggers.ngtypecheck.ts
```ts
/**
 * TCB for /deferred_with_triggers.ts
 * @generated
 */

import * as i0 from './deferred_with_triggers';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*73,80*/ /*73,80*/;
    if (
      this
        .isVisible /*111,120*/
        () /*111,122*/ ||
      this.isReady /*126,133*/ /*126,133*/ /*111,133*/
    ) {
    }
    '' + this.message /*259,266*/ /*259,266*/;
  }
}

```

# /out/deferred_with_triggers.ts
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
    i0.ɵɵelementStart(0, 'button', null, 0);
    i0.ɵɵtext(2, 'Click me');
    i0.ɵɵelementEnd();
  }
}

export class MyApp {
  message = 'hello';
  isReady = true;

  isVisible() {
    return false;
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
    decls: 5,
    vars: 2,
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
        i0.ɵɵdeferOnIdle();
        i0.ɵɵdeferOnImmediate();
        i0.ɵɵdeferOnTimer(1337);
        i0.ɵɵdeferOnHover(0, -1);
        i0.ɵɵdeferOnInteraction(0, -1);
        i0.ɵɵdeferOnViewport(0, -1);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(' ', ctx.message, ' ');
        i0.ɵɵadvance(3);
        i0.ɵɵdeferWhen(ctx.isVisible() || ctx.isReady);
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
        @defer (
          when isVisible() || isReady;
          on idle, timer(1337);
          on immediate, hover(button);
          on interaction(button);
          on viewport(button)) {
            {{message}}
          } @placeholder {
            <button #button>Click me</button>
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
      filePath: 'deferred_with_triggers.ts',
      lineNumber: 19,
    });
})();

```
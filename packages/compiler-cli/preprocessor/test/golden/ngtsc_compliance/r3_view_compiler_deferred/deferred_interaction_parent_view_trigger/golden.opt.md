# /out/deferred_interaction_parent_view_trigger.ngtypecheck.ts
```ts
/**
 * TCB for /deferred_interaction_parent_view_trigger.ts
 * @generated
 */

import * as i0 from './deferred_interaction_parent_view_trigger';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    {
      '' + this.message /*91,98*/ /*91,98*/;
    }
  }
}

```

# /out/deferred_interaction_parent_view_trigger.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_ng_template_0_ng_template_4_ng_template_0_Defer_0_Template(
  rf: number,
  ctx: any,
): any {}
function MyApp_ng_template_0_ng_template_4_ng_template_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdomTemplate(0, MyApp_ng_template_0_ng_template_4_ng_template_0_Defer_0_Template, 0, 0);
    i0.ɵɵdefer(1, 0);
    i0.ɵɵdeferOnInteraction(1, 2);
    i0.ɵɵdeferPrefetchOnInteraction(1, 2);
  }
}
function MyApp_ng_template_0_ng_template_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtemplate(0, MyApp_ng_template_0_ng_template_4_ng_template_0_Template, 3, 0, 'ng-template');
  }
}
function MyApp_ng_template_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵelementStart(1, 'button', null, 0);
    i0.ɵɵtext(3, 'Click me');
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, MyApp_ng_template_0_ng_template_4_Template, 1, 0, 'ng-template');
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(' ', ctx_r0.message, ' ');
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
    decls: 1,
    vars: 0,
    consts: [['button', '']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyApp_ng_template_0_Template, 5, 1, 'ng-template');
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
        <ng-template>
          {{message}}
          <button #button>Click me</button>

          <ng-template>
            <ng-template>
              @defer (on interaction(button); prefetch on interaction(button)) {}
            </ng-template>
          </ng-template>
        </ng-template>
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
      filePath: 'deferred_interaction_parent_view_trigger.ts',
      lineNumber: 18,
    });
})();

```
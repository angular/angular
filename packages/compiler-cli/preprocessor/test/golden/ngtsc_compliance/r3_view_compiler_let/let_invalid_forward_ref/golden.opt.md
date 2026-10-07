# /out/let_invalid_forward_ref.ngtypecheck.ts
```ts
/**
 * TCB for /let_invalid_forward_ref.ts
 * @generated
 */

import * as i0 from './let_invalid_forward_ref';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    {
      const _t1 /*115,121*/ =
        this.value /*124,129*/ /*124,129*/ * 2 /*132,133*/ /*124,133*/; /*110,134*/
      '' + (_t1 /*89,95*/ as any);
    }
  }
}

/* Diagnostics:
 - (89, 95) Cannot read @let declaration 'result' before it has been defined.
*/

```

# /out/let_invalid_forward_ref.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_ng_template_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(' ', undefined, ' ');
    ctx_r0.value * 2;
  }
}

export class MyApp {
  value = 1;
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
    decls: 1,
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyApp_ng_template_0_Template, 1, 1, 'ng-template');
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
          {{result}}
          @let result = value * 2;
        </ng-template>
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
      filePath: 'let_invalid_forward_ref.ts',
      lineNumber: 11,
    });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/let_invalid_forward_ref.ts",
      "category": "error",
      "code": 8016,
      "messageText": "Cannot read @let declaration 'result' before it has been defined.",
      "span": {
        "start": 89,
        "end": 95
      }
    }
  ]
}

```
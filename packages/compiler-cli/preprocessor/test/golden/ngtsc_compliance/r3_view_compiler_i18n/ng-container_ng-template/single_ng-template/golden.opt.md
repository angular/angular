# /out/single_ng-template.ngtypecheck.ts
```ts
/**
 * TCB for /single_ng-template.ts
 * @generated
 */

import * as i0 from './single_ng-template';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    {
      '' + (0 as any).transform(/*157,166*/ this.valueA /*148,154*/ /*148,154*/) /*148,166*/;
    }
  }
}

/* Diagnostics:
 - (157, 166) No pipe found with name 'uppercase'.
*/

```

# /out/single_ng-template.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_ng_template_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18n(0, 0);
    i0.ɵɵpipe(1, 'uppercase');
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵi18nExp(i0.ɵɵpipeBind1(1, 1, ctx_r0.valueA));
    i0.ɵɵi18nApply(0);
  }
}

export class MyComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
    decls: 1,
    vars: 0,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_355394464191978948$$_SINGLE_NG_TEMPLATE_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            'Some content: {$interpolation}',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{ valueA | uppercase }}' } },
          );
        i18n_0 = MSG_EXTERNAL_355394464191978948$$_SINGLE_NG_TEMPLATE_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Some content: ${'�0�'}:INTERPOLATION:`;
      }
      return [i18n_0];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 2, 3, 'ng-template');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-component',
                template: `
      <ng-template i18n>Some content: {{ valueA | uppercase }}</ng-template>
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'single_ng-template.ts',
      lineNumber: 10,
    });
})();

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/single_ng-template.ts",
      "category": "error",
      "code": 8004,
      "messageText": "No pipe found with name 'uppercase'.",
      "span": {
        "start": 157,
        "end": 166
      }
    }
  ]
}

```
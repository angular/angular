# /out/nested_templates.ngtypecheck.ts
```ts
/**
 * TCB for /nested_templates.ts
 * @generated
 */

import * as i0 from './nested_templates';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    {
      '' + this.valueA /*201,207*/ /*201,207*/;
      '' + (0 as any).transform(/*278,287*/ this.valueB /*269,275*/ /*269,275*/) /*269,287*/;
    }
  }
}

/* Diagnostics:
 - (278, 287) No pipe found with name 'uppercase'.
*/

```

# /out/nested_templates.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div')(1, 'div');
    i0.ɵɵi18nStart(2, 0);
    i0.ɵɵelement(3, 'div');
    i0.ɵɵpipe(4, 'uppercase');
    i0.ɵɵi18nEnd();
    i0.ɵɵelementEnd()();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵi18nExp(ctx_r0.valueA)(i0.ɵɵpipeBind1(4, 2, ctx_r0.valueB));
    i0.ɵɵi18nApply(2);
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
    decls: 3,
    vars: 1,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_1048067148715869345$$_NESTED_TEMPLATES_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            ' Some other content {$interpolation} {$startTagDiv} More nested levels with bindings {$interpolation_1} {$closeTagDiv}',
            {
              'closeTagDiv': '�/#3�',
              'interpolation': '�0�',
              'interpolation_1': '�1�',
              'startTagDiv': '�#3�',
            },
            {
              original_code: {
                'closeTagDiv': '</div>',
                'interpolation': '{{ valueA }}',
                'interpolation_1': '{{ valueB | uppercase }}',
                'startTagDiv': '<div>',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_1048067148715869345$$_NESTED_TEMPLATES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` Some other content ${'�0�'}:INTERPOLATION: ${'�#3�'}:START_TAG_DIV: More nested levels with bindings ${'�1�'}:INTERPOLATION_1: ${'�/#3�'}:CLOSE_TAG_DIV:`;
      }
      return [i18n_0, [4, 'ngIf']];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, ' Some content ');
        i0.ɵɵtemplate(2, MyComponent_div_2_Template, 5, 4, 'div', 1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵproperty('ngIf', ctx.visible);
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
      <div>
        Some content
        <div *ngIf="visible">
          <div i18n>
            Some other content {{ valueA }}
            <div>
              More nested levels with bindings {{ valueB | uppercase }}
            </div>
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'nested_templates.ts',
      lineNumber: 20,
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
      "filePath": "/nested_templates.ts",
      "category": "error",
      "code": 8004,
      "messageText": "No pipe found with name 'uppercase'.",
      "span": {
        "start": 278,
        "end": 287
      }
    }
  ]
}

```
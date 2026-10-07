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
      '' + (0 as any).transform(/*166,175*/ this.valueA /*157,163*/ /*157,163*/) /*157,175*/;
      {
        '' + this.valueB /*220,226*/ /*220,226*/;
        {
          '' + this.valueC /*275,281*/ /*275,281*/;
        }
      }
    }
  }
}

/* Diagnostics:
 - (166, 175) No pipe found with name 'uppercase'.
*/

```

# /out/nested_templates.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_ng_template_2_ng_template_2_ng_template_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18n(0, 0, 3);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext(3);
    i0.ɵɵi18nExp(ctx_r0.valueC);
    i0.ɵɵi18nApply(0);
  }
}
function MyComponent_ng_template_2_ng_template_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵtemplate(
      1,
      MyComponent_ng_template_2_ng_template_2_ng_template_1_Template,
      1,
      1,
      'ng-template',
    );
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵi18nExp(ctx_r0.valueB);
    i0.ɵɵi18nApply(0);
  }
}
function MyComponent_ng_template_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵpipe(1, 'uppercase');
    i0.ɵɵtemplate(2, MyComponent_ng_template_2_ng_template_2_Template, 2, 1, 'ng-template');
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
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
    decls: 3,
    vars: 0,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4054819503343192023$$_NESTED_TEMPLATES_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{$startTagNgTemplate} Template A: {$interpolation} {$startTagNgTemplate} Template B: {$interpolation_1} {$startTagNgTemplate} Template C: {$interpolation_2} {$closeTagNgTemplate}{$closeTagNgTemplate}{$closeTagNgTemplate}',
            {
              'closeTagNgTemplate': '[�/*1:3�|�/*2:2�|�/*2:1�]',
              'interpolation': '�0:1�',
              'interpolation_1': '�0:2�',
              'interpolation_2': '�0:3�',
              'startTagNgTemplate': '[�*2:1�|�*2:2�|�*1:3�]',
            },
            {
              original_code: {
                'closeTagNgTemplate': '</ng-template>',
                'interpolation': '{{ valueA | uppercase }}',
                'interpolation_1': '{{ valueB }}',
                'interpolation_2': '{{ valueC }}',
                'startTagNgTemplate': '<ng-template>',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_4054819503343192023$$_NESTED_TEMPLATES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${'[�*2:1�|�*2:2�|�*1:3�]'}:START_TAG_NG_TEMPLATE: Template A: ${'�0:1�'}:INTERPOLATION: ${'[�*2:1�|�*2:2�|�*1:3�]'}:START_TAG_NG_TEMPLATE: Template B: ${'�0:2�'}:INTERPOLATION_1: ${'[�*2:1�|�*2:2�|�*1:3�]'}:START_TAG_NG_TEMPLATE: Template C: ${'�0:3�'}:INTERPOLATION_2: ${'[�/*1:3�|�/*2:2�|�/*2:1�]'}:CLOSE_TAG_NG_TEMPLATE:${'[�/*1:3�|�/*2:2�|�/*2:1�]'}:CLOSE_TAG_NG_TEMPLATE:${'[�/*1:3�|�/*2:2�|�/*2:1�]'}:CLOSE_TAG_NG_TEMPLATE:`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0);
      return [i18n_0];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_ng_template_2_Template, 3, 3, 'ng-template');
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
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
      <div i18n>
        <ng-template>
          Template A: {{ valueA | uppercase }}
          <ng-template>
            Template B: {{ valueB }}
            <ng-template>
              Template C: {{ valueC }}
            </ng-template>
          </ng-template>
        </ng-template>
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
        "start": 166,
        "end": 175
      }
    }
  ]
}

```
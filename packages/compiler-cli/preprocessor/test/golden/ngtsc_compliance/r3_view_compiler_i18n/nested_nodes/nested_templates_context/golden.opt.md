# /out/nested_templates_context.ngtypecheck.ts
```ts
/**
 * TCB for /nested_templates_context.ts
 * @generated
 */

import * as i0 from './nested_templates_context';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    {
      '' + this.valueA /*189,195*/ /*189,195*/;
      '' + (0 as any).transform(/*262,271*/ this.valueB /*253,259*/ /*253,259*/) /*253,271*/;
      {
        '' + this.valueC /*343,349*/ /*343,349*/;
        '' + this.valueD /*403,409*/ /*403,409*/;
      }
    }
    {
      '' + (this.valueE /*530,536*/ /*530,536*/ + this.valueF /*539,545*/ /*539,545*/) /*530,545*/;
      '' + (0 as any).transform(/*612,621*/ this.valueG /*603,609*/ /*603,609*/) /*603,621*/;
    }
  }
}

/* Diagnostics:
 - (262, 271) No pipe found with name 'uppercase'.
 - (612, 621) No pipe found with name 'uppercase'.
*/

```

# /out/nested_templates_context.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_2_div_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵelementStart(1, 'div');
    i0.ɵɵelement(2, 'div');
    i0.ɵɵelementEnd();
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵi18nExp(ctx_r0.valueC)(ctx_r0.valueD);
    i0.ɵɵi18nApply(0);
  }
}
function MyComponent_div_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelementStart(1, 'div')(2, 'div');
    i0.ɵɵpipe(3, 'uppercase');
    i0.ɵɵtemplate(4, MyComponent_div_2_div_4_Template, 3, 2, 'div', 1);
    i0.ɵɵelementEnd()();
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵproperty('ngIf', ctx_r0.exists);
    i0.ɵɵi18nExp(ctx_r0.valueA)(i0.ɵɵpipeBind1(3, 3, ctx_r0.valueB));
    i0.ɵɵi18nApply(0);
  }
}
function MyComponent_div_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 3);
    i0.ɵɵelementStart(1, 'div');
    i0.ɵɵelement(2, 'div');
    i0.ɵɵpipe(3, 'uppercase');
    i0.ɵɵelementEnd();
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵi18nExp(ctx_r0.valueE + ctx_r0.valueF)(i0.ɵɵpipeBind1(3, 2, ctx_r0.valueG));
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
    decls: 4,
    vars: 2,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4021381850553435020$$_NESTED_TEMPLATES_CONTEXT_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            ' Some content {$startTagDiv_2} Some other content {$interpolation} {$startTagDiv} More nested levels with bindings {$interpolation_1} {$startTagDiv_1} Content inside sub-template {$interpolation_2} {$startTagDiv} Bottom level element {$interpolation_3} {$closeTagDiv}{$closeTagDiv}{$closeTagDiv}{$closeTagDiv}{$startTagDiv_3} Some other content {$interpolation_4} {$startTagDiv} More nested levels with bindings {$interpolation_5} {$closeTagDiv}{$closeTagDiv}',
            {
              'closeTagDiv':
                '[�/#2:2�|�/#1:2��/*4:2�|�/#2:1�|�/#1:1��/*2:1�|�/#2:3�|�/#1:3��/*3:3�]',
              'interpolation': '�0:1�',
              'interpolation_1': '�1:1�',
              'interpolation_2': '�0:2�',
              'interpolation_3': '�1:2�',
              'interpolation_4': '�0:3�',
              'interpolation_5': '�1:3�',
              'startTagDiv': '[�#2:1�|�#2:2�|�#2:3�]',
              'startTagDiv_1': '�*4:2��#1:2�',
              'startTagDiv_2': '�*2:1��#1:1�',
              'startTagDiv_3': '�*3:3��#1:3�',
            },
            {
              original_code: {
                'closeTagDiv': '</div>',
                'interpolation': '{{ valueA }}',
                'interpolation_1': '{{ valueB | uppercase }}',
                'interpolation_2': '{{ valueC }}',
                'interpolation_3': '{{ valueD }}',
                'interpolation_4': '{{ valueE + valueF }}',
                'interpolation_5': '{{ valueG | uppercase }}',
                'startTagDiv': '<div>',
                'startTagDiv_1': '<div *ngIf="exists">',
                'startTagDiv_2': '<div *ngIf="visible">',
                'startTagDiv_3': '<div *ngIf="!visible">',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_4021381850553435020$$_NESTED_TEMPLATES_CONTEXT_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` Some content ${'�*2:1��#1:1�'}:START_TAG_DIV_2: Some other content ${'�0:1�'}:INTERPOLATION: ${'[�#2:1�|�#2:2�|�#2:3�]'}:START_TAG_DIV: More nested levels with bindings ${'�1:1�'}:INTERPOLATION_1: ${'�*4:2��#1:2�'}:START_TAG_DIV_1: Content inside sub-template ${'�0:2�'}:INTERPOLATION_2: ${'[�#2:1�|�#2:2�|�#2:3�]'}:START_TAG_DIV: Bottom level element ${'�1:2�'}:INTERPOLATION_3: ${'[�/#2:2�|�/#1:2��/*4:2�|�/#2:1�|�/#1:1��/*2:1�|�/#2:3�|�/#1:3��/*3:3�]'}:CLOSE_TAG_DIV:${'[�/#2:2�|�/#1:2��/*4:2�|�/#2:1�|�/#1:1��/*2:1�|�/#2:3�|�/#1:3��/*3:3�]'}:CLOSE_TAG_DIV:${'[�/#2:2�|�/#1:2��/*4:2�|�/#2:1�|�/#1:1��/*2:1�|�/#2:3�|�/#1:3��/*3:3�]'}:CLOSE_TAG_DIV:${'[�/#2:2�|�/#1:2��/*4:2�|�/#2:1�|�/#1:1��/*2:1�|�/#2:3�|�/#1:3��/*3:3�]'}:CLOSE_TAG_DIV:${'�*3:3��#1:3�'}:START_TAG_DIV_3: Some other content ${'�0:3�'}:INTERPOLATION_4: ${'[�#2:1�|�#2:2�|�#2:3�]'}:START_TAG_DIV: More nested levels with bindings ${'�1:3�'}:INTERPOLATION_5: ${'[�/#2:2�|�/#1:2��/*4:2�|�/#2:1�|�/#1:1��/*2:1�|�/#2:3�|�/#1:3��/*3:3�]'}:CLOSE_TAG_DIV:${'[�/#2:2�|�/#1:2��/*4:2�|�/#2:1�|�/#1:1��/*2:1�|�/#2:3�|�/#1:3��/*3:3�]'}:CLOSE_TAG_DIV:`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0);
      return [i18n_0, [4, 'ngIf']];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_div_2_Template, 5, 5, 'div', 1)(
          3,
          MyComponent_div_3_Template,
          4,
          4,
          'div',
          1,
        );
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵproperty('ngIf', ctx.visible);
        i0.ɵɵadvance();
        i0.ɵɵproperty('ngIf', !ctx.visible);
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
        Some content
        <div *ngIf="visible">
          Some other content {{ valueA }}
          <div>
            More nested levels with bindings {{ valueB | uppercase }}
            <div *ngIf="exists">
              Content inside sub-template {{ valueC }}
              <div>
                Bottom level element {{ valueD }}
              </div>
            </div>
          </div>
        </div>
        <div *ngIf="!visible">
          Some other content {{ valueE + valueF }}
          <div>
            More nested levels with bindings {{ valueG | uppercase }}
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
      filePath: 'nested_templates_context.ts',
      lineNumber: 30,
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
      "filePath": "/nested_templates_context.ts",
      "category": "error",
      "code": 8004,
      "messageText": "No pipe found with name 'uppercase'.",
      "span": {
        "start": 262,
        "end": 271
      }
    },
    {
      "filePath": "/nested_templates_context.ts",
      "category": "error",
      "code": 8004,
      "messageText": "No pipe found with name 'uppercase'.",
      "span": {
        "start": 612,
        "end": 621
      }
    }
  ]
}

```
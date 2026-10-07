# /out/nested_ng-container_const.ngtypecheck.ts
```ts
/**
 * TCB for /nested_ng-container_const.ts
 * @generated
 */

import * as i0 from './nested_ng-container_const';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/nested_ng-container_const.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_ng_template_0_ng_container_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelementContainer(1);
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_ng_template_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0);
    i0.ɵɵtemplate(1, MyComponent_ng_template_0_ng_container_1_Template, 2, 0, 'ng-container', 1);
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty('ngIf', ctx_r0.visible);
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
        const MSG_EXTERNAL_7808514454697497181$$_NESTED_NG_CONTAINER_CONST_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            ' Root content {$startTagNgContainer} Nested content {$closeTagNgContainer}',
            { 'closeTagNgContainer': '�/#1:1��/*1:1�', 'startTagNgContainer': '�*1:1��#1:1�' },
            {
              original_code: {
                'closeTagNgContainer': '</ng-container>',
                'startTagNgContainer': '<ng-container *ngIf="visible">',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_7808514454697497181$$_NESTED_NG_CONTAINER_CONST_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` Root content ${'�*1:1��#1:1�'}:START_TAG_NG_CONTAINER: Nested content ${'�/#1:1��/*1:1�'}:CLOSE_TAG_NG_CONTAINER:`;
      }
      return [i18n_0, [4, 'ngIf']];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 2, 1, 'ng-template');
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
      <ng-template i18n>
        Root content
        <ng-container *ngIf="visible">
          Nested content
        </ng-container>
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'nested_ng-container_const.ts',
      lineNumber: 15,
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
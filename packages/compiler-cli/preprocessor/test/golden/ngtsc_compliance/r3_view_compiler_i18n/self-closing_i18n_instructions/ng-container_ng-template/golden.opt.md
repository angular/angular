# /out/ng-container_ng-template.ngtypecheck.ts
```ts
/**
 * TCB for /ng-container_ng-template.ts
 * @generated
 */

import * as i0 from './ng-container_ng-template';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/ng-container_ng-template.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_ng_template_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18n(0, 1);
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
        const MSG_EXTERNAL_2413150872298537152$$_NG_CONTAINER_NG_TEMPLATE_TS_0 =
          /* @ts-ignore */
          goog.getMsg('My i18n block #2');
        i18n_0 = MSG_EXTERNAL_2413150872298537152$$_NG_CONTAINER_NG_TEMPLATE_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`My i18n block #2`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4890179241114413722$$_NG_CONTAINER_NG_TEMPLATE_TS_1 =
          /* @ts-ignore */
          goog.getMsg('My i18n block #1');
        i18n_1 = MSG_EXTERNAL_4890179241114413722$$_NG_CONTAINER_NG_TEMPLATE_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`My i18n block #1`;
      }
      return [i18n_0, i18n_1];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 1, 0, 'ng-template');
        i0.ɵɵelementContainerStart(1);
        i0.ɵɵi18n(2, 0);
        i0.ɵɵelementContainerEnd();
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
      <ng-template i18n>My i18n block #1</ng-template>
      <ng-container i18n>My i18n block #2</ng-container>
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
      filePath: 'ng-container_ng-template.ts',
      lineNumber: 11,
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
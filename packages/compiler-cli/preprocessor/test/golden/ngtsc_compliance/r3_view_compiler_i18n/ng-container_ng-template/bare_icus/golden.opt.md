# /out/bare_icus.ngtypecheck.ts
```ts
/**
 * TCB for /bare_icus.ts
 * @generated
 */

import * as i0 from './bare_icus';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    {
      '' + this.gender /*127,133*/ /*127,133*/;
    }
    '' + this.age /*217,220*/ /*217,220*/;
  }
}

```

# /out/bare_icus.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_ng_template_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18n(0, 1);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵi18nExp(ctx_r0.gender);
    i0.ɵɵi18nApply(0);
  }
}

export class MyComponent {
  age = 0;
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
        const MSG_EXTERNAL_8806993169187953163$$_BARE_ICUS_TS_0 =
          /* @ts-ignore */
          goog.getMsg('{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}');
        i18n_0 = MSG_EXTERNAL_8806993169187953163$$_BARE_ICUS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { 'VAR_SELECT': '�0�' });
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7842238767399919809$$_BARE_ICUS_TS_1 =
          /* @ts-ignore */
          goog.getMsg('{VAR_SELECT, select, male {male} female {female} other {other}}');
        i18n_1 = MSG_EXTERNAL_7842238767399919809$$_BARE_ICUS_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`{VAR_SELECT, select, male {male} female {female} other {other}}`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { 'VAR_SELECT': '�0�' });
      return [i18n_0, i18n_1];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 1, 1, 'ng-template');
        i0.ɵɵelementContainerStart(1);
        i0.ɵɵi18n(2, 0);
        i0.ɵɵelementContainerEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.age);
        i0.ɵɵi18nApply(2);
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
      <ng-template>{gender, select, male {male} female {female} other {other}}</ng-template>
      <ng-container>{age, select, 10 {ten} 20 {twenty} other {other}}</ng-container>
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
      filePath: 'bare_icus.ts',
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
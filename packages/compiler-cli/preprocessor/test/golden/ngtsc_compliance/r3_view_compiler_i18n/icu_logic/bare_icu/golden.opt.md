# /out/bare_icu.ngtypecheck.ts
```ts
/**
 * TCB for /bare_icu.ts
 * @generated
 */

import * as i0 from './bare_icu';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.gender /*119,125*/ /*119,125*/;
    {
      '' + this.age /*230,233*/ /*230,233*/;
    }
    {
      '' + this.count /*349,354*/ /*349,354*/;
      '' + this.count /*401,406*/ /*401,406*/;
    }
  }
}

```

# /out/bare_icu.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div', 5);
    i0.ɵɵtext(1, ' ');
    i0.ɵɵi18n(2, 1);
    i0.ɵɵtext(3, ' ');
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵi18nExp(ctx_r0.age);
    i0.ɵɵi18nApply(2);
  }
}
function MyComponent_div_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div', 6);
    i0.ɵɵtext(1, ' You have ');
    i0.ɵɵi18n(2, 2);
    i0.ɵɵtext(3, '. ');
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵi18nExp(ctx_r0.count)(ctx_r0.count);
    i0.ɵɵi18nApply(2);
  }
}

export class MyComponent {
  gender = 'female';
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
    vars: 3,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7842238767399919809$$_BARE_ICU_TS_0 =
          /* @ts-ignore */
          goog.getMsg('{VAR_SELECT, select, male {male} female {female} other {other}}');
        i18n_0 = MSG_EXTERNAL_7842238767399919809$$_BARE_ICU_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`{VAR_SELECT, select, male {male} female {female} other {other}}`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { 'VAR_SELECT': '�0�' });
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_8806993169187953163$$_BARE_ICU_TS_1 =
          /* @ts-ignore */
          goog.getMsg('{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}');
        i18n_1 = MSG_EXTERNAL_8806993169187953163$$_BARE_ICU_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { 'VAR_SELECT': '�0�' });
      let i18n_2;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_1922743304863699161$$_BARE_ICU_TS_2 =
          /* @ts-ignore */
          goog.getMsg(
            '{VAR_SELECT, select, 0 {no emails} 1 {one email} other {{INTERPOLATION} emails}}',
          );
        i18n_2 = MSG_EXTERNAL_1922743304863699161$$_BARE_ICU_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize`{VAR_SELECT, select, 0 {no emails} 1 {one email} other {{INTERPOLATION} emails}}`;
      }
      i18n_2 = i0.ɵɵi18nPostprocess(i18n_2, { 'INTERPOLATION': '�1�', 'VAR_SELECT': '�0�' });
      return [
        i18n_0,
        i18n_1,
        i18n_2,
        ['title', 'icu only', 4, 'ngIf'],
        ['title', 'icu and text', 4, 'ngIf'],
        ['title', 'icu only'],
        ['title', 'icu and text'],
      ];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
        i0.ɵɵtemplate(2, MyComponent_div_2_Template, 4, 1, 'div', 3)(
          3,
          MyComponent_div_3_Template,
          4,
          2,
          'div',
          4,
        );
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.gender);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance();
        i0.ɵɵproperty('ngIf', ctx.visible);
        i0.ɵɵadvance();
        i0.ɵɵproperty('ngIf', ctx.available);
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
      <div>{gender, select, male {male} female {female} other {other}}</div>
      <div *ngIf="visible" title="icu only">
        {age, select, 10 {ten} 20 {twenty} other {other}}
      </div>
      <div *ngIf="available" title="icu and text">
        You have {count, select, 0 {no emails} 1 {one email} other {{{count}} emails}}.
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
      filePath: 'bare_icu.ts',
      lineNumber: 16,
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
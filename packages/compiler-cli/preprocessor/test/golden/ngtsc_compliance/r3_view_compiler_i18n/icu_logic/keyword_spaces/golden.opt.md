# /out/keyword_spaces.ngtypecheck.ts
```ts
/**
 * TCB for /keyword_spaces.ts
 * @generated
 */

import * as i0 from './keyword_spaces';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.count /*129,134*/ /*129,134*/;
    '' + this.count /*181,186*/ /*181,186*/;
  }
}

```

# /out/keyword_spaces.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  count = 0;
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
    decls: 2,
    vars: 2,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_199763560911211963$$_KEYWORD_SPACES_TS_0 =
          /* @ts-ignore */
          goog.getMsg('{VAR_SELECT , select , 1 {one} other {more than one}}');
        i18n_0 = MSG_EXTERNAL_199763560911211963$$_KEYWORD_SPACES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`{VAR_SELECT , select , 1 {one} other {more than one}}`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { 'VAR_SELECT': '�0�' });
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_3383986062053865025$$_KEYWORD_SPACES_TS_1 =
          /* @ts-ignore */
          goog.getMsg('{VAR_PLURAL , plural , =1 {one} other {more than one}}');
        i18n_1 = MSG_EXTERNAL_3383986062053865025$$_KEYWORD_SPACES_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`{VAR_PLURAL , plural , =1 {one} other {more than one}}`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { 'VAR_PLURAL': '�1�' });
      let i18n_2;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6804521423144261079$$_KEYWORD_SPACES_TS_2 =
          /* @ts-ignore */
          goog.getMsg(
            ' {$icu} {$icu_1} ',
            { 'icu': i18n_0, 'icu_1': i18n_1 },
            {
              original_code: {
                'icu': '{count, select , 1 {one} other {more than one}}',
                'icu_1': '{count, plural , =1 {one} other {more than one}}',
              },
            },
          );
        i18n_2 = MSG_EXTERNAL_6804521423144261079$$_KEYWORD_SPACES_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize` ${i18n_0}:ICU@@4297240864973290312: ${i18n_1}:ICU_1@@149492185132484300: `;
      }
      return [i18n_2];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.count)(ctx.count);
        i0.ɵɵi18nApply(1);
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
        {count, select , 1 {one} other {more than one}}
        {count, plural , =1 {one} other {more than one}}
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
      filePath: 'keyword_spaces.ts',
      lineNumber: 13,
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
# /out/last_elem_inside_i18n_block.ngtypecheck.ts
```ts
/**
 * TCB for /last_elem_inside_i18n_block.ts
 * @generated
 */

import * as i0 from './last_elem_inside_i18n_block';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.text /*126,130*/ /*126,130*/;
    '' + this.attr /*158,162*/ /*158,162*/;
  }
}

```

# /out/last_elem_inside_i18n_block.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  attr: any;
  text: any;
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
        const MSG_EXTERNAL_1678983741718428223$$_LAST_ELEM_INSIDE_I18N_BLOCK_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{$interpolation}',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{ attr }}' } },
          );
        i18n_0 = MSG_EXTERNAL_1678983741718428223$$_LAST_ELEM_INSIDE_I18N_BLOCK_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${'�0�'}:INTERPOLATION:`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_3554215745691683147$$_LAST_ELEM_INSIDE_I18N_BLOCK_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            '{$interpolation}{$startHeadingLevel1}{$closeHeadingLevel1}',
            { 'closeHeadingLevel1': '�/#2�', 'interpolation': '�0�', 'startHeadingLevel1': '�#2�' },
            {
              original_code: {
                'closeHeadingLevel1': '</h1>',
                'interpolation': '{{ text }}',
                'startHeadingLevel1': '<h1 i18n-title title="{{ attr }}">',
              },
            },
          );
        i18n_1 = MSG_EXTERNAL_3554215745691683147$$_LAST_ELEM_INSIDE_I18N_BLOCK_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`${'�0�'}:INTERPOLATION:${'�#2�'}:START_HEADING_LEVEL1:${'�/#2�'}:CLOSE_HEADING_LEVEL1:`;
      }
      return [i18n_1, ['title', i18n_0], [6, 'title']];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelementStart(2, 'h1', 2);
        i0.ɵɵi18nAttributes(3, 1);
        i0.ɵɵelementEnd();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.attr);
        i0.ɵɵi18nApply(3);
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.text);
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
      <div i18n>{{ text }}<h1 i18n-title title="{{ attr }}"></h1></div>
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
      filePath: 'last_elem_inside_i18n_block.ts',
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
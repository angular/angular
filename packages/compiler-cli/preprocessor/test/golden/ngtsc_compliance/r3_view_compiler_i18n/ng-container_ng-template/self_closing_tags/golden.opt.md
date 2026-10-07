# /out/self_closing_tags.ngtypecheck.ts
```ts
/**
 * TCB for /self_closing_tags.ts
 * @generated
 */

import * as i0 from './self_closing_tags';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/self_closing_tags.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_ng_template_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 1);
    i0.ɵɵelement(1, 'img', 2);
    i0.ɵɵi18nEnd();
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
    vars: 0,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_5420441640329771391$$_SELF_CLOSING_TAGS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{$tagImg} is my logo #1 ',
            { 'tagImg': '�#2��/#2�' },
            { original_code: { 'tagImg': '<img src="logo.png" title="Logo" />' } },
          );
        i18n_0 = MSG_EXTERNAL_5420441640329771391$$_SELF_CLOSING_TAGS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${'�#2��/#2�'}:TAG_IMG: is my logo #1 `;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2178806453879858557$$_SELF_CLOSING_TAGS_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            '{$tagImg} is my logo #2 ',
            { 'tagImg': '�#1��/#1�' },
            { original_code: { 'tagImg': '<img src="logo.png" title="Logo" />' } },
          );
        i18n_1 = MSG_EXTERNAL_2178806453879858557$$_SELF_CLOSING_TAGS_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`${'�#1��/#1�'}:TAG_IMG: is my logo #2 `;
      }
      return [i18n_0, i18n_1, ['src', 'logo.png', 'title', 'Logo']];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementContainerStart(0);
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelement(2, 'img', 2);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementContainerEnd();
        i0.ɵɵtemplate(3, MyComponent_ng_template_3_Template, 2, 0, 'ng-template');
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
      <ng-container i18n>
        <img src="logo.png" title="Logo" /> is my logo #1
      </ng-container>
      <ng-template i18n>
        <img src="logo.png" title="Logo" /> is my logo #2
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
      filePath: 'self_closing_tags.ts',
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
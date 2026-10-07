# /out/meaning_description.ngtypecheck.ts
```ts
/**
 * TCB for /meaning_description.ts
 * @generated
 */

import * as i0 from './meaning_description';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/meaning_description.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

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
    decls: 16,
    vars: 0,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @desc descB
         * @meaning meaningB
         */
        const MSG_EXTERNAL_idB$$_MEANING_DESCRIPTION_TS_0 = /* @ts-ignore */ goog.getMsg('Title B');
        i18n_0 = MSG_EXTERNAL_idB$$_MEANING_DESCRIPTION_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`:meaningB|descB@@idB:Title B`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         * @meaning meaningC
         */
        const MSG_EXTERNAL_6435899732746131543$$_MEANING_DESCRIPTION_TS_1 =
          /* @ts-ignore */
          goog.getMsg('Title C');
        i18n_1 = MSG_EXTERNAL_6435899732746131543$$_MEANING_DESCRIPTION_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`:meaningC|:Title C`;
      }
      let i18n_2;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @desc descD
         * @meaning meaningD
         */
        const MSG_EXTERNAL_5200291527729162531$$_MEANING_DESCRIPTION_TS_2 =
          /* @ts-ignore */
          goog.getMsg('Title D');
        i18n_2 = MSG_EXTERNAL_5200291527729162531$$_MEANING_DESCRIPTION_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize`:meaningD|descD:Title D`;
      }
      let i18n_3;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @desc meaningE
         */
        const MSG_EXTERNAL_idE$$_MEANING_DESCRIPTION_TS_3 = /* @ts-ignore */ goog.getMsg('Title E');
        i18n_3 = MSG_EXTERNAL_idE$$_MEANING_DESCRIPTION_TS_3;
      } else {
        /* @ts-ignore */
        i18n_3 = $localize`:meaningE@@idE:Title E`;
      }
      let i18n_4;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_idF$$_MEANING_DESCRIPTION_TS_4 = /* @ts-ignore */ goog.getMsg('Title F');
        i18n_4 = MSG_EXTERNAL_idF$$_MEANING_DESCRIPTION_TS_4;
      } else {
        /* @ts-ignore */
        i18n_4 = $localize`:@@idF:Title F`;
      }
      let i18n_5;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @desc [BACKUP_${MESSAGE}_ID:idH]`desc
         */
        const MSG_EXTERNAL_idG$$_MEANING_DESCRIPTION_TS_5 = /* @ts-ignore */ goog.getMsg('Title G');
        i18n_5 = MSG_EXTERNAL_idG$$_MEANING_DESCRIPTION_TS_5;
      } else {
        /* @ts-ignore */
        i18n_5 = $localize`:[BACKUP_$\{MESSAGE}_ID\:idH]\`desc@@idG:Title G`;
      }
      let i18n_6;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @desc descA
         * @meaning meaningA
         */
        const MSG_EXTERNAL_idA$$_MEANING_DESCRIPTION_TS_6 =
          /* @ts-ignore */
          goog.getMsg('Content A');
        i18n_6 = MSG_EXTERNAL_idA$$_MEANING_DESCRIPTION_TS_6;
      } else {
        /* @ts-ignore */
        i18n_6 = $localize`:meaningA|descA@@idA:Content A`;
      }
      let i18n_7;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @desc Some text \' [BACKUP_MESSAGE_ID: xxx]
         */
        const MSG_EXTERNAL_6499290067750703197$$_MEANING_DESCRIPTION_TS_7 =
          /* @ts-ignore */
          goog.getMsg('Content H');
        i18n_7 = MSG_EXTERNAL_6499290067750703197$$_MEANING_DESCRIPTION_TS_7;
      } else {
        /* @ts-ignore */
        i18n_7 = $localize`:Some text \\' [BACKUP_MESSAGE_ID\: xxx]:Content H`;
      }
      return [
        i18n_6,
        i18n_7,
        ['title', i18n_0],
        ['title', i18n_1],
        ['title', i18n_2],
        ['title', i18n_3],
        ['title', i18n_4],
        ['title', i18n_5],
      ];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, 'div', 2);
        i0.ɵɵtext(3, 'Content B');
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(4, 'div', 3);
        i0.ɵɵtext(5, 'Content C');
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(6, 'div', 4);
        i0.ɵɵtext(7, 'Content D');
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(8, 'div', 5);
        i0.ɵɵtext(9, 'Content E');
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(10, 'div', 6);
        i0.ɵɵtext(11, 'Content F');
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(12, 'div', 7);
        i0.ɵɵtext(13, 'Content G');
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(14, 'div');
        i0.ɵɵi18n(15, 1);
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
      <div i18n="meaningA|descA@@idA">Content A</div>
      <div i18n-title="meaningB|descB@@idB" title="Title B">Content B</div>
      <div i18n-title="meaningC|" title="Title C">Content C</div>
      <div i18n-title="meaningD|descD" title="Title D">Content D</div>
      <div i18n-title="meaningE@@idE" title="Title E">Content E</div>
      <div i18n-title="@@idF" title="Title F">Content F</div>
      <div i18n-title="[BACKUP_$\{MESSAGE}_ID:idH]\`desc@@idG" title="Title G">Content G</div>
      <div i18n="Some text \\' [BACKUP_MESSAGE_ID: xxx]">Content H</div>
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
      filePath: 'meaning_description.ts',
      lineNumber: 17,
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
# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';

/*tcb1*/
function _tcb1(this: i0.LocalizeSimpleCmp) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.LocalizeInterpolationCmp) {
  if (true) {
    '' + this.name /*410,414*/ /*410,414*/;
    '' + this.count /*451,456*/ /*451,456*/;
  }
}

/*tcb3*/
function _tcb3(this: i0.LocalizeAttributesCmp) {
  if (true) {
  }
}

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class LocalizeSimpleCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalizeSimpleCmp, never> =
    function LocalizeSimpleCmp_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || LocalizeSimpleCmp)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LocalizeSimpleCmp,
    'localize-simple-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LocalizeSimpleCmp,
    selectors: [['localize-simple-cmp']],
    decls: 4,
    vars: 0,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4584092443788135411$$_APP_COMPONENT_TS_0 =
          /* @ts-ignore */
          goog.getMsg('Hello World');
        i18n_0 = MSG_EXTERNAL_4584092443788135411$$_APP_COMPONENT_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Hello World`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @desc Header description
         * @meaning site header
         */
        const MSG_EXTERNAL_customHeaderId$$_APP_COMPONENT_TS_1 =
          /* @ts-ignore */
          goog.getMsg('Welcome');
        i18n_1 = MSG_EXTERNAL_customHeaderId$$_APP_COMPONENT_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`:site header|Header description@@customHeaderId:Welcome`;
      }
      return [i18n_0, i18n_1];
    },
    template: function LocalizeSimpleCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵi18n(1, 0);
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(2, 'div');
        i0.ɵɵi18n(3, 1);
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalizeSimpleCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'localize-simple-cmp',
                template: `
        <div i18n>Hello World</div>
        <div i18n="site header|Header description@@customHeaderId">Welcome</div>
      `,
                standalone: true,
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
    i0.ɵsetClassDebugInfo(LocalizeSimpleCmp, {
      className: 'LocalizeSimpleCmp',
      filePath: 'app.component.ts',
      lineNumber: 11,
    });
})();

export class LocalizeInterpolationCmp {
  name = 'Angular';
  count = 5;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalizeInterpolationCmp, never> =
    function LocalizeInterpolationCmp_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || LocalizeInterpolationCmp)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LocalizeInterpolationCmp,
    'localize-interpolation-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LocalizeInterpolationCmp,
    selectors: [['localize-interpolation-cmp']],
    decls: 4,
    vars: 2,
    consts: (): any => {
      let i18n_2;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @desc Greeting to user
         * @meaning greeting
         */
        const MSG_EXTERNAL_greetUser$$_APP_COMPONENT_TS_2 =
          /* @ts-ignore */
          goog.getMsg(
            'Hello, {$interpolation}!',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{ name }}' } },
          );
        i18n_2 = MSG_EXTERNAL_greetUser$$_APP_COMPONENT_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize`:greeting|Greeting to user@@greetUser:Hello, ${'�0�'}:INTERPOLATION:!`;
      }
      let i18n_3;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_8312755678848814973$$_APP_COMPONENT_TS_3 =
          /* @ts-ignore */
          goog.getMsg(
            'You have {$interpolation} new notifications.',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{ count }}' } },
          );
        i18n_3 = MSG_EXTERNAL_8312755678848814973$$_APP_COMPONENT_TS_3;
      } else {
        /* @ts-ignore */
        i18n_3 = $localize`You have ${'�0�'}:INTERPOLATION: new notifications.`;
      }
      return [i18n_2, i18n_3];
    },
    template: function LocalizeInterpolationCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵi18n(1, 0);
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(2, 'div');
        i0.ɵɵi18n(3, 1);
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.name);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.count);
        i0.ɵɵi18nApply(3);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalizeInterpolationCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'localize-interpolation-cmp',
                template: `
        <div i18n="greeting|Greeting to user@@greetUser">Hello, {{ name }}!</div>
        <div i18n>You have {{ count }} new notifications.</div>
      `,
                standalone: true,
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
    i0.ɵsetClassDebugInfo(LocalizeInterpolationCmp, {
      className: 'LocalizeInterpolationCmp',
      filePath: 'app.component.ts',
      lineNumber: 21,
    });
})();

export class LocalizeAttributesCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalizeAttributesCmp, never> =
    function LocalizeAttributesCmp_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || LocalizeAttributesCmp)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LocalizeAttributesCmp,
    'localize-attributes-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LocalizeAttributesCmp,
    selectors: [['localize-attributes-cmp']],
    decls: 1,
    vars: 0,
    consts: (): any => {
      let i18n_4;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @desc Description for tooltip
         * @meaning input tooltip
         */
        const MSG_EXTERNAL_inputTitleId$$_APP_COMPONENT_TS_4 =
          /* @ts-ignore */
          goog.getMsg('Username input');
        i18n_4 = MSG_EXTERNAL_inputTitleId$$_APP_COMPONENT_TS_4;
      } else {
        /* @ts-ignore */
        i18n_4 = $localize`:input tooltip|Description for tooltip@@inputTitleId:Username input`;
      }
      return [['title', i18n_4]];
    },
    template: function LocalizeAttributesCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElement(0, 'input', 0);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalizeAttributesCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'localize-attributes-cmp',
                template: `
        <input i18n-title="input tooltip|Description for tooltip@@inputTitleId" title="Username input" />
      `,
                standalone: true,
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
    i0.ɵsetClassDebugInfo(LocalizeAttributesCmp, {
      className: 'LocalizeAttributesCmp',
      filePath: 'app.component.ts',
      lineNumber: 33,
    });
})();

```
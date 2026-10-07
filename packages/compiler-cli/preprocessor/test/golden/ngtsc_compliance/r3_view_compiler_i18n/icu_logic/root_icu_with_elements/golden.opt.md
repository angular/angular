# /out/root_icu_with_elements.ngtypecheck.ts
```ts
/**
 * TCB for /root_icu_with_elements.ts
 * @generated
 */

import * as i0 from './root_icu_with_elements';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.someField /*139,148*/ /*139,148*/;
    '' + this.someField /*259,268*/ /*259,268*/;
  }
}

```

# /out/root_icu_with_elements.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  someField!: any;
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
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    decls: 6,
    vars: 2,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @desc someText1
         */
        const MSG_EXTERNAL_4505060179465988919$$_ROOT_ICU_WITH_ELEMENTS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{VAR_SELECT, select, WEBSITE {{START_TAG_STRONG}someText{CLOSE_TAG_STRONG}\n      }}',
          );
        i18n_0 = MSG_EXTERNAL_4505060179465988919$$_ROOT_ICU_WITH_ELEMENTS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`:someText1:{VAR_SELECT, select, WEBSITE {{START_TAG_STRONG}someText{CLOSE_TAG_STRONG}
      }}`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, {
        'CLOSE_TAG_STRONG': '</strong>',
        'START_TAG_STRONG': '<strong>',
        'VAR_SELECT': '�0�',
      });
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4505060179465988919$$_ROOT_ICU_WITH_ELEMENTS_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            '{VAR_SELECT, select, WEBSITE {{START_TAG_STRONG}someText{CLOSE_TAG_STRONG}\n      }}',
          );
        i18n_1 = MSG_EXTERNAL_4505060179465988919$$_ROOT_ICU_WITH_ELEMENTS_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`{VAR_SELECT, select, WEBSITE {{START_TAG_STRONG}someText{CLOSE_TAG_STRONG}
      }}`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, {
        'CLOSE_TAG_STRONG': '</strong>',
        'START_TAG_STRONG': '<strong>',
        'VAR_SELECT': '�0�',
      });
      return [i18n_0, i18n_1];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'span');
        i0.ɵɵi18n(1, 0);
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(2, 'span');
        i0.ɵɵtext(3, ' ');
        i0.ɵɵi18n(4, 1);
        i0.ɵɵtext(5, ' ');
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.someField);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance(3);
        i0.ɵɵi18nExp(ctx.someField);
        i0.ɵɵi18nApply(4);
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
        <span i18n="someText1">{
          someField,
          select,
          WEBSITE {
            <strong>someText</strong>
          }
        }</span>

        <span>
        {
          someField,
          select,
          WEBSITE {
            <strong>someText</strong>
          }
        }
        </span>
    `,
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
      filePath: 'root_icu_with_elements.ts',
      lineNumber: 25,
    });
})();

```
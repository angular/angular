# /out/app.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComp, never> = function AppComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComp,
    'app-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: AppComp,
      selectors: [['app-comp']],
      decls: 3,
      vars: 0,
      consts: (): any => {
        let i18n_0;
        if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
          /**
           * @suppress {msgDescriptions}
           */
          const MSG_EXTERNAL_2706437655713359815$$APP_TS_0 =
            /* @ts-ignore */
            goog.getMsg(
              ' hello {$startTagSpan}world{$closeTagSpan}',
              { 'closeTagSpan': '\uFFFD/#2\uFFFD', 'startTagSpan': '\uFFFD#2\uFFFD' },
              { original_code: { 'closeTagSpan': '</span>', 'startTagSpan': '<span>' } },
            );
          i18n_0 = MSG_EXTERNAL_2706437655713359815$$APP_TS_0;
        } else {
          /* @ts-ignore */
          i18n_0 = $localize`:␟a595f893476a55f9061a2ac4a1620b58461957fb␟2706437655713359815: hello ${'\uFFFD#2\uFFFD'}:START_TAG_SPAN:world${'\uFFFD/#2\uFFFD'}:CLOSE_TAG_SPAN:`;
        }
        return [i18n_0];
      },
      template: function AppComp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelementStart(0, 'div');
          i0.ɵɵi18nStart(1, 0);
          i0.ɵɵelement(2, 'span');
          i0.ɵɵi18nEnd();
          i0.ɵɵelementEnd();
        }
      },
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-comp',
                template: '<div i18n>   hello   <span>world</span>   </div>',
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
    i0.ɵsetClassDebugInfo(AppComp, { className: 'AppComp', filePath: 'app.ts', lineNumber: 7 });
})();

```
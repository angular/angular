# /out/safe_method_call.ngtypecheck.ts
```ts
/**
 * TCB for /safe_method_call.ts
 * @generated
 */

import * as i0 from './safe_method_call';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    this.person /*90,96*/ /*90,96*/
      ?.getName /*98,105*/ /*90,105*/
      ?.(false /*106,111*/) /*90,112*/;
    this.person /*141,147*/ /*141,147*/
      ?.getName /*149,156*/ /*141,156*/
      ?.(false /*157,162*/) /*141,163*/ || '' /*167,169*/ /*141,169*/;
    this.person /*198,204*/ /*198,204*/
      ?.getName /*206,213*/ /*198,213*/
      ?.(false /*214,219*/) /*198,220*/
      ?.toLowerCase /*222,233*/ /*198,233*/
      ?.() /*198,235*/;
    this.person /*264,270*/ /*264,270*/
      ?.getName /*272,279*/ /*264,279*/
      ?.(
        this.config /*280,286*/ /*280,286*/
          .get(/*287,290*/ 'title' /*291,298*/) /*280,299*/?.enabled /*301,308*/ /*280,308*/,
      ) /*264,309*/;
    this.person /*338,344*/ /*338,344*/
      ?.getName /*346,353*/ /*338,353*/
      ?.(
        this.config /*354,360*/ /*354,360*/
          .get(/*361,364*/ 'title' /*365,372*/) /*354,373*/?.enabled /*375,382*/ /*354,382*/ ??
          true /*386,390*/ /*354,390*/,
      ) /*338,391*/;
  }
}

```

# /out/safe_method_call.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
  person?: { getName: (includeTitle: boolean | undefined) => string };
  config: {
    get: (name: string) => { enabled: boolean } | undefined;
  } = { get: () => undefined };
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    standalone: false,
    decls: 5,
    vars: 5,
    consts: [[3, 'title']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'span', 0)(1, 'span', 0)(2, 'span', 0)(3, 'span', 0)(4, 'span', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('title', ctx.person?.getName(false));
        i0.ɵɵadvance();
        i0.ɵɵproperty('title', ctx.person?.getName(false) || '');
        i0.ɵɵadvance();
        i0.ɵɵproperty('title', ctx.person?.getName(false)?.toLowerCase());
        i0.ɵɵadvance();
        i0.ɵɵproperty('title', ctx.person?.getName(ctx.config.get('title')?.enabled));
        i0.ɵɵadvance();
        i0.ɵɵproperty('title', ctx.person?.getName(ctx.config.get('title')?.enabled ?? true));
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        <span [title]="person?.getName(false)"></span>
        <span [title]="person?.getName(false) || ''"></span>
        <span [title]="person?.getName(false)?.toLowerCase()"></span>
        <span [title]="person?.getName(config.get('title')?.enabled)"></span>
        <span [title]="person?.getName(config.get('title')?.enabled ?? true)"></span>
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'safe_method_call.ts',
      lineNumber: 13,
    });
})();

```
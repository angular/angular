# /out/self_closing.ngtypecheck.ts
```ts
/**
 * TCB for /self_closing.ts
 * @generated
 */

import * as i0 from './self_closing';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    {
      '' + this.id /*261,263*/ /*261,263*/;
    }
  }
}

```

# /out/self_closing.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_img_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'img', 1);
  }
}
function MyComponent_img_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'img', 4);
    i0.ɵɵi18nAttributes(1, 0);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵi18nExp(ctx_r0.id);
    i0.ɵɵi18nApply(1);
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
    decls: 3,
    vars: 2,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2367729185105559721$$_SELF_CLOSING_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            'App logo #{$interpolation}',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{ id }}' } },
          );
        i18n_0 = MSG_EXTERNAL_2367729185105559721$$_SELF_CLOSING_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`App logo #${'�0�'}:INTERPOLATION:`;
      }
      return [
        ['title', i18n_0],
        ['src', 'logo.png'],
        ['src', 'logo.png', 4, 'ngIf'],
        ['src', 'logo.png', 3, 'title', 4, 'ngIf'],
        ['src', 'logo.png', 6, 'title'],
      ];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'img', 1);
        i0.ɵɵtemplate(1, MyComponent_img_1_Template, 1, 0, 'img', 2)(
          2,
          MyComponent_img_2_Template,
          2,
          1,
          'img',
          3,
        );
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵproperty('ngIf', ctx.visible);
        i0.ɵɵadvance();
        i0.ɵɵproperty('ngIf', ctx.visible);
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
      <img src="logo.png" i18n />
      <img src="logo.png" i18n *ngIf="visible" />
      <img src="logo.png" i18n *ngIf="visible" i18n-title title="App logo #{{ id }}" />
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
      filePath: 'self_closing.ts',
      lineNumber: 12,
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
# /out/directives.ngtypecheck.ts
```ts
/**
 * TCB for /directives.ts
 * @generated
 */

import * as i0 from './directives';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    {
      '' + this.valueA /*167,173*/ /*167,173*/;
    }
  }
}

```

# /out/directives.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div');
    i0.ɵɵi18nStart(1, 0);
    i0.ɵɵelement(2, 'span');
    i0.ɵɵi18nEnd();
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵi18nExp(ctx_r0.valueA);
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
    decls: 1,
    vars: 1,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_119975189388320493$$_DIRECTIVES_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            'Some other content {$startTagSpan}{$interpolation}{$closeTagSpan}',
            { 'closeTagSpan': '�/#2�', 'interpolation': '�0�', 'startTagSpan': '�#2�' },
            {
              original_code: {
                'closeTagSpan': '</span>',
                'interpolation': '{{ valueA }}',
                'startTagSpan': '<span>',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_119975189388320493$$_DIRECTIVES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Some other content ${'�#2�'}:START_TAG_SPAN:${'�0�'}:INTERPOLATION:${'�/#2�'}:CLOSE_TAG_SPAN:`;
      }
      return [i18n_0, [4, 'ngIf']];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 3, 1, 'div', 1);
      }
      if (rf & 2) {
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
      <div i18n *ngIf="visible">Some other content <span>{{ valueA }}</span></div>
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
      filePath: 'directives.ts',
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
# /out/i18n_attribute_directive.ngtypecheck.ts
```ts
/**
 * TCB for /i18n_attribute_directive.ts
 * @generated
 */

import * as i0 from './i18n_attribute_directive';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/i18n_attribute_directive.ts
```ts
import { Component, Directive, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class I18nDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<I18nDirective, never> = function I18nDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || I18nDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    I18nDirective,
    '[i18n]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: I18nDirective,
    selectors: [['', 'i18n', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        I18nDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[i18n]',
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
    vars: 0,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
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
                template: '<div i18n></div>',
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
      filePath: 'i18n_attribute_directive.ts',
      lineNumber: 14,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof I18nDirective, typeof MyComponent],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [I18nDirective, MyComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [I18nDirective, MyComponent] });
})();

```
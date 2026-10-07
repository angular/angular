# /out/security_sensitive_constant_attributes.ngtypecheck.ts
```ts
/**
 * TCB for /security_sensitive_constant_attributes.ts
 * @generated
 */

import * as i0 from './security_sensitive_constant_attributes';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/security_sensitive_constant_attributes.ts
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
    decls: 5,
    vars: 0,
    consts: [
      ['src', i0.ɵɵtrustConstantResourceUrl`https://angular.io/`],
      ['srcdoc', i0.ɵɵtrustConstantHtml`<h1>Angular</h1>`],
      [
        'data',
        i0.ɵɵtrustConstantResourceUrl`https://angular.io/`,
        'codebase',
        i0.ɵɵtrustConstantResourceUrl`/`,
      ],
      ['src', 'https://angular.io/'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'embed', 0)(1, 'iframe', 1)(2, 'object', 2)(3, 'embed', 0)(4, 'img', 3);
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
        <!-- A couple of security-sensitive attributes with constant values -->
        <embed src="https://angular.io/" />
        <iframe srcdoc="<h1>Angular</h1>"></iframe>
        <object data="https://angular.io/" codebase="/"></object>

        <!-- Repeated element to make sure attribute deduplication works properly -->
        <embed src="https://angular.io/" />

        <!-- Another element with a src attribute that is not security sensitive -->
        <img src="https://angular.io/" />
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
      filePath: 'security_sensitive_constant_attributes.ts',
      lineNumber: 19,
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
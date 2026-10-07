# /out/component.ngtypecheck.ts
```ts
/**
 * TCB for /component.ts
 * @generated
 */

import * as i0 from './component';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/component.ts
```ts
import { Component, Input, NgModule, Output } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  componentInput: any;
  originalComponentInput: any;

  componentOutput: any;
  originalComponentOutput: any;
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
    {
      'componentInput': { 'alias': 'componentInput'; 'required': false };
      'originalComponentInput': { 'alias': 'renamedComponentInput'; 'required': false };
    },
    { 'componentOutput': 'componentOutput'; 'originalComponentOutput': 'renamedComponentOutput' },
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    inputs: {
      componentInput: 'componentInput',
      originalComponentInput: [0, 'renamedComponentInput', 'originalComponentInput'],
    },
    outputs: {
      componentOutput: 'componentOutput',
      originalComponentOutput: 'renamedComponentOutput',
    },
    standalone: false,
    decls: 0,
    vars: 0,
    template: function MyComponent_Template(rf: number, ctx: any): any {},
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
                template: '',
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          componentInput: [{ type: Input }],
          originalComponentInput: [{ type: Input, args: ['renamedComponentInput'] }],
          componentOutput: [{ type: Output }],
          originalComponentOutput: [{ type: Output, args: ['renamedComponentOutput'] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'component.ts',
      lineNumber: 7,
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
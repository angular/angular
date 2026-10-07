# /out/directive.ts
```ts
import { Directive, Input, NgModule, Output } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyDirective {
  directiveInput: any;
  originalDirectiveInput: any;

  directiveOutput: any;
  originalDirectiveOutput: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never> = function MyDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyDirective,
    '[my-directive]',
    never,
    {
      'directiveInput': { 'alias': 'directiveInput'; 'required': false };
      'originalDirectiveInput': { 'alias': 'renamedDirectiveInput'; 'required': false };
    },
    { 'directiveOutput': 'directiveOutput'; 'originalDirectiveOutput': 'renamedDirectiveOutput' },
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDirective,
    selectors: [['', 'my-directive', '']],
    inputs: {
      directiveInput: 'directiveInput',
      originalDirectiveInput: [0, 'renamedDirectiveInput', 'originalDirectiveInput'],
    },
    outputs: {
      directiveOutput: 'directiveOutput',
      originalDirectiveOutput: 'renamedDirectiveOutput',
    },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[my-directive]',
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          directiveInput: [{ type: Input }],
          originalDirectiveInput: [{ type: Input, args: ['renamedDirectiveInput'] }],
          directiveOutput: [{ type: Output }],
          originalDirectiveOutput: [{ type: Output, args: ['renamedDirectiveOutput'] }],
        },
      );
  }
}

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyDirective], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyDirective] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyDirective] });
})();

```
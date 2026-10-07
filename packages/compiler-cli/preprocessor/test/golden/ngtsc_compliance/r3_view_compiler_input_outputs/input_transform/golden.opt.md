# /out/input_transform.ts
```ts
import { Directive, Input, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function toNumber(value: number | string) {
  return value ? 1 : 0;
}

export class MyDirective {
  functionDeclarationInput: any;

  // There's an extra `_` parameter, because full compilation strips the parentheses around the
  // parameters while partial compilation keeps them. This ensures consistent output.
  // @ts-ignore
  inlineFunctionInput: any;
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
      'functionDeclarationInput': { 'alias': 'functionDeclarationInput'; 'required': false };
      'inlineFunctionInput': { 'alias': 'inlineFunctionInput'; 'required': false };
    },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDirective,
    selectors: [['', 'my-directive', '']],
    inputs: {
      functionDeclarationInput: [
        2,
        'functionDeclarationInput',
        'functionDeclarationInput',
        toNumber,
      ],
      inlineFunctionInput: [
        2,
        'inlineFunctionInput',
        'inlineFunctionInput',
        (value: string | number, _: any) => (value ? 1 : 0),
      ],
    },
    standalone: false,
  });
  // @ts-ignore
  declare static ngAcceptInputType_functionDeclarationInput: Parameters<typeof toNumber>[0];
  // @ts-ignore
  declare static ngAcceptInputType_inlineFunctionInput: string | number;
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
          functionDeclarationInput: [{ type: Input, args: [{ transform: toNumber }] }],
          inlineFunctionInput: [
            {
              type: Input,
              args: [{ transform: (value: string | number, _: any) => (value ? 1 : 0) }],
            },
          ],
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
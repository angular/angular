# /out/app.ts
```ts
import { Directive, Inject, Injectable, InjectionToken, Optional } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export const MY_TOKEN = new InjectionToken<string>('MY_TOKEN');

export interface MyInterface {
  value: string;
}

export abstract class Base {
  constructor(scrollStrategy: any, parentMenu: MyInterface);
  constructor(scrollStrategy: any, parentMenu: MyInterface, extra?: boolean);
  constructor(
    public scrollStrategy: any,
    public parentMenu: MyInterface,
    public extra?: boolean,
  ) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Base, never> = function Base_Factory(
    __ngFactoryType__: any,
  ): any {
    i0.ɵɵinvalidFactory();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<Base, '[base]', never, {}, {}, never, never, true, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({ type: Base, selectors: [['', 'base', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Base,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[base]',
              },
            ],
          },
        ],
        (): any => [
          { type: undefined, decorators: [{ type: Inject, args: [MY_TOKEN] }] },
          { type: undefined, decorators: [{ type: Inject, args: [MY_TOKEN] }, { type: Optional }] },
          { type: undefined },
        ],
        null,
      );
  }
}

export class Child extends Base {
  // Inherits constructor from Base.
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Child, never> =
    // @ts-ignore
    /*@__PURE__*/ ((): any => {
      let ɵChild_BaseFactory: any;
      return function Child_Factory(__ngFactoryType__: any): any {
        return (ɵChild_BaseFactory || (ɵChild_BaseFactory = i0.ɵɵgetInheritedFactory(Child)))(
          __ngFactoryType__ || Child,
        );
      };
    })();
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    Child,
    '[child]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: Child,
      selectors: [['', 'child', '']],
      features: [i0.ɵɵInheritDefinitionFeature],
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Child,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[child]',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/app.ts",
      "category": "error",
      "code": 2003,
      "messageText": "No suitable injection token for parameter 'extra' of class 'Base'. Find more at https://next.angular.dev/errors/NG2003\n  Consider using the @Inject decorator to specify an injection token.",
      "span": {
        "start": 554,
        "end": 559
      },
      "relatedInformation": [
        {
          "filePath": "/app.ts",
          "span": {
            "start": 562,
            "end": 569
          },
          "messageText": "This type is not supported as injection token."
        }
      ]
    }
  ]
}

```
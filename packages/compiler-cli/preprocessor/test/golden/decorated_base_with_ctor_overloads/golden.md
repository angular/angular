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
  static ɵfac: i0.ɵɵFactoryDeclaration<Base, [null, { optional: true }, null]> =
    function Base_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || Base)(
        i0.ɵɵdirectiveInject(MY_TOKEN),
        i0.ɵɵdirectiveInject(MY_TOKEN, 8),
        i0.ɵɵdirectiveInject(Object),
      );
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<Base, '[base]', never, {}, {}, never, never, true, never> =
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
                standalone: true,
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
  static ɵfac: i0.ɵɵFactoryDeclaration<Child, never> = /*@__PURE__*/ ((): any => {
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
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
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
                standalone: true,
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
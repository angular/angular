# /out/inheritance.ts
```ts
import { Directive, ElementRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class BaseDir {
  constructor(public el: ElementRef) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BaseDir, never> = function BaseDir_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || BaseDir)(i0.ɵɵdirectiveInject(i0.ElementRef));
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    BaseDir,
    '[base]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: BaseDir, selectors: [['', 'base', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BaseDir,
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
          {
            /* @ts-ignore */
            type: ElementRef,
          },
        ],
        null,
      );
  }
}

export class ChildDir extends BaseDir {
  // Inherits constructor from BaseDir. Should delegate factory to BaseDir's factory.
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ChildDir, never> = /*@__PURE__*/ ((): any => {
    let ɵChildDir_BaseFactory: any;
    return function ChildDir_Factory(__ngFactoryType__: any): any {
      return (
        ɵChildDir_BaseFactory || (ɵChildDir_BaseFactory = i0.ɵɵgetInheritedFactory(ChildDir))
      )(__ngFactoryType__ || ChildDir);
    };
  })();
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ChildDir,
    '[child]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ChildDir,
    selectors: [['', 'child', '']],
    features: [i0.ɵɵInheritDefinitionFeature],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ChildDir,
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

export class ChildWithCtorDir extends BaseDir {
  // Declares its own constructor. Should generate own ctor deps.
  constructor(el: ElementRef) {
    super(el);
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ChildWithCtorDir, never> = function ChildWithCtorDir_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || ChildWithCtorDir)(i0.ɵɵdirectiveInject(i0.ElementRef));
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ChildWithCtorDir,
    '[childWithCtor]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ChildWithCtorDir,
    selectors: [['', 'childWithCtor', '']],
    features: [i0.ɵɵInheritDefinitionFeature],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ChildWithCtorDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[childWithCtor]',
                standalone: true,
              },
            ],
          },
        ],
        (): any => [
          {
            /* @ts-ignore */
            type: ElementRef,
          },
        ],
        null,
      );
  }
}

```
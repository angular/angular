# /out/service.ts
```ts
import { Injectable, forwardRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class SomeClass {}

export class InjectableWithUseClass {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InjectableWithUseClass, never> =
    function InjectableWithUseClass_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || InjectableWithUseClass)();
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: InjectableWithUseClass,
    factory: (__ngFactoryType__: any): any => SomeClass.ɵfac(__ngFactoryType__),
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InjectableWithUseClass,
        [
          {
            type: Injectable,
            args: [
              {
                providedIn: 'root',
                useClass: forwardRef(() => SomeClass),
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class InjectableWithUseExisting {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InjectableWithUseExisting, never> =
    function InjectableWithUseExisting_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || InjectableWithUseExisting)();
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: InjectableWithUseExisting,
    factory: function InjectableWithUseExisting_Factory(__ngFactoryType__: any): any {
      let __ngConditionalFactory__: any = null;
      if (__ngFactoryType__) {
        __ngConditionalFactory__ = new (__ngFactoryType__ || InjectableWithUseExisting)();
      } else {
        /* @ts-ignore */
        __ngConditionalFactory__ = i0.ɵɵinject(SomeClass);
      }
      return __ngConditionalFactory__;
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InjectableWithUseExisting,
        [
          {
            type: Injectable,
            args: [
              {
                useExisting: forwardRef(() => SomeClass),
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class InjectableWithUseFactory {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InjectableWithUseFactory, never> =
    function InjectableWithUseFactory_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || InjectableWithUseFactory)();
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: InjectableWithUseFactory,
    factory: (): any => (() => new SomeClass())(),
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InjectableWithUseFactory,
        [
          {
            type: Injectable,
            args: [
              {
                useFactory: () => new SomeClass(),
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class InjectableWithUseValue {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InjectableWithUseValue, never> =
    function InjectableWithUseValue_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || InjectableWithUseValue)();
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: InjectableWithUseValue,
    factory: function InjectableWithUseValue_Factory(__ngFactoryType__: any): any {
      let __ngConditionalFactory__: any = null;
      if (__ngFactoryType__) {
        __ngConditionalFactory__ = new (__ngFactoryType__ || InjectableWithUseValue)();
      } else {
        /* @ts-ignore */
        __ngConditionalFactory__ = { api: 'test' };
      }
      return __ngConditionalFactory__;
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InjectableWithUseValue,
        [
          {
            type: Injectable,
            args: [
              {
                useValue: { api: 'test' },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class PrecedenceUseValue {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PrecedenceUseValue, never> =
    function PrecedenceUseValue_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || PrecedenceUseValue)();
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: PrecedenceUseValue,
    factory: function PrecedenceUseValue_Factory(__ngFactoryType__: any): any {
      let __ngConditionalFactory__: any = null;
      if (__ngFactoryType__) {
        __ngConditionalFactory__ = new (__ngFactoryType__ || PrecedenceUseValue)();
      } else {
        /* @ts-ignore */
        __ngConditionalFactory__ = { api: 'value_wins' };
      }
      return __ngConditionalFactory__;
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PrecedenceUseValue,
        [
          {
            type: Injectable,
            args: [
              {
                useValue: { api: 'value_wins' },
                useExisting: forwardRef(() => SomeClass),
                useClass: forwardRef(() => SomeClass),
                useFactory: () => new SomeClass(),
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class PrecedenceUseExisting {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PrecedenceUseExisting, never> =
    function PrecedenceUseExisting_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || PrecedenceUseExisting)();
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: PrecedenceUseExisting,
    factory: function PrecedenceUseExisting_Factory(__ngFactoryType__: any): any {
      let __ngConditionalFactory__: any = null;
      if (__ngFactoryType__) {
        __ngConditionalFactory__ = new (__ngFactoryType__ || PrecedenceUseExisting)();
      } else {
        /* @ts-ignore */
        __ngConditionalFactory__ = i0.ɵɵinject(SomeClass);
      }
      return __ngConditionalFactory__;
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PrecedenceUseExisting,
        [
          {
            type: Injectable,
            args: [
              {
                useExisting: forwardRef(() => SomeClass),
                useClass: forwardRef(() => SomeClass),
                useFactory: () => new SomeClass(),
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class PrecedenceUseClass {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PrecedenceUseClass, never> =
    function PrecedenceUseClass_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || PrecedenceUseClass)();
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: PrecedenceUseClass,
    factory: (__ngFactoryType__: any): any => SomeClass.ɵfac(__ngFactoryType__),
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PrecedenceUseClass,
        [
          {
            type: Injectable,
            args: [
              {
                useClass: forwardRef(() => SomeClass),
                useFactory: () => new SomeClass(),
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
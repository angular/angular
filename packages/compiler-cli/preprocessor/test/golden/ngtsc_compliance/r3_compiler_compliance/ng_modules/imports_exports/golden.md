# /out/imports_exports.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class A1Component {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<A1Component, never> = function A1Component_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || A1Component)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    A1Component,
    'a1',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: A1Component,
    selectors: [['a1']],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function A1Component_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'A1');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(A1Component),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        A1Component,
        [
          {
            type: Component,
            args: [
              {
                selector: 'a1',
                template: 'A1',
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
    i0.ɵsetClassDebugInfo(A1Component, {
      className: 'A1Component',
      filePath: 'imports_exports.ts',
      lineNumber: 7,
    });
})();

export class A2Component {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<A2Component, never> = function A2Component_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || A2Component)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    A2Component,
    'a2',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: A2Component,
    selectors: [['a2']],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function A2Component_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'A2');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(A2Component),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        A2Component,
        [
          {
            type: Component,
            args: [
              {
                selector: 'a2',
                template: 'A2',
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
    i0.ɵsetClassDebugInfo(A2Component, {
      className: 'A2Component',
      filePath: 'imports_exports.ts',
      lineNumber: 14,
    });
})();

export class AModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AModule, never> = function AModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AModule)();
  };
  // @ts-ignore
  static ɵmod: AModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [A1Component, A2Component],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AModule,
        [
          {
            type: NgModule,
            args: [
              { declarations: [A1Component, A2Component], exports: [A1Component, A2Component] },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(AModule, {
      declarations: [A1Component, A2Component],
      exports: [A1Component, A2Component],
    });
})();

export class B1Component {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<B1Component, never> = function B1Component_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || B1Component)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    B1Component,
    'b1',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: B1Component,
    selectors: [['b1']],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function B1Component_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'B1');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(B1Component),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        B1Component,
        [
          {
            type: Component,
            args: [
              {
                selector: 'b1',
                template: 'B1',
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
    i0.ɵsetClassDebugInfo(B1Component, {
      className: 'B1Component',
      filePath: 'imports_exports.ts',
      lineNumber: 25,
    });
})();

export class B2Component {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<B2Component, never> = function B2Component_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || B2Component)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    B2Component,
    'b2',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: B2Component,
    selectors: [['b2']],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function B2Component_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'B2');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(B2Component),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        B2Component,
        [
          {
            type: Component,
            args: [
              {
                selector: 'b2',
                template: 'B2',
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
    i0.ɵsetClassDebugInfo(B2Component, {
      className: 'B2Component',
      filePath: 'imports_exports.ts',
      lineNumber: 32,
    });
})();

export class BModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BModule, never> = function BModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || BModule)();
  };
  // @ts-ignore
  static ɵmod: BModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: BModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<BModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [AModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BModule,
        [
          {
            type: NgModule,
            args: [{ declarations: [B1Component, B2Component], exports: [AModule] }],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(BModule, {
      declarations: [B1Component, B2Component],
      exports: [AModule],
    });
})();

export class AppModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never> = function AppModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppModule)();
  };
  // @ts-ignore
  static ɵmod: AppModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [BModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [{ type: NgModule, args: [{ imports: [BModule] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(AppModule, { imports: [BModule] });
})();

```
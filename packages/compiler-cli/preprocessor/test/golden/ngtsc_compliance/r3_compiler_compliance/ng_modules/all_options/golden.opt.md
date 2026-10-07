# /out/all_options.ngtypecheck.ts
```ts
/**
 * TCB for /all_options.ts
 * @generated
 */

import * as i0 from './all_options';

/*tcb1*/
function _tcb1(this: i0.MyBootstrap) {
  if (true) {
  }
}

```

# /out/all_options.ts
```ts
import { NgModule, NO_ERRORS_SCHEMA, forwardRef, Component, Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyDecl {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDecl, never> = function MyDecl_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyDecl)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyDecl,
    '[my-decl]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDecl,
    selectors: [['', 'my-decl', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyDecl,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[my-decl]',
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

export class MyImport {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyImport, never> = function MyImport_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyImport)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyImport, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyImport });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyImport> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(MyImport, [{ type: NgModule, args: [{}] }], null, null);
  }
}

export class MyExport {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyExport, never> = function MyExport_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyExport)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyExport,
    '[my-export]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyExport,
    selectors: [['', 'my-export', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyExport,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[my-export]',
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

export class MyBootstrap {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyBootstrap, never> = function MyBootstrap_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyBootstrap)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyBootstrap,
    'my-bootstrap',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyBootstrap,
    selectors: [['my-bootstrap']],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function MyBootstrap_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyBootstrap,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-bootstrap',
                template: '',
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
    i0.ɵsetClassDebugInfo(MyBootstrap, {
      className: 'MyBootstrap',
      filePath: 'all_options.ts',
      lineNumber: 23,
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
    [typeof MyDecl, typeof MyExport],
    [typeof MyImport],
    [typeof MyExport]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: MyModule,
    bootstrap: [MyBootstrap],
    id: 'my-module-id',
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [MyImport],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [MyDecl, MyExport],
                imports: [MyImport],
                exports: [MyExport],
                bootstrap: [forwardRef(() => MyBootstrap)],
                schemas: [NO_ERRORS_SCHEMA],
                id: 'my-module-id',
              },
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
    i0.ɵɵsetNgModuleScope(MyModule, {
      declarations: [MyDecl, MyExport],
      imports: [MyImport],
      exports: [MyExport],
    });
})();
i0.ɵɵregisterNgModuleType(MyModule, 'my-module-id');

```
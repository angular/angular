# /out/ngmodule_schemas.ts
```ts
import { Component, NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyCompCustomElements {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyCompCustomElements, never> =
    function MyCompCustomElements_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MyCompCustomElements)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyCompCustomElements,
    'my-comp-custom-elements',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyCompCustomElements,
    selectors: [['my-comp-custom-elements']],
    standalone: false,
    decls: 2,
    vars: 1,
    consts: [[3, 'unknown-property']],
    template: function MyCompCustomElements_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'unknown-element')(1, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵproperty('unknown-property', true);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(MyCompCustomElements),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyCompCustomElements,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-comp-custom-elements',
                template: `
        <unknown-element></unknown-element>
        <div [unknown-property]="true"></div>
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
    i0.ɵsetClassDebugInfo(MyCompCustomElements, {
      className: 'MyCompCustomElements',
      filePath: 'ngmodule_schemas.ts',
      lineNumber: 11,
    });
})();

export class MyCustomElementsModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyCustomElementsModule, never> =
    function MyCustomElementsModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MyCustomElementsModule)();
    };
  // @ts-ignore
  static ɵmod: MyCustomElementsModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: MyCustomElementsModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyCustomElementsModule> = /*@__PURE__*/ i0.ɵɵdefineInjector(
    {},
  );
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyCustomElementsModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [MyCompCustomElements],
                schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
    i0.ɵɵsetNgModuleScope(MyCustomElementsModule, { declarations: [MyCompCustomElements] });
})();

export class MyCompNoErrors {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyCompNoErrors, never> = function MyCompNoErrors_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyCompNoErrors)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyCompNoErrors,
    'my-comp-no-errors',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyCompNoErrors,
    selectors: [['my-comp-no-errors']],
    standalone: false,
    decls: 2,
    vars: 1,
    consts: [[3, 'unknown-property']],
    template: function MyCompNoErrors_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'unknown-element')(1, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵproperty('unknown-property', true);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(MyCompNoErrors),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyCompNoErrors,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-comp-no-errors',
                template: `
        <unknown-element></unknown-element>
        <div [unknown-property]="true"></div>
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
    i0.ɵsetClassDebugInfo(MyCompNoErrors, {
      className: 'MyCompNoErrors',
      filePath: 'ngmodule_schemas.ts',
      lineNumber: 27,
    });
})();

export class MyNoErrorsModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyNoErrorsModule, never> = function MyNoErrorsModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyNoErrorsModule)();
  };
  // @ts-ignore
  static ɵmod: MyNoErrorsModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyNoErrorsModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyNoErrorsModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyNoErrorsModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [MyCompNoErrors],
                schemas: [NO_ERRORS_SCHEMA],
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
    i0.ɵɵsetNgModuleScope(MyNoErrorsModule, { declarations: [MyCompNoErrors] });
})();

export class MyCompStandaloneImportingModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyCompStandaloneImportingModule, never> =
    function MyCompStandaloneImportingModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MyCompStandaloneImportingModule)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyCompStandaloneImportingModule,
    'my-comp-standalone-importing-module',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyCompStandaloneImportingModule,
    selectors: [['my-comp-standalone-importing-module']],
    decls: 2,
    vars: 1,
    consts: [[3, 'unknown-property']],
    template: function MyCompStandaloneImportingModule_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'unknown-element')(1, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵproperty('unknown-property', true);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(MyCompStandaloneImportingModule, [MyNoErrorsModule]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyCompStandaloneImportingModule,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-comp-standalone-importing-module',
                template: `
        <unknown-element></unknown-element>
        <div [unknown-property]="true"></div>
      `,
                standalone: true,
                imports: [MyNoErrorsModule],
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
    i0.ɵsetClassDebugInfo(MyCompStandaloneImportingModule, {
      className: 'MyCompStandaloneImportingModule',
      filePath: 'ngmodule_schemas.ts',
      lineNumber: 44,
    });
})();

export class MyCompNoSchemas {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyCompNoSchemas, never> = function MyCompNoSchemas_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyCompNoSchemas)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyCompNoSchemas,
    'my-comp-no-schemas',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyCompNoSchemas,
    selectors: [['my-comp-no-schemas']],
    standalone: false,
    decls: 2,
    vars: 1,
    consts: [[3, 'unknown-property']],
    template: function MyCompNoSchemas_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'unknown-element')(1, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵproperty('unknown-property', true);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(MyCompNoSchemas),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyCompNoSchemas,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-comp-no-schemas',
                template: `
        <unknown-element></unknown-element>
        <div [unknown-property]="true"></div>
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
    i0.ɵsetClassDebugInfo(MyCompNoSchemas, {
      className: 'MyCompNoSchemas',
      filePath: 'ngmodule_schemas.ts',
      lineNumber: 54,
    });
})();

export class MyNoSchemasModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyNoSchemasModule, never> =
    function MyNoSchemasModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MyNoSchemasModule)();
    };
  // @ts-ignore
  static ɵmod: MyNoSchemasModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyNoSchemasModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyNoSchemasModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyNoSchemasModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [MyCompNoSchemas],
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
    i0.ɵɵsetNgModuleScope(MyNoSchemasModule, { declarations: [MyCompNoSchemas] });
})();

```
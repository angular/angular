import { NgModule, NO_ERRORS_SCHEMA, forwardRef, Component, Directive } from "@angular/core";
import * as i0 from "@angular/core";
export class MyDecl {
  static ɵfac = function MyDecl_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyDecl)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDecl,
    selectors: [["", "my-decl", ""]],
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyDecl,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[my-decl]",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class MyImport {
  static ɵfac = function MyImport_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyImport)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyImport });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyImport,
      [
        {
          type: NgModule,
          args: [{}]
        }
      ],
      null,
      null
    );
})();
export class MyExport {
  static ɵfac = function MyExport_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyExport)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyExport,
    selectors: [["", "my-export", ""]],
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyExport,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[my-export]",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class MyBootstrap {
  static ɵfac = function MyBootstrap_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyBootstrap)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyBootstrap,
    selectors: [["my-bootstrap"]],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function MyBootstrap_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyBootstrap,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-bootstrap",
              template: "",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyBootstrap, {
      className: "MyBootstrap",
      filePath: "all_options.ts",
      lineNumber: 23
    });
})();
export class MyModule {
  static ɵfac = function MyModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: MyModule,
    bootstrap: [MyBootstrap],
    id: "my-module-id"
  });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [MyImport] });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
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
              id: "my-module-id"
            }
          ]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, {
      declarations: [MyDecl, MyExport],
      imports: [MyImport],
      exports: [MyExport]
    });
})();
i0.ɵɵregisterNgModuleType(MyModule, "my-module-id");

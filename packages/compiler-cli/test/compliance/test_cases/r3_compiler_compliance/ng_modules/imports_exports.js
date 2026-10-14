import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class A1Component {
  static ɵfac = function A1Component_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || A1Component)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: A1Component,
    selectors: [["a1"]],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function A1Component_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "A1");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      A1Component,
      [
        {
          type: Component,
          args: [
            {
              selector: "a1",
              template: "A1",
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
    i0.ɵsetClassDebugInfo(A1Component, {
      className: "A1Component",
      filePath: "imports_exports.ts",
      lineNumber: 7
    });
})();
export class A2Component {
  static ɵfac = function A2Component_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || A2Component)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: A2Component,
    selectors: [["a2"]],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function A2Component_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "A2");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      A2Component,
      [
        {
          type: Component,
          args: [
            {
              selector: "a2",
              template: "A2",
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
    i0.ɵsetClassDebugInfo(A2Component, {
      className: "A2Component",
      filePath: "imports_exports.ts",
      lineNumber: 14
    });
})();
export class AModule {
  static ɵfac = function AModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || AModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      AModule,
      [
        {
          type: NgModule,
          args: [{ declarations: [A1Component, A2Component], exports: [A1Component, A2Component] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(AModule, {
      declarations: [A1Component, A2Component],
      exports: [A1Component, A2Component]
    });
})();
export class B1Component {
  static ɵfac = function B1Component_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || B1Component)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: B1Component,
    selectors: [["b1"]],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function B1Component_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "B1");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      B1Component,
      [
        {
          type: Component,
          args: [
            {
              selector: "b1",
              template: "B1",
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
    i0.ɵsetClassDebugInfo(B1Component, {
      className: "B1Component",
      filePath: "imports_exports.ts",
      lineNumber: 25
    });
})();
export class B2Component {
  static ɵfac = function B2Component_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || B2Component)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: B2Component,
    selectors: [["b2"]],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function B2Component_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "B2");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      B2Component,
      [
        {
          type: Component,
          args: [
            {
              selector: "b2",
              template: "B2",
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
    i0.ɵsetClassDebugInfo(B2Component, {
      className: "B2Component",
      filePath: "imports_exports.ts",
      lineNumber: 32
    });
})();
export class BModule {
  static ɵfac = function BModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || BModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: BModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [AModule] });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      BModule,
      [
        {
          type: NgModule,
          args: [{ declarations: [B1Component, B2Component], exports: [AModule] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(BModule, {
      declarations: [B1Component, B2Component],
      exports: [AModule]
    });
})();
export class AppModule {
  static ɵfac = function AppModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || AppModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [BModule] });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      AppModule,
      [
        {
          type: NgModule,
          args: [{ imports: [BModule] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(AppModule, { imports: [BModule] });
})();

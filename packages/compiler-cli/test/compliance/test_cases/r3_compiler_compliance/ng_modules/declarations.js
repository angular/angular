import { Component, Directive, NgModule, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
export class FooComponent {
  name = "World";
  static ɵfac = function FooComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || FooComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: FooComponent,
    selectors: [["foo"]],
    standalone: false,
    decls: 2,
    vars: 1,
    template: function FooComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1("Hello, ", ctx.name, "!");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      FooComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "foo",
              template: "<div>Hello, {{name}}!</div>",
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
    i0.ɵsetClassDebugInfo(FooComponent, {
      className: "FooComponent",
      filePath: "declarations.ts",
      lineNumber: 7
    });
})();
export class BarDirective {
  static ɵfac = function BarDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || BarDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: BarDirective,
    selectors: [["", "bar", ""]],
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      BarDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[bar]",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class QuxPipe {
  transform() {}
  static ɵfac = function QuxPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || QuxPipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "qux",
    type: QuxPipe,
    pure: true,
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      QuxPipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "qux",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class FooModule {
  static ɵfac = function FooModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || FooModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: FooModule, bootstrap: [FooComponent] });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      FooModule,
      [
        {
          type: NgModule,
          args: [{ declarations: [FooComponent, BarDirective, QuxPipe], bootstrap: [FooComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(FooModule, { declarations: [FooComponent, BarDirective, QuxPipe] });
})();

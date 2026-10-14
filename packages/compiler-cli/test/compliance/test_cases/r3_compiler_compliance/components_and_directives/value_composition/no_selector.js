import { Component, Directive, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class RouterOutlet {
  static ɵfac = function RouterOutlet_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || RouterOutlet)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: RouterOutlet,
    selectors: [["router-outlet"]],
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      RouterOutlet,
      [
        {
          type: Directive,
          args: [
            {
              selector: "router-outlet",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class EmptyOutletComponent {
  static ɵfac = function EmptyOutletComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || EmptyOutletComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: EmptyOutletComponent,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function EmptyOutletComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "router-outlet");
      }
    },
    dependencies: [RouterOutlet],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      EmptyOutletComponent,
      [
        {
          type: Component,
          args: [
            {
              template: "<router-outlet></router-outlet>",
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
    i0.ɵsetClassDebugInfo(EmptyOutletComponent, {
      className: "EmptyOutletComponent",
      filePath: "no_selector.ts",
      lineNumber: 14
    });
})();
export class MyModule {
  static ɵfac = function MyModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyModule,
      [
        {
          type: NgModule,
          args: [{ declarations: [EmptyOutletComponent, RouterOutlet] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [EmptyOutletComponent, RouterOutlet] });
})();

import { Component, Directive, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementContainerStart(0, 1);
    i0.ɵɵtext(1, "Some content");
    i0.ɵɵelementContainerEnd();
  }
}
export class DirectiveA {
  static ɵfac = function DirectiveA_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || DirectiveA)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DirectiveA,
    selectors: [["ng-container", "directiveA", ""]],
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      DirectiveA,
      [
        {
          type: Directive,
          args: [
            {
              selector: "ng-container[directiveA]",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 1,
    vars: 1,
    consts: [
      ["directiveA", "", 4, "ngIf"],
      ["directiveA", ""]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_ng_container_0_Template, 2, 0, "ng-container", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngIf", ctx.showing);
      }
    },
    dependencies: [DirectiveA],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-component",
              template: `
    <ng-container *ngIf="showing" directiveA>Some content</ng-container>
  `,
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "ng_container_directive.ts",
      lineNumber: 17
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
          args: [{ declarations: [DirectiveA, MyComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [DirectiveA, MyComponent] });
})();

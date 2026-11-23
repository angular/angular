import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgModule,
  ViewContainerRef
} from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  el;
  vcr;
  cdr;
  constructor(el, vcr, cdr) {
    this.el = el;
    this.vcr = vcr;
    this.cdr = cdr;
  }
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyComponent)(
      i0.ɵɵdirectiveInject(i0.ElementRef),
      i0.ɵɵdirectiveInject(i0.ViewContainerRef),
      i0.ɵɵdirectiveInject(i0.ChangeDetectorRef)
    );
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function MyComponent_Template(rf, ctx) {},
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
              template: "",
              standalone: false
            }
          ]
        }
      ],
      () => [
        { type: i0.ElementRef },
        { type: i0.ViewContainerRef },
        { type: i0.ChangeDetectorRef }
      ],
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "view_tokens_di.ts",
      lineNumber: 7
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
          args: [{ declarations: [MyComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] });
})();

import { Component, Directive } from "@angular/core";
import * as i0 from "@angular/core";
export class DirectiveA {
  static ɵfac = function DirectiveA_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || DirectiveA)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: DirectiveA });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      DirectiveA,
      [
        {
          type: Directive,
          args: [{}]
        }
      ],
      null,
      null
    );
})();
export class DirectiveB {
  static ɵfac = function DirectiveB_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || DirectiveB)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DirectiveB,
    features: [i0.ɵɵHostDirectivesFeature([DirectiveA])]
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      DirectiveB,
      [
        {
          type: Directive,
          args: [
            {
              hostDirectives: [DirectiveA]
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class DirectiveC {
  static ɵfac = function DirectiveC_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || DirectiveC)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DirectiveC,
    features: [i0.ɵɵHostDirectivesFeature([DirectiveB])]
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      DirectiveC,
      [
        {
          type: Directive,
          args: [
            {
              hostDirectives: [DirectiveB]
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
    features: [i0.ɵɵHostDirectivesFeature([DirectiveC])],
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
              hostDirectives: [DirectiveC],
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
      filePath: "chained_host_directives.ts",
      lineNumber: 25
    });
})();

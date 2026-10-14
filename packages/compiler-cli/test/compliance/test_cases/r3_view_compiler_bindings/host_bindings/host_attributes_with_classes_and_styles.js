import { Component, Directive, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class HostAttributeComp {
  static ɵfac = function HostAttributeComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostAttributeComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HostAttributeComp,
    selectors: [["my-host-attribute-component"]],
    hostAttrs: ["title", "hello there from component", 2, "opacity", "1"],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function HostAttributeComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "...");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostAttributeComp,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-host-attribute-component",
              template: "...",
              host: { "title": "hello there from component", "style": "opacity:1" },
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
    i0.ɵsetClassDebugInfo(HostAttributeComp, {
      className: "HostAttributeComp",
      filePath: "host_attributes_with_classes_and_styles.ts",
      lineNumber: 9
    });
})();
export class HostAttributeDir {
  static ɵfac = function HostAttributeDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostAttributeDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostAttributeDir,
    selectors: [["", "hostAttributeDir", ""]],
    hostAttrs: [
      "title",
      "hello there from directive",
      1,
      "one",
      "two",
      2,
      "width",
      "200px",
      "height",
      "500px"
    ],
    hostVars: 4,
    hostBindings: function HostAttributeDir_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵstyleProp("opacity", true);
        i0.ɵɵclassProp("three", true);
      }
    },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostAttributeDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[hostAttributeDir]",
              host: {
                "style": "width: 200px; height: 500px",
                "[style.opacity]": "true",
                "class": "one two",
                "[class.three]": "true",
                "title": "hello there from directive"
              },
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
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
          args: [{ declarations: [HostAttributeComp, HostAttributeDir] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostAttributeComp, HostAttributeDir] });
})();

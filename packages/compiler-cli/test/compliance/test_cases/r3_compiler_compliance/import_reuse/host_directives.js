import { Component, forwardRef } from "@angular/core";
import { HostDir, OtherHostDir as AliasedHostDir } from "./directives";
import * as directives from "./directives";
import * as i0 from "@angular/core";
export class HostCmp {
  static ɵfac = function HostCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HostCmp,
    selectors: [["host-cmp"]],
    features: [i0.ɵɵHostDirectivesFeature([HostDir, AliasedHostDir])],
    decls: 0,
    vars: 0,
    template: function HostCmp_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostCmp,
      [
        {
          type: Component,
          args: [
            {
              selector: "host-cmp",
              template: "",
              hostDirectives: [HostDir, AliasedHostDir]
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
    i0.ɵsetClassDebugInfo(HostCmp, {
      className: "HostCmp",
      filePath: "host_directives.ts",
      lineNumber: 11
    });
})();
export class NamespaceHostCmp {
  static ɵfac = function NamespaceHostCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || NamespaceHostCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: NamespaceHostCmp,
    selectors: [["namespace-host-cmp"]],
    features: [
      i0.ɵɵHostDirectivesFeature(function () {
        return [
          { directive: directives.HostDir, inputs: ["label", "label"] },
          directives.OtherHostDir
        ];
      })
    ],
    decls: 0,
    vars: 0,
    template: function NamespaceHostCmp_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      NamespaceHostCmp,
      [
        {
          type: Component,
          args: [
            {
              selector: "namespace-host-cmp",
              template: "",
              hostDirectives: [
                { directive: directives.HostDir, inputs: ["label"] },
                forwardRef(() => directives.OtherHostDir)
              ]
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
    i0.ɵsetClassDebugInfo(NamespaceHostCmp, {
      className: "NamespaceHostCmp",
      filePath: "host_directives.ts",
      lineNumber: 21
    });
})();

import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const TestCmp_Defer_1_DepsFn = () => [
  /* @ts-ignore */ import("./defer_deps_ext").then(m => m.CmpA),
  LocalDep
];
function TestCmp_Defer_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "cmp-a")(1, "local-dep");
  }
}
export class LocalDep {
  static ɵfac = function LocalDep_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || LocalDep)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LocalDep,
    selectors: [["local-dep"]],
    decls: 1,
    vars: 0,
    template: function LocalDep_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "Local dependency");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      LocalDep,
      [
        {
          type: Component,
          args: [
            {
              selector: "local-dep",
              template: "Local dependency"
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
    i0.ɵsetClassDebugInfo(LocalDep, {
      className: "LocalDep",
      filePath: "defer_deps.ts",
      lineNumber: 9
    });
})();
export class TestCmp {
  static ɵfac = function TestCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [["test-cmp"]],
    decls: 3,
    vars: 0,
    template: function TestCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, TestCmp_Defer_0_Template, 2, 0);
        i0.ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadataAsync(
      TestCmp,
      () => [/* @ts-ignore */ import("./defer_deps_ext").then(m => m.CmpA)],
      CmpA => {
        i0.ɵsetClassMetadata(
          TestCmp,
          [
            {
              type: Component,
              args: [
                {
                  selector: "test-cmp",
                  imports: [CmpA, LocalDep],
                  template: `
	@defer {
	<cmp-a />
	<local-dep />
	}
`
                }
              ]
            }
          ],
          null,
          null
        );
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: "TestCmp",
      filePath: "defer_deps.ts",
      lineNumber: 22
    });
})();

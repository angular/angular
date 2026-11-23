import { Component, Directive } from "@angular/core";
import * as i0 from "@angular/core";
export class AbstractDir {
  static ɵfac = function AbstractDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || AbstractDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: AbstractDir,
    selectors: [["", "test-dir", ""]]
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      AbstractDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[test-dir]"
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class AbstractInherited extends AbstractDir {
  static ɵfac = /*@__PURE__*/ (() => {
    let ɵAbstractInherited_BaseFactory;
    return function AbstractInherited_Factory(__ngFactoryType__) {
      return (
        ɵAbstractInherited_BaseFactory ||
        (ɵAbstractInherited_BaseFactory = i0.ɵɵgetInheritedFactory(AbstractInherited))
      )(__ngFactoryType__ || AbstractInherited);
    };
  })();
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: AbstractInherited,
    selectors: [["", "dir2", ""]],
    features: [i0.ɵɵInheritDefinitionFeature]
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      AbstractInherited,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[dir2]"
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class AbstractComp {
  static ɵfac = function AbstractComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || AbstractComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AbstractComp,
    selectors: [["test-comp"]],
    decls: 0,
    vars: 0,
    template: function AbstractComp_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      AbstractComp,
      [
        {
          type: Component,
          args: [
            {
              selector: "test-comp",
              template: ""
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
    i0.ɵsetClassDebugInfo(AbstractComp, {
      className: "AbstractComp",
      filePath: "abstract_directive.ts",
      lineNumber: 19
    });
})();

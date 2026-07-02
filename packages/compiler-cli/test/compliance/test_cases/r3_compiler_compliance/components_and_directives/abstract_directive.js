import { Component, Directive } from '@angular/core';
import * as i0 from "@angular/core";

…
export class AbstractDir {
  …
  static ɵfac = function AbstractDir_Factory(__ngFactoryType__) {
    …
    return new (__ngFactoryType__ || AbstractDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: AbstractDir,
    selectors: [["", "test-dir", ""]]
  });
}
…
export class AbstractInherited extends AbstractDir {
  …
  static ɵfac = /*@__PURE__*/ (() => { let ɵAbstractInherited_BaseFactory; return function AbstractInherited_Factory(__ngFactoryType__) { return (ɵAbstractInherited_BaseFactory || (ɵAbstractInherited_BaseFactory = i0.ɵɵgetInheritedFactory(AbstractInherited)))(__ngFactoryType__ || AbstractInherited); }; })();
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: AbstractInherited,
    selectors: [["", "dir2", ""]],
    features: [i0.ɵɵInheritDefinitionFeature]
  });
}
…
export class AbstractComp {
  …
  static ɵfac = function AbstractComp_Factory(__ngFactoryType__) {
    …
    return new (__ngFactoryType__ || AbstractComp)();
  };
    …
}
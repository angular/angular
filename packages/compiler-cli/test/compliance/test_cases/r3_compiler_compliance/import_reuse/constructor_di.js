import { Directive, ElementRef, Injectable, Pipe, TemplateRef } from "@angular/core";
import DefaultDep from "./default_dep";
import { Dep, OtherDep as AliasedDep } from "./deps";
import * as deps from "./deps";
import * as i0 from "@angular/core";
export class MyService {
  constructor(dep, aliased, member, nestedMember, defaultDep) {}
  static ɵfac = function MyService_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyService)(
      i0.ɵɵinject(Dep),
      i0.ɵɵinject(AliasedDep),
      i0.ɵɵinject(deps.Dep),
      i0.ɵɵinject(deps.nested.DeepDep),
      i0.ɵɵinject(DefaultDep)
    );
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyService, factory: MyService.ɵfac });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyService,
      [
        {
          type: Injectable
        }
      ],
      () => [
        { type: Dep },
        { type: AliasedDep },
        { type: deps.Dep },
        { type: deps.nested.DeepDep },
        { type: DefaultDep }
      ],
      null
    );
})();
export class MyDir {
  constructor(el, template, dep) {}
  static ɵfac = function MyDir_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyDir)(
      i0.ɵɵdirectiveInject(ElementRef),
      i0.ɵɵdirectiveInject(TemplateRef),
      i0.ɵɵdirectiveInject(Dep)
    );
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: MyDir, selectors: [["", "myDir", ""]] });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyDir,
      [
        {
          type: Directive,
          args: [{ selector: "[myDir]" }]
        }
      ],
      () => [{ type: ElementRef }, { type: TemplateRef }, { type: Dep }],
      null
    );
})();
export class MyPipe {
  constructor(dep) {}
  transform(value) {
    return value;
  }
  static ɵfac = function MyPipe_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyPipe)(i0.ɵɵdirectiveInject(Dep, 16));
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "myPipe", type: MyPipe, pure: true });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyPipe,
      [
        {
          type: Pipe,
          args: [{ name: "myPipe" }]
        }
      ],
      () => [{ type: Dep }],
      null
    );
})();

import { Component, Input, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
let events = [];
export class LifecycleComp {
  nameMin;
  ngOnChanges() {
    events.push("changes" + this.nameMin);
  }
  ngOnInit() {
    events.push("init" + this.nameMin);
  }
  ngDoCheck() {
    events.push("check" + this.nameMin);
  }
  ngAfterContentInit() {
    events.push("content init" + this.nameMin);
  }
  ngAfterContentChecked() {
    events.push("content check" + this.nameMin);
  }
  ngAfterViewInit() {
    events.push("view init" + this.nameMin);
  }
  ngAfterViewChecked() {
    events.push("view check" + this.nameMin);
  }
  ngOnDestroy() {
    events.push(this.nameMin);
  }
  static ɵfac = function LifecycleComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || LifecycleComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LifecycleComp,
    selectors: [["lifecycle-comp"]],
    inputs: { nameMin: [0, "name", "nameMin"] },
    standalone: false,
    features: [i0.ɵɵNgOnChangesFeature],
    decls: 0,
    vars: 0,
    template: function LifecycleComp_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      LifecycleComp,
      [
        {
          type: Component,
          args: [
            {
              selector: "lifecycle-comp",
              template: "",
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        nameMin: [
          {
            type: Input,
            args: ["name"]
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(LifecycleComp, {
      className: "LifecycleComp",
      filePath: "lifecycle_hooks.ts",
      lineNumber: 9
    });
})();
export class SimpleLayout {
  name1 = "1";
  name2 = "2";
  static ɵfac = function SimpleLayout_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SimpleLayout)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SimpleLayout,
    selectors: [["simple-layout"]],
    standalone: false,
    decls: 2,
    vars: 2,
    consts: [[3, "name"]],
    template: function SimpleLayout_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "lifecycle-comp", 0)(1, "lifecycle-comp", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("name", ctx.name1);
        i0.ɵɵadvance();
        i0.ɵɵproperty("name", ctx.name2);
      }
    },
    dependencies: [LifecycleComp],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SimpleLayout,
      [
        {
          type: Component,
          args: [
            {
              selector: "simple-layout",
              template: `
    <lifecycle-comp [name]="name1"></lifecycle-comp>
    <lifecycle-comp [name]="name2"></lifecycle-comp>
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
    i0.ɵsetClassDebugInfo(SimpleLayout, {
      className: "SimpleLayout",
      filePath: "lifecycle_hooks.ts",
      lineNumber: 50
    });
})();
export class LifecycleModule {
  static ɵfac = function LifecycleModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || LifecycleModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: LifecycleModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      LifecycleModule,
      [
        {
          type: NgModule,
          args: [{ declarations: [LifecycleComp, SimpleLayout] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(LifecycleModule, { declarations: [LifecycleComp, SimpleLayout] });
})();

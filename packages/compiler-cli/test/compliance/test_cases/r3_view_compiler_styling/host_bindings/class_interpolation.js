import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  p1 = 100;
  p2 = 100;
  p3 = 100;
  p4 = 100;
  p5 = 100;
  p6 = 100;
  p7 = 100;
  p8 = 100;
  p9 = 100;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 9,
    vars: 63,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div")(1, "div")(2, "div")(3, "div")(4, "div")(5, "div")(6, "div")(
          7,
          "div"
        )(8, "div");
      }
      if (rf & 2) {
        i0.ɵɵclassMap(i0.ɵɵinterpolate1("A", ctx.p1, "B"));
        i0.ɵɵadvance();
        i0.ɵɵclassMap(i0.ɵɵinterpolate2("A", ctx.p1, "B", ctx.p2, "C"));
        i0.ɵɵadvance();
        i0.ɵɵclassMap(i0.ɵɵinterpolate3("A", ctx.p1, "B", ctx.p2, "C", ctx.p3, "D"));
        i0.ɵɵadvance();
        i0.ɵɵclassMap(i0.ɵɵinterpolate4("A", ctx.p1, "B", ctx.p2, "C", ctx.p3, "D", ctx.p4, "E"));
        i0.ɵɵadvance();
        i0.ɵɵclassMap(
          i0.ɵɵinterpolate5("A", ctx.p1, "B", ctx.p2, "C", ctx.p3, "D", ctx.p4, "E", ctx.p5, "F")
        );
        i0.ɵɵadvance();
        i0.ɵɵclassMap(
          i0.ɵɵinterpolate6(
            "A",
            ctx.p1,
            "B",
            ctx.p2,
            "C",
            ctx.p3,
            "D",
            ctx.p4,
            "E",
            ctx.p5,
            "F",
            ctx.p6,
            "G"
          )
        );
        i0.ɵɵadvance();
        i0.ɵɵclassMap(
          i0.ɵɵinterpolate7(
            "A",
            ctx.p1,
            "B",
            ctx.p2,
            "C",
            ctx.p3,
            "D",
            ctx.p4,
            "E",
            ctx.p5,
            "F",
            ctx.p6,
            "G",
            ctx.p7,
            "H"
          )
        );
        i0.ɵɵadvance();
        i0.ɵɵclassMap(
          i0.ɵɵinterpolate8(
            "A",
            ctx.p1,
            "B",
            ctx.p2,
            "C",
            ctx.p3,
            "D",
            ctx.p4,
            "E",
            ctx.p5,
            "F",
            ctx.p6,
            "G",
            ctx.p7,
            "H",
            ctx.p8,
            "I"
          )
        );
        i0.ɵɵadvance();
        i0.ɵɵclassMap(
          i0.ɵɵinterpolateV([
            "A",
            ctx.p1,
            "B",
            ctx.p2,
            "C",
            ctx.p3,
            "D",
            ctx.p4,
            "E",
            ctx.p5,
            "F",
            ctx.p6,
            "G",
            ctx.p7,
            "H",
            ctx.p8,
            "I",
            ctx.p9,
            "J"
          ])
        );
      }
    },
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
    <div class="A{{p1}}B"></div>
    <div class="A{{p1}}B{{p2}}C"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H{{p8}}I"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H{{p8}}I{{p9}}J"></div>
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
      filePath: "class_interpolation.ts",
      lineNumber: 18
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

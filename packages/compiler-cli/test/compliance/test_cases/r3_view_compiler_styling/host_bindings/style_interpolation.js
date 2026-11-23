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
        i0.ɵɵstyleMap(i0.ɵɵinterpolate1("p1:", ctx.p1, ";"));
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(i0.ɵɵinterpolate2("p1:", ctx.p1, ";p2:", ctx.p2, ";"));
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(i0.ɵɵinterpolate3("p1:", ctx.p1, ";p2:", ctx.p2, ";p3:", ctx.p3, ";"));
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(
          i0.ɵɵinterpolate4("p1:", ctx.p1, ";p2:", ctx.p2, ";p3:", ctx.p3, ";p4:", ctx.p4, ";")
        );
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(
          i0.ɵɵinterpolate5(
            "p1:",
            ctx.p1,
            ";p2:",
            ctx.p2,
            ";p3:",
            ctx.p3,
            ";p4:",
            ctx.p4,
            ";p5:",
            ctx.p5,
            ";"
          )
        );
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(
          i0.ɵɵinterpolate6(
            "p1:",
            ctx.p1,
            ";p2:",
            ctx.p2,
            ";p3:",
            ctx.p3,
            ";p4:",
            ctx.p4,
            ";p5:",
            ctx.p5,
            ";p6:",
            ctx.p6,
            ";"
          )
        );
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(
          i0.ɵɵinterpolate7(
            "p1:",
            ctx.p1,
            ";p2:",
            ctx.p2,
            ";p3:",
            ctx.p3,
            ";p4:",
            ctx.p4,
            ";p5:",
            ctx.p5,
            ";p6:",
            ctx.p6,
            ";p7:",
            ctx.p7,
            ";"
          )
        );
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(
          i0.ɵɵinterpolate8(
            "p1:",
            ctx.p1,
            ";p2:",
            ctx.p2,
            ";p3:",
            ctx.p3,
            ";p4:",
            ctx.p4,
            ";p5:",
            ctx.p5,
            ";p6:",
            ctx.p6,
            ";p7:",
            ctx.p7,
            ";p8:",
            ctx.p8,
            ";"
          )
        );
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(
          i0.ɵɵinterpolateV([
            "p1:",
            ctx.p1,
            ";p2:",
            ctx.p2,
            ";p3:",
            ctx.p3,
            ";p4:",
            ctx.p4,
            ";p5:",
            ctx.p5,
            ";p6:",
            ctx.p6,
            ";p7:",
            ctx.p7,
            ";p8:",
            ctx.p8,
            ";p9:",
            ctx.p9,
            ";"
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
    <div style="p1:{{p1}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};p7:{{p7}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};p7:{{p7}};p8:{{p8}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};p7:{{p7}};p8:{{p8}};p9:{{p9}};"></div>
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
      filePath: "style_interpolation.ts",
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

import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  name = "John Doe";
  one;
  two;
  three;
  four;
  five;
  six;
  seven;
  eight;
  nine;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-app"]],
    standalone: false,
    decls: 10,
    vars: 56,
    consts: [[3, "title"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div", 0)(1, "div", 0)(2, "div", 0)(3, "div", 0)(4, "div", 0)(5, "div", 0)(
          6,
          "div",
          0
        )(7, "div", 0)(8, "div", 0)(9, "div", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty(
          "title",
          i0.ɵɵinterpolateV([
            "a",
            ctx.one,
            "b",
            ctx.two,
            "c",
            ctx.three,
            "d",
            ctx.four,
            "e",
            ctx.five,
            "f",
            ctx.six,
            "g",
            ctx.seven,
            "h",
            ctx.eight,
            "i",
            ctx.nine,
            "j"
          ])
        );
        i0.ɵɵadvance();
        i0.ɵɵproperty(
          "title",
          i0.ɵɵinterpolate8(
            "a",
            ctx.one,
            "b",
            ctx.two,
            "c",
            ctx.three,
            "d",
            ctx.four,
            "e",
            ctx.five,
            "f",
            ctx.six,
            "g",
            ctx.seven,
            "h",
            ctx.eight,
            "i"
          )
        );
        i0.ɵɵadvance();
        i0.ɵɵproperty(
          "title",
          i0.ɵɵinterpolate7(
            "a",
            ctx.one,
            "b",
            ctx.two,
            "c",
            ctx.three,
            "d",
            ctx.four,
            "e",
            ctx.five,
            "f",
            ctx.six,
            "g",
            ctx.seven,
            "h"
          )
        );
        i0.ɵɵadvance();
        i0.ɵɵproperty(
          "title",
          i0.ɵɵinterpolate6(
            "a",
            ctx.one,
            "b",
            ctx.two,
            "c",
            ctx.three,
            "d",
            ctx.four,
            "e",
            ctx.five,
            "f",
            ctx.six,
            "g"
          )
        );
        i0.ɵɵadvance();
        i0.ɵɵproperty(
          "title",
          i0.ɵɵinterpolate5(
            "a",
            ctx.one,
            "b",
            ctx.two,
            "c",
            ctx.three,
            "d",
            ctx.four,
            "e",
            ctx.five,
            "f"
          )
        );
        i0.ɵɵadvance();
        i0.ɵɵproperty(
          "title",
          i0.ɵɵinterpolate4("a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e")
        );
        i0.ɵɵadvance();
        i0.ɵɵproperty("title", i0.ɵɵinterpolate3("a", ctx.one, "b", ctx.two, "c", ctx.three, "d"));
        i0.ɵɵadvance();
        i0.ɵɵproperty("title", i0.ɵɵinterpolate2("a", ctx.one, "b", ctx.two, "c"));
        i0.ɵɵadvance();
        i0.ɵɵproperty("title", i0.ɵɵinterpolate1("a", ctx.one, "b"));
        i0.ɵɵadvance();
        i0.ɵɵproperty("title", i0.ɵɵinterpolate(ctx.one));
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
              selector: "my-app",
              template: `
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
    <div title="a{{one}}b{{two}}c{{three}}d"></div>
    <div title="a{{one}}b{{two}}c"></div>
    <div title="a{{one}}b"></div>
    <div title="{{one}}"></div>
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
      filePath: "interpolated_properties.ts",
      lineNumber: 19
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

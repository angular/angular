import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  one = "";
  two = "";
  three = "";
  four = "";
  five = "";
  six = "";
  seven = "";
  eight = "";
  nine = "";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 10,
    vars: 65,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div")(1, "div")(2, "div")(3, "div")(4, "div")(5, "div")(6, "div")(
          7,
          "div"
        )(8, "div")(9, "div");
      }
      if (rf & 2) {
        i0.ɵɵclassMap(
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
        i0.ɵɵclassMap(
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
        i0.ɵɵclassMap(
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
        i0.ɵɵclassMap(
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
        i0.ɵɵclassMap(
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
        i0.ɵɵclassMap(
          i0.ɵɵinterpolate4("a", ctx.one, "b", ctx.two, "c", ctx.three, "d", ctx.four, "e")
        );
        i0.ɵɵadvance();
        i0.ɵɵclassMap(i0.ɵɵinterpolate3("a", ctx.one, "b", ctx.two, "c", ctx.three, "d"));
        i0.ɵɵadvance();
        i0.ɵɵclassMap(i0.ɵɵinterpolate2("a", ctx.one, "b", ctx.two, "c"));
        i0.ɵɵadvance();
        i0.ɵɵclassMap(i0.ɵɵinterpolate1("a", ctx.one, "b"));
        i0.ɵɵadvance();
        i0.ɵɵclassMap(ctx.one);
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
              template: `
    <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
    <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
    <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
    <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
    <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
    <div class="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
    <div class="a{{one}}b{{two}}c{{three}}d"></div>
    <div class="a{{one}}b{{two}}c"></div>
    <div class="a{{one}}b"></div>
    <div class="{{one}}"></div>
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
      filePath: "class_interpolations.ts",
      lineNumber: 18
    });
})();

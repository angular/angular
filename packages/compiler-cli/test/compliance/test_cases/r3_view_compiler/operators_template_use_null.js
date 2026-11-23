import { Component, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = () => ({});
export class IdentityPipe {
  transform(value) {
    return value;
  }
  static ɵfac = function IdentityPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || IdentityPipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "identity",
    type: IdentityPipe,
    pure: true
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      IdentityPipe,
      [
        {
          type: Pipe,
          args: [{ name: "identity" }]
        }
      ],
      null,
      null
    );
})();
export class Bar {}
export class MyApp {
  foo = { bar: "baz" };
  number = 1;
  bar = new Bar();
  Bar = Bar;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 15,
    vars: 15,
    consts: [[3, "click"]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵpipe(1, "identity");
        i0.ɵɵdomElementStart(2, "button", 0);
        i0.ɵɵdomListener("click", function MyApp_Template_button_click_2_listener() {
          return (ctx.number += 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(3, "button", 0);
        i0.ɵɵdomListener("click", function MyApp_Template_button_click_3_listener() {
          return (ctx.number -= 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(4, "button", 0);
        i0.ɵɵdomListener("click", function MyApp_Template_button_click_4_listener() {
          return (ctx.number *= 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(5, "button", 0);
        i0.ɵɵdomListener("click", function MyApp_Template_button_click_5_listener() {
          return (ctx.number /= 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(6, "button", 0);
        i0.ɵɵdomListener("click", function MyApp_Template_button_click_6_listener() {
          return (ctx.number %= 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(7, "button", 0);
        i0.ɵɵdomListener("click", function MyApp_Template_button_click_7_listener() {
          return (ctx.number **= 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(8, "button", 0);
        i0.ɵɵdomListener("click", function MyApp_Template_button_click_8_listener() {
          return (ctx.number &&= 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(9, "button", 0);
        i0.ɵɵdomListener("click", function MyApp_Template_button_click_9_listener() {
          return (ctx.number ||= 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(10, "button", 0);
        i0.ɵɵdomListener("click", function MyApp_Template_button_click_10_listener() {
          return (ctx.number ??= 1);
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(11, "button", 0);
        i0.ɵɵdomListener("click", function MyApp_Template_button_click_11_listener() {
          return ctx.number++;
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(12, "button", 0);
        i0.ɵɵdomListener("click", function MyApp_Template_button_click_12_listener() {
          return ctx.number--;
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(13, "button", 0);
        i0.ɵɵdomListener("click", function MyApp_Template_button_click_13_listener() {
          return ++ctx.number;
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(14, "button", 0);
        i0.ɵɵdomListener("click", function MyApp_Template_button_click_14_listener() {
          return --ctx.number;
        });
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolateV([
          " ",
          1 + 2,
          " ",
          (1 % 2) + (3 / 4) * 5 ** 6,
          " ",
          +1,
          " ",
          typeof i0.ɵɵpureFunction0(13, _c0) === "object",
          " ",
          !(typeof i0.ɵɵpureFunction0(14, _c0) === "object"),
          " ",
          typeof (ctx.foo == null ? null : ctx.foo.bar) === "string",
          " ",
          i0.ɵɵpipeBind1(1, 11, typeof (ctx.foo == null ? null : ctx.foo.bar)),
          " ",
          void "test",
          " ",
          (-1) ** 3,
          " ",
          "bar" in ctx.foo,
          " ",
          ctx.bar instanceof ctx.Bar,
          " "
        ]);
      }
    },
    dependencies: [IdentityPipe],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyApp,
      [
        {
          type: Component,
          args: [
            {
              template: `
    {{ 1 + 2 }}
    {{ (1 % 2) + 3 / 4 * 5 ** 6 }}
    {{ +1 }}
    {{ typeof {} === 'object' }}
    {{ !(typeof {} === 'object') }}
    {{ typeof foo?.bar === 'string' }}
    {{ typeof foo?.bar | identity }}
    {{ void 'test' }}
    {{ (-1) ** 3 }}
    {{ 'bar' in foo }}
    {{ bar instanceof Bar }}
    <button (click)="number += 1"></button>
    <button (click)="number -= 1"></button>
    <button (click)="number *= 1"></button>
    <button (click)="number /= 1"></button>
    <button (click)="number %= 1"></button>
    <button (click)="number **= 1"></button>
    <button (click)="number &&= 1"></button>
    <button (click)="number ||= 1"></button>
    <button (click)="number ??= 1"></button>
    <button (click)="number++"></button>
    <button (click)="number--"></button>
    <button (click)="++number"></button>
    <button (click)="--number"></button>
  `,
              imports: [IdentityPipe]
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "operators_use_null.ts",
      lineNumber: 41
    });
})();

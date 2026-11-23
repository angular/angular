import { Component, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
export class UppercasePipe {
  transform(value) {
    return value.toUpperCase();
  }
  static ɵfac = function UppercasePipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || UppercasePipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "uppercase",
    type: UppercasePipe,
    pure: true
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      UppercasePipe,
      [
        {
          type: Pipe,
          args: [{ name: "uppercase" }]
        }
      ],
      null,
      null
    );
})();
export class MyApp {
  name = "Frodo";
  timeOfDay = "morning";
  tag = (strings, ...args) => "";
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["my-app"]],
    decls: 7,
    vars: 5,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div");
        i0.ɵɵtext(1);
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(2, "span");
        i0.ɵɵtext(3);
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(4, "p");
        i0.ɵɵtext(5);
        i0.ɵɵpipe(6, "uppercase");
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1("No interpolations: ", ctx.tag`hello world `);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(
          "With interpolations: ",
          ctx.tag`hello ${ctx.name}, it is currently ${ctx.timeOfDay}!`
        );
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1("With pipe: ", i0.ɵɵpipeBind1(6, 3, ctx.tag`hello ${ctx.name}`));
      }
    },
    dependencies: [UppercasePipe],
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
              selector: "my-app",
              template: `
    <div>No interpolations: {{ tag\`hello world \` }}</div>
    <span>With interpolations: {{ tag\`hello \${name}, it is currently \${timeOfDay}!\` }}</span>
    <p>With pipe: {{ tag\`hello \${name}\` | uppercase }}</p>
  `,
              imports: [UppercasePipe]
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
      filePath: "tagged_template_literals.ts",
      lineNumber: 19
    });
})();

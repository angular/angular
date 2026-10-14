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
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["my-app"]],
    decls: 9,
    vars: 6,
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
        i0.ɵɵdomElementStart(7, "h4");
        i0.ɵɵtext(8);
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1("No interpolations: ", `hello world `);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(
          "With interpolations: ",
          `hello ${ctx.name}, it is currently ${ctx.timeOfDay}!`
        );
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1("With pipe: ", i0.ɵɵpipeBind1(6, 4, `hello ${ctx.name}`));
        const insideLet_r1 = `Hello ${ctx.name}`;
        i0.ɵɵadvance(3);
        i0.ɵɵtextInterpolate1(" Inside let: ", insideLet_r1);
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
    <div>No interpolations: {{ \`hello world \` }}</div>
    <span>With interpolations: {{ \`hello \${name}, it is currently \${timeOfDay}!\` }}</span>
    <p>With pipe: {{\`hello \${name}\` | uppercase}}</p>
    <h4>@let insideLet = \`Hello \${name}\`; Inside let: {{insideLet}}</h4>
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
      filePath: "template_literals.ts",
      lineNumber: 20
    });
})();

import { Component, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
export class DoublePipe {
  transform(value) {
    return value * 2;
  }
  static ɵfac = function DoublePipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || DoublePipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "double", type: DoublePipe, pure: true });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      DoublePipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "double"
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class MyApp {
  value = 1;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 3,
    vars: 3,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdeclareLet(0);
        i0.ɵɵpipe(1, "double");
        i0.ɵɵtext(2);
      }
      if (rf & 2) {
        const foo_r1 = i0.ɵɵpipeBind1(1, 1, ctx.value) + 3;
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(" ", foo_r1, " ");
      }
    },
    dependencies: [DoublePipe],
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
    @let foo = (value | double) + 3;
    {{foo}}
  `,
              imports: [DoublePipe]
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
      filePath: "let_with_pipe_optimization.ts",
      lineNumber: 19
    });
})();

import { Component, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " one ");
  }
}
function MyApp_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " two ");
  }
}
function MyApp_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " three ");
  }
}
export class TestPipe {
  transform(value) {
    return value;
  }
  static ɵfac = function TestPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestPipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "test", type: TestPipe, pure: true });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestPipe,
      [
        {
          type: Pipe,
          args: [{ name: "test" }]
        }
      ],
      null,
      null
    );
})();
export class MyApp {
  message = "hello";
  val = 1;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 7,
    vars: 6,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div");
        i0.ɵɵtext(1);
        i0.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 1, 0);
        i0.ɵɵpipe(3, "test");
        i0.ɵɵpipe(4, "test");
        i0.ɵɵconditionalBranchCreate(5, MyApp_Conditional_5_Template, 1, 0)(
          6,
          MyApp_Conditional_6_Template,
          1,
          0
        );
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(" ", ctx.message, " ");
        i0.ɵɵadvance();
        i0.ɵɵconditional(
          i0.ɵɵpipeBind1(3, 2, ctx.val) === 1 ? 2 : i0.ɵɵpipeBind1(4, 4, ctx.val) === 2 ? 5 : 6
        );
      }
    },
    dependencies: [TestPipe],
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
    <div>
      {{message}}
      @if ((val | test) === 1) {
        one
      } @else if ((val | test) === 2) {
        two
      } @else {
        three
      }
    </div>
  `,
              imports: [TestPipe]
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
      filePath: "if_with_pipe.ts",
      lineNumber: 25
    });
})();

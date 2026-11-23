import { Component, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Case_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " case 0 ");
  }
}
function MyApp_Case_6_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " case 1 ");
  }
}
function MyApp_Case_7_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " default ");
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
  value = () => 1;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 8,
    vars: 8,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div");
        i0.ɵɵtext(1);
        i0.ɵɵconditionalCreate(2, MyApp_Case_2_Template, 1, 0);
        i0.ɵɵpipe(3, "test");
        i0.ɵɵpipe(4, "test");
        i0.ɵɵpipe(5, "test");
        i0.ɵɵconditionalBranchCreate(6, MyApp_Case_6_Template, 1, 0)(
          7,
          MyApp_Case_7_Template,
          1,
          0
        );
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        let tmp_1_0;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(" ", ctx.message, " ");
        i0.ɵɵadvance();
        i0.ɵɵconditional(
          (tmp_1_0 = i0.ɵɵpipeBind1(3, 2, ctx.value())) === i0.ɵɵpipeBind1(4, 4, 0)
            ? 2
            : tmp_1_0 === i0.ɵɵpipeBind1(5, 6, 1)
              ? 6
              : 7
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
      @switch (value() | test) {
        @case (0 | test) {
          case 0
        }
        @case (1 | test) {
          case 1
        }
        @default {
          default
        }
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
      filePath: "switch_with_pipe.ts",
      lineNumber: 29
    });
})();

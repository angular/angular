import { Component, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_For_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const item_r1 = ctx.$implicit;
    i0.ɵɵtextInterpolate1(" ", item_r1, " ");
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
  items = [1, 2, 3];
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 5,
    vars: 3,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div");
        i0.ɵɵtext(1);
        i0.ɵɵrepeaterCreate(
          2,
          MyApp_For_3_Template,
          1,
          1,
          null,
          null,
          i0.ɵɵrepeaterTrackByIdentity
        );
        i0.ɵɵpipe(4, "test");
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(" ", ctx.message, " ");
        i0.ɵɵadvance();
        i0.ɵɵrepeater(i0.ɵɵpipeBind1(4, 1, ctx.items));
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
      @for (item of items | test; track item) {
        {{item}}
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
      filePath: "for_with_pipe.ts",
      lineNumber: 21
    });
})();

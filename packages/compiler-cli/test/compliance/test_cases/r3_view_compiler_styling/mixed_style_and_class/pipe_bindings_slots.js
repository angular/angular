import { Component, NgModule, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = () => ({});
export class PipePipe {
  transform(v) {}
  static ɵfac = function PipePipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || PipePipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "pipe",
    type: PipePipe,
    pure: true,
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      PipePipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "pipe",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class MyComponent {
  myStyleExp = {};
  fooExp = "foo";
  barExp = "bar";
  bazExp = "baz";
  items = [1, 2, 3];
  item = 1;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 6,
    vars: 24,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵpipe(1, "pipe");
        i0.ɵɵpipe(2, "pipe");
        i0.ɵɵpipe(3, "pipe");
        i0.ɵɵpipe(4, "pipe");
        i0.ɵɵtext(5);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵstyleMap(i0.ɵɵpipeBind2(1, 11, ctx.myStyleExp, 1000));
        i0.ɵɵclassMap(i0.ɵɵpureFunction0(23, _c0));
        i0.ɵɵstyleProp("bar", i0.ɵɵpipeBind2(2, 14, ctx.barExp, 3000))(
          "baz",
          i0.ɵɵpipeBind2(3, 17, ctx.bazExp, 4000)
        );
        i0.ɵɵclassProp("foo", i0.ɵɵpipeBind2(4, 20, ctx.fooExp, 2000));
        i0.ɵɵadvance(5);
        i0.ɵɵtextInterpolate1(" ", ctx.item);
      }
    },
    dependencies: [PipePipe],
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
    <div [class]="{}"
         [class.foo]="fooExp | pipe:2000"
         [style]="myStyleExp | pipe:1000"
         [style.bar]="barExp | pipe:3000"
         [style.baz]="bazExp | pipe:4000">
         {{ item }}</div>`,
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
      filePath: "pipe_bindings_slots.ts",
      lineNumber: 22
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
          args: [{ declarations: [MyComponent, PipePipe] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, PipePipe] });
})();

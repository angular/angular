import { Component, NgModule, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
export class StylePipe {
  transform(v) {}
  static ɵfac = function StylePipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || StylePipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "stylePipe",
    type: StylePipe,
    pure: true,
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      StylePipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "stylePipe",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class ClassPipe {
  transform(v) {}
  static ɵfac = function ClassPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ClassPipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "classPipe",
    type: ClassPipe,
    pure: true,
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ClassPipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "classPipe",
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
  myStyleExp = [{ color: "red" }, { color: "blue", duration: 1000 }];
  myClassExp = "foo bar apple";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 3,
    vars: 8,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div");
        i0.ɵɵpipe(1, "stylePipe");
        i0.ɵɵpipe(2, "classPipe");
      }
      if (rf & 2) {
        i0.ɵɵstyleMap(i0.ɵɵpipeBind1(1, 4, ctx.myStyleExp));
        i0.ɵɵclassMap(i0.ɵɵpipeBind1(2, 6, ctx.myClassExp));
      }
    },
    dependencies: [StylePipe, ClassPipe],
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
              template: `<div [style]="myStyleExp | stylePipe" [class]="myClassExp | classPipe"></div>`,
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
      filePath: "pipe_bindings.ts",
      lineNumber: 24
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
          args: [{ declarations: [MyComponent, StylePipe, ClassPipe] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, StylePipe, ClassPipe] });
})();

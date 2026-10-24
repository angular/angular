import { Component, Directive, HostBinding, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class ClassDirective {
  myClassMap = { red: true };
  static ɵfac = function ClassDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ClassDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ClassDirective,
    selectors: [["", "myClassDir", ""]],
    hostVars: 2,
    hostBindings: function ClassDirective_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵclassMap(ctx.myClassMap);
      }
    },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ClassDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[myClassDir]",
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        myClassMap: [
          {
            type: HostBinding,
            args: ["class"]
          }
        ]
      }
    );
})();
export class WidthDirective {
  myWidth = 200;
  myFooClass = true;
  static ɵfac = function WidthDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || WidthDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: WidthDirective,
    selectors: [["", "myWidthDir", ""]],
    hostVars: 4,
    hostBindings: function WidthDirective_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵstyleProp("width", ctx.myWidth);
        i0.ɵɵclassProp("foo", ctx.myFooClass);
      }
    },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      WidthDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[myWidthDir]",
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        myWidth: [
          {
            type: HostBinding,
            args: ["style.width"]
          }
        ],
        myFooClass: [
          {
            type: HostBinding,
            args: ["class.foo"]
          }
        ]
      }
    );
})();
export class HeightDirective {
  myHeight = 200;
  myBarClass = true;
  static ɵfac = function HeightDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HeightDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HeightDirective,
    selectors: [["", "myHeightDir", ""]],
    hostVars: 4,
    hostBindings: function HeightDirective_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵstyleProp("height", ctx.myHeight);
        i0.ɵɵclassProp("bar", ctx.myBarClass);
      }
    },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HeightDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[myHeightDir]",
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        myHeight: [
          {
            type: HostBinding,
            args: ["style.height"]
          }
        ],
        myBarClass: [
          {
            type: HostBinding,
            args: ["class.bar"]
          }
        ]
      }
    );
})();
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [["myWidthDir", "", "myHeightDir", "", "myClassDir", ""]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div", 0);
      }
    },
    dependencies: [WidthDirective, HeightDirective, ClassDirective],
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
              template: "<div myWidthDir myHeightDir myClassDir></div>",
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
      filePath: "multiple_directives.ts",
      lineNumber: 36
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
          args: [{ declarations: [MyComponent, WidthDirective, HeightDirective, ClassDirective] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, {
      declarations: [MyComponent, WidthDirective, HeightDirective, ClassDirective]
    });
})();

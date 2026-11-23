import { Component, Input, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => [
  "start-",
  a0,
  a1,
  a2,
  a3,
  a4,
  "-middle-",
  a5,
  a6,
  a7,
  a8,
  "-end"
];
export class MyComp {
  names;
  static ɵfac = function MyComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComp,
    selectors: [["my-comp"]],
    inputs: { names: "names" },
    standalone: false,
    decls: 1,
    vars: 11,
    template: function MyComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolateV([
          " ",
          ctx.names[0],
          " ",
          ctx.names[1],
          " ",
          ctx.names[3],
          " ",
          ctx.names[4],
          " ",
          ctx.names[5],
          " ",
          ctx.names[6],
          " ",
          ctx.names[7],
          " ",
          ctx.names[8],
          " ",
          ctx.names[9],
          " ",
          ctx.names[10],
          " ",
          ctx.names[11],
          " "
        ]);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyComp,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-comp",
              template: `
    {{ names[0] }}
    {{ names[1] }}
    {{ names[3] }}
    {{ names[4] }}
    {{ names[5] }}
    {{ names[6] }}
    {{ names[7] }}
    {{ names[8] }}
    {{ names[9] }}
    {{ names[10] }}
    {{ names[11] }}
  `,
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        names: [
          {
            type: Input
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComp, {
      className: "MyComp",
      filePath: "array_literals_many.ts",
      lineNumber: 20
    });
})();
export class MyApp {
  n0 = "a";
  n1 = "b";
  n2 = "c";
  n3 = "d";
  n4 = "e";
  n5 = "f";
  n6 = "g";
  n7 = "h";
  n8 = "i";
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["my-app"]],
    standalone: false,
    decls: 1,
    vars: 11,
    consts: [[3, "names"]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "my-comp", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty(
          "names",
          i0.ɵɵpureFunctionV(1, _c0, [
            ctx.n0,
            ctx.n1,
            ctx.n2,
            ctx.n3,
            ctx.n4,
            ctx.n5,
            ctx.n6,
            ctx.n7,
            ctx.n8
          ])
        );
      }
    },
    dependencies: [MyComp],
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
  <my-comp [names]="['start-', n0, n1, n2, n3, n4, '-middle-', n5, n6, n7, n8, '-end']">
  </my-comp>
`,
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "array_literals_many.ts",
      lineNumber: 32
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
          args: [{ declarations: [MyComp, MyApp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComp, MyApp] });
})();

import { Component, Input, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = (a0, a1) => ({ collapsedHeight: a0, expandedHeight: a1 });
const _c1 = (a0, a1) => ({ value: a0, params: a1 });
const _c2 = (a0, a1) => ({ collapsedWidth: a0, expandedWidth: a1 });
export class MyComponent {
  expandedHeight;
  collapsedHeight;
  expandedWidth;
  collapsedWidth;
  getExpandedState() {
    return "expanded";
  }
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    hostVars: 14,
    hostBindings: function MyComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵsyntheticHostProperty(
          "@expansionHeight",
          i0.ɵɵpureFunction2(
            5,
            _c1,
            ctx.getExpandedState(),
            i0.ɵɵpureFunction2(2, _c0, ctx.collapsedHeight, ctx.expandedHeight)
          )
        )(
          "@expansionWidth",
          i0.ɵɵpureFunction2(
            11,
            _c1,
            ctx.getExpandedState(),
            i0.ɵɵpureFunction2(8, _c2, ctx.collapsedWidth, ctx.expandedWidth)
          )
        );
      }
    },
    inputs: {
      expandedHeight: "expandedHeight",
      collapsedHeight: "collapsedHeight",
      expandedWidth: "expandedWidth",
      collapsedWidth: "collapsedWidth"
    },
    standalone: false,
    decls: 1,
    vars: 0,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "...");
      }
    },
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
              template: "...",
              host: {
                "[@expansionHeight]": `{
        value: getExpandedState(),
        params: {
          collapsedHeight: collapsedHeight,
          expandedHeight: expandedHeight
        }
    }`,
                "[@expansionWidth]": `{
      value: getExpandedState(),
      params: {
        collapsedWidth: collapsedWidth,
        expandedWidth: expandedWidth
      }
    }`
              },
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        expandedHeight: [
          {
            type: Input
          }
        ],
        collapsedHeight: [
          {
            type: Input
          }
        ],
        expandedWidth: [
          {
            type: Input
          }
        ],
        collapsedWidth: [
          {
            type: Input
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "host_binding_pure_functions.ts",
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
          args: [{ declarations: [MyComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] });
})();

import {
  Attribute,
  Component,
  Host,
  Injectable,
  NgModule,
  Optional,
  Self,
  SkipSelf
} from "@angular/core";
import * as i0 from "@angular/core";
export class MyService {
  static ɵfac = function MyService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyService)();
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyService, factory: MyService.ɵfac });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyService,
      [
        {
          type: Injectable
        }
      ],
      null,
      null
    );
})();
function dynamicAttrName() {
  return "the-attr";
}
export class MyComponent {
  constructor(name, other, s1, s2, s4, s3, s5, s6) {}
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyComponent)(
      i0.ɵɵinjectAttribute("name"),
      i0.ɵɵinjectAttribute(dynamicAttrName()),
      i0.ɵɵdirectiveInject(MyService),
      i0.ɵɵdirectiveInject(MyService, 1),
      i0.ɵɵdirectiveInject(MyService, 2),
      i0.ɵɵdirectiveInject(MyService, 4),
      i0.ɵɵdirectiveInject(MyService, 8),
      i0.ɵɵdirectiveInject(MyService, 10)
    );
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function MyComponent_Template(rf, ctx) {},
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
              template: ``,
              standalone: false
            }
          ]
        }
      ],
      () => [
        {
          type: undefined,
          decorators: [
            {
              type: Attribute,
              args: ["name"]
            }
          ]
        },
        {
          type: undefined,
          decorators: [
            {
              type: Attribute,
              args: [dynamicAttrName()]
            }
          ]
        },
        { type: MyService },
        {
          type: MyService,
          decorators: [
            {
              type: Host
            }
          ]
        },
        {
          type: MyService,
          decorators: [
            {
              type: Self
            }
          ]
        },
        {
          type: MyService,
          decorators: [
            {
              type: SkipSelf
            }
          ]
        },
        {
          type: MyService,
          decorators: [
            {
              type: Optional
            }
          ]
        },
        {
          type: MyService,
          decorators: [
            {
              type: Self
            },
            {
              type: Optional
            }
          ]
        }
      ],
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "component_factory.ts",
      lineNumber: 15
    });
})();
export class MyModule {
  static ɵfac = function MyModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ providers: [MyService] });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyModule,
      [
        {
          type: NgModule,
          args: [{ declarations: [MyComponent], providers: [MyService] }]
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

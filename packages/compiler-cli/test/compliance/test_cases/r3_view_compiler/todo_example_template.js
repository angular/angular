import { Component, Input, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function TodoComponent_li_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.data);
  }
}
export class MyApp {
  list = [];
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["my-app"]],
    standalone: false,
    decls: 1,
    vars: 1,
    consts: [[3, "data"]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "todo", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("data", ctx.list);
      }
    },
    dependencies: () => [TodoComponent],
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
              template: '<todo [data]="list"></todo>',
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
      filePath: "todo_example.ts",
      lineNumber: 7
    });
})();
export class TodoComponent {
  data = [];
  myTitle;
  static ɵfac = function TodoComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TodoComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TodoComponent,
    selectors: [["todo"]],
    inputs: { data: "data" },
    standalone: false,
    decls: 2,
    vars: 2,
    consts: [
      [1, "list", 3, "title"],
      [4, "ngFor", "ngForOf"]
    ],
    template: function TodoComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "ul", 0);
        i0.ɵɵtemplate(1, TodoComponent_li_1_Template, 2, 1, "li", 1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty("title", ctx.myTitle);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngForOf", ctx.data);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TodoComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "todo",
              template:
                '<ul class="list" [title]="myTitle"><li *ngFor="let item of data">{{data}}</li></ul>',
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        data: [
          {
            type: Input
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TodoComponent, {
      className: "TodoComponent",
      filePath: "todo_example.ts",
      lineNumber: 16
    });
})();
export class TodoModule {
  static ɵfac = function TodoModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TodoModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: TodoModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TodoModule,
      [
        {
          type: NgModule,
          args: [
            {
              declarations: [TodoComponent, MyApp]
            }
          ]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(TodoModule, { declarations: [TodoComponent, MyApp] });
})();

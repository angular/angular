import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function AComponent_div_0_p_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "less than 10");
    i0.ɵɵelementEnd();
  }
}
function AComponent_div_0_p_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "less than 10");
    i0.ɵɵelementEnd();
  }
}
function AComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtemplate(1, AComponent_div_0_p_1_Template, 2, 0, "p", 1)(
      2,
      AComponent_div_0_p_2_Template,
      2,
      0,
      "p",
      1
    );
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const item_r1 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r1 < 10);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r1 < 10);
  }
}
function AComponent_div_1_p_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "more than 10");
    i0.ɵɵelementEnd();
  }
}
function AComponent_div_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtemplate(1, AComponent_div_1_p_1_Template, 2, 0, "p", 1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const item_r2 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", item_r2 > 10);
  }
}
function BComponent_div_0_ng_container_1_p_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "less than 10");
    i0.ɵɵelementEnd();
  }
}
function BComponent_div_0_ng_container_1_p_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "less than 10");
    i0.ɵɵelementEnd();
  }
}
function BComponent_div_0_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵtemplate(1, BComponent_div_0_ng_container_1_p_1_Template, 2, 0, "p", 1)(
      2,
      BComponent_div_0_ng_container_1_p_2_Template,
      2,
      0,
      "p",
      1
    );
    i0.ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const subitem_r1 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", subitem_r1 < 10);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", subitem_r1 < 10);
  }
}
function BComponent_div_0_ng_container_2_p_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "less than 10");
    i0.ɵɵelementEnd();
  }
}
function BComponent_div_0_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵtemplate(1, BComponent_div_0_ng_container_2_p_1_Template, 2, 0, "p", 1);
    i0.ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const subitem_r2 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", subitem_r2 < 10);
  }
}
function BComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtemplate(1, BComponent_div_0_ng_container_1_Template, 3, 2, "ng-container", 0)(
      2,
      BComponent_div_0_ng_container_2_Template,
      2,
      1,
      "ng-container",
      0
    );
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const item_r3 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", item_r3.subitems);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", item_r3.subitems);
  }
}
function BComponent_div_1_ng_container_1_p_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "more than 10");
    i0.ɵɵelementEnd();
  }
}
function BComponent_div_1_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵtemplate(1, BComponent_div_1_ng_container_1_p_1_Template, 2, 0, "p", 1);
    i0.ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const subitem_r4 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", subitem_r4 > 10);
  }
}
function BComponent_div_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtemplate(1, BComponent_div_1_ng_container_1_Template, 2, 1, "ng-container", 0);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const item_r5 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", item_r5.subitems);
  }
}
export class AComponent {
  items = [4, 2];
  static ɵfac = function AComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || AComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AComponent,
    selectors: [["a-component"]],
    standalone: false,
    decls: 2,
    vars: 2,
    consts: [
      [4, "ngFor", "ngForOf"],
      [4, "ngIf"]
    ],
    template: function AComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, AComponent_div_0_Template, 3, 2, "div", 0)(
          1,
          AComponent_div_1_Template,
          2,
          1,
          "div",
          0
        );
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngForOf", ctx.items);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngForOf", ctx.items);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      AComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "a-component",
              template: `
    <div *ngFor="let item of items">
      <p *ngIf="item < 10">less than 10</p>
      <p *ngIf="item < 10">less than 10</p>
    </div>
    <div *ngFor="let item of items">
      <p *ngIf="item > 10">more than 10</p>
    </div>
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
    i0.ɵsetClassDebugInfo(AComponent, {
      className: "AComponent",
      filePath: "unique_template_function_names.ts",
      lineNumber: 16
    });
})();
export class AModule {
  static ɵfac = function AModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || AModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      AModule,
      [
        {
          type: NgModule,
          args: [{ declarations: [AComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(AModule, { declarations: [AComponent] });
})();
export class BComponent {
  items = [{ subitems: [1, 3] }, { subitems: [3, 7] }];
  static ɵfac = function BComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || BComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: BComponent,
    selectors: [["b-component"]],
    standalone: false,
    decls: 2,
    vars: 2,
    consts: [
      [4, "ngFor", "ngForOf"],
      [4, "ngIf"]
    ],
    template: function BComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, BComponent_div_0_Template, 3, 2, "div", 0)(
          1,
          BComponent_div_1_Template,
          2,
          1,
          "div",
          0
        );
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngForOf", ctx.items);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngForOf", ctx.items);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      BComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "b-component",
              template: `
    <div *ngFor="let item of items">
      <ng-container *ngFor="let subitem of item.subitems">
        <p *ngIf="subitem < 10">less than 10</p>
        <p *ngIf="subitem < 10">less than 10</p>
      </ng-container>
      <ng-container *ngFor="let subitem of item.subitems">
        <p *ngIf="subitem < 10">less than 10</p>
      </ng-container>
    </div>
    <div *ngFor="let item of items">
      <ng-container *ngFor="let subitem of item.subitems">
        <p *ngIf="subitem > 10">more than 10</p>
      </ng-container>
    </div>
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
    i0.ɵsetClassDebugInfo(BComponent, {
      className: "BComponent",
      filePath: "unique_template_function_names.ts",
      lineNumber: 44
    });
})();
export class BModule {
  static ɵfac = function BModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || BModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: BModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      BModule,
      [
        {
          type: NgModule,
          args: [{ declarations: [BComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(BModule, { declarations: [BComponent] });
})();

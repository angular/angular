import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const SimpleComponent_Defer_5_DepsFn = () => [MyLazyCmp];
function SimpleComponent_Defer_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "my-lazy-cmp");
  }
}
function SimpleComponent_DeferLoading_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " Loading... ");
  }
}
function SimpleComponent_DeferPlaceholder_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " Placeholder! ");
  }
}
function SimpleComponent_DeferError_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " Failed to load dependencies :( ");
  }
}
class MyLazyCmp {
  static ɵfac = function MyLazyCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyLazyCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyLazyCmp,
    selectors: [["my-lazy-cmp"]],
    decls: 1,
    vars: 0,
    template: function MyLazyCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "Hi!");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyLazyCmp,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-lazy-cmp",
              template: "Hi!"
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
    i0.ɵsetClassDebugInfo(MyLazyCmp, {
      className: "MyLazyCmp",
      filePath: "lazy_with_blocks.ts",
      lineNumber: 8
    });
})();
class SimpleComponent {
  isVisible = false;
  ngOnInit() {
    setTimeout(() => {
      // This changes the triggering condition of the defer block,
      // but it should be ignored and the placeholder content should be visible.
      this.isVisible = true;
    });
  }
  static ɵfac = function SimpleComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SimpleComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SimpleComponent,
    selectors: [["app"]],
    decls: 7,
    vars: 2,
    template: function SimpleComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomTemplate(1, SimpleComponent_Defer_1_Template, 1, 0)(
          2,
          SimpleComponent_DeferLoading_2_Template,
          1,
          0
        )(3, SimpleComponent_DeferPlaceholder_3_Template, 1, 0)(
          4,
          SimpleComponent_DeferError_4_Template,
          1,
          0
        );
        i0.ɵɵdefer(5, 1, SimpleComponent_Defer_5_DepsFn, 2, 3, 4);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(" Visible: ", ctx.isVisible, ". ");
        i0.ɵɵadvance(5);
        i0.ɵɵdeferWhen(ctx.isVisible);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SimpleComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "app",
              imports: [MyLazyCmp],
              template: `
		Visible: {{ isVisible }}.

		@defer (when isVisible) {
			<my-lazy-cmp />
		} @loading {
			Loading...
		} @placeholder {
			Placeholder!
		} @error {
			Failed to load dependencies :(
		}
	`
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
    i0.ɵsetClassDebugInfo(SimpleComponent, {
      className: "SimpleComponent",
      filePath: "lazy_with_blocks.ts",
      lineNumber: 28
    });
})();

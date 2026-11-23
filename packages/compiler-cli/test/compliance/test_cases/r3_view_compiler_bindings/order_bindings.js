import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class SomeCmp {
  static ɵfac = function SomeCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SomeCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SomeCmp,
    selectors: [["some-elem"]],
    inputs: {
      attr1: "attr1",
      prop1: "prop1",
      attrInterp1: "attrInterp1",
      propInterp1: "propInterp1"
    },
    decls: 0,
    vars: 0,
    template: function SomeCmp_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SomeCmp,
      [
        {
          type: Component,
          args: [
            {
              selector: "some-elem",
              template: ``,
              inputs: ["attr1", "prop1", "attrInterp1", "propInterp1"]
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
    i0.ɵsetClassDebugInfo(SomeCmp, {
      className: "SomeCmp",
      filePath: "order_bindings.ts",
      lineNumber: 8
    });
})();
export class MyCmp {
  foo;
  static ɵfac = function MyCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyCmp,
    selectors: [["my-cmp"]],
    hostAttrs: ["literal1", "foo"],
    hostVars: 10,
    hostBindings: function MyCmp_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵlistener("event1", function MyCmp_event1_HostBindingHandler() {
          return ctx.foo();
        });
      }
      if (rf & 2) {
        i0.ɵɵdomProperty("id", ctx.foo);
        i0.ɵɵattribute("attr1", ctx.foo);
        i0.ɵɵstyleMap(ctx.foo);
        i0.ɵɵclassMap(ctx.foo);
        i0.ɵɵstyleProp("style1", true);
        i0.ɵɵclassProp("class1", false);
      }
    },
    decls: 1,
    vars: 10,
    consts: [["literal1", "foo", ",", "", ",", "", 1, "foo", 3, "event1", "prop1", "propInterp1"]],
    template: function MyCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "some-elem", 0);
        i0.ɵɵlistener("event1", function MyCmp_Template_some_elem_event1_0_listener() {
          return ctx.foo();
        });
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵstyleProp("style1", ctx.foo);
        i0.ɵɵclassProp("class1", ctx.foo);
        i0.ɵɵattribute("attrInterp1", i0.ɵɵinterpolate1("interp ", ctx.foo));
        i0.ɵɵproperty("propInterp1", i0.ɵɵinterpolate1("interp ", ctx.foo))("prop1", ctx.foo);
        i0.ɵɵattribute("attr1", ctx.foo);
      }
    },
    dependencies: [SomeCmp],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyCmp,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-cmp",
              imports: [SomeCmp],
              host: {
                "literal1": "foo",
                "(event1)": "foo()",
                "[attr.attr1]": "foo",
                "[id]": "foo",
                "[class.class1]": "false",
                "[style.style1]": "true",
                "[class]": "foo",
                "[style]": "foo"
              },
              template: `
		<some-elem
			literal1="foo"
			(event1)="foo()"
			[attr.attr1]="foo"
			[prop1]="foo",
			[class.class1]="foo",
			[style.style1]="foo"
			style="foo"
			class="foo"
			attr.attrInterp1="interp {{foo}}"
			propInterp1="interp {{foo}}"
			/>
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
    i0.ɵsetClassDebugInfo(MyCmp, {
      className: "MyCmp",
      filePath: "order_bindings.ts",
      lineNumber: 38
    });
})();

import { Directive } from "@angular/core";
import * as i0 from "@angular/core";
export class MyDirective {
  value;
  static ɵfac = function MyDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDirective,
    selectors: [["my-dir"]],
    hostAttrs: [2, "--camel-case", "foo", "--kebab-case", "foo"],
    hostVars: 4,
    hostBindings: function MyDirective_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵstyleProp("--%NS%camelCase", ctx.value)("--%NS%kebab-case", ctx.value);
      }
    },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "my-dir",
              host: {
                "[style.--camelCase]": "value",
                "[style.--kebab-case]": "value",
                "style": "--camelCase: foo; --kebab-case: foo"
              },
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();

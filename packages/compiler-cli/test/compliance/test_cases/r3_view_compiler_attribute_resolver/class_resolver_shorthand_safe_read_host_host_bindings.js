import { Directive } from "@angular/core";
import * as i0 from "@angular/core";
export class ShorthandDirective {
  choice = null;
  static ɵfac = function ShorthandDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ShorthandDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ShorthandDirective,
    selectors: [["", "shorthand", ""]],
    hostBindings: function ShorthandDirective_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵattributeResolver("class", function ShorthandDirective_class_HostBindingHandler($event) {
          return $event.resolve((ctx.choice == null ? null : ctx.choice.classes)($event.resolver));
        }, 3);
      }
    }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ShorthandDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[shorthand]",
              host: { "(class)": "choice?.classes" }
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class ExpansionDirective {
  choice = null;
  static ɵfac = function ExpansionDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ExpansionDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ExpansionDirective,
    selectors: [["", "expansion", ""]],
    hostBindings: function ExpansionDirective_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵattributeResolver("class", function ExpansionDirective_attr_class_HostBindingHandler($event) {
          return $event.resolve((ctx.choice == null ? null : ctx.choice.classes)($event.resolver));
        }, 1);
      }
    }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ExpansionDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[expansion]",
              host: { "(attr.class)": "$event.resolve((choice?.classes)($event.resolver))" }
            }
          ]
        }
      ],
      null,
      null
    );
})();

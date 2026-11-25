import { Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import * as i0 from "@angular/core";
export class ForOfDirective {
  view;
  template;
  previous;
  constructor(view, template) {
    this.view = view;
    this.template = template;
  }
  forOf;
  ngOnChanges(simpleChanges) {}
  static ɵfac = function ForOfDirective_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || ForOfDirective)(
      i0.ɵɵdirectiveInject(ViewContainerRef),
      i0.ɵɵdirectiveInject(TemplateRef)
    );
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ForOfDirective,
    selectors: [["", "forOf", ""]],
    inputs: { forOf: "forOf" },
    standalone: false,
    features: [i0.ɵɵNgOnChangesFeature]
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ForOfDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[forOf]",
              standalone: false
            }
          ]
        }
      ],
      () => [{ type: ViewContainerRef }, { type: TemplateRef }],
      {
        forOf: [
          {
            type: Input
          }
        ]
      }
    );
})();

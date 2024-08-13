function MyComponent__svg_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "text");
    i0.ɵɵtext(1, "Hello");
    i0.ɵɵelementEnd();
  }
}
…

// NOTE: AttributeMarker.Bindings = 3
consts: [[3, "ngIf"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg");
    i0.ɵɵtemplate(1, MyComponent__svg_ng_template_1_Template, 2, 0, "ng-template", 0);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx.condition);
  }
}

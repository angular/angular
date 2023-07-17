function MyComponent_li_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "li");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $item$ = ctx.$implicit;
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵtextInterpolate($item$.name);
  }
}
// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyComponent,
  selectors: [["my-component"]],
  decls: 2,
  vars: 1,
  consts: [[__AttributeMarker.Template__, "for", "forOf"]],
  template:  function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelementStart(0, "ul");
      $r3$.ɵɵtemplate(1, MyComponent_li_1_Template, 2, 1, "li", 0);
      $r3$.ɵɵelementEnd();
    }
    if (rf & 2) {
      $r3$.ɵɵadvance(1);
      $r3$.ɵɵproperty("forOf", ctx.items);
    }
  },
  dependencies: function() { return [ForOfDirective]; },
  encapsulation: 2
});

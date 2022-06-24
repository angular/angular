function MyComponent__svg_g_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵnamespaceSVG();
    $r3$.ɵɵelementStart(0,"g");
    $r3$.ɵɵelement(1,"circle");
    $r3$.ɵɵelementEnd();
  }
}
// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyComponent,
  selectors: [["my-component"]],
  decls: 2,
  vars: 1,
  consts: [[__AttributeMarker.Template__, "for", "forOf"]],
  template:  function MyComponent_Template(rf, ctx){
    if (rf & 1) {
      $r3$.ɵɵnamespaceSVG();
      $r3$.ɵɵelementStart(0,"svg");
      $r3$.ɵɵtemplate(1, MyComponent__svg_g_1_Template, 2, 0, "g", 0);
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

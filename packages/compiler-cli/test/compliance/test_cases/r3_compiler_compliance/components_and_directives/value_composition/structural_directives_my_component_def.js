function MyComponent_li_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "li");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $myComp$ = $r3$.ɵɵnextContext();
    const $foo$ = $r3$.ɵɵreference(1);
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate2("", $myComp$.salutation, " ", $foo$);
  }
}
// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyComponent,
  selectors: [["my-component"]],
  standalone: false,
  decls: 3,
  vars: 0,
  consts: [["foo", ""], [__AttributeMarker.Template__, "if"]],
  template:  function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelementStart(0, "ul", null, 0);
      $r3$.ɵɵtemplate(2, MyComponent_li_2_Template, 2, 2, "li", 1);
      $r3$.ɵɵelementEnd();
    }
  },
  dependencies: [IfDirective],
  encapsulation: 2
});

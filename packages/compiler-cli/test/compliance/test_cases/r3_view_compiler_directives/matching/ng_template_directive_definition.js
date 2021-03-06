function MyComponent_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, "Some content");
  }
}
…
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  …
  consts: [["directiveA", ""]],
  template: function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 1, 0, "ng-template", 0);
    }
  },
  …
  directives: [DirectiveA],
  …
});

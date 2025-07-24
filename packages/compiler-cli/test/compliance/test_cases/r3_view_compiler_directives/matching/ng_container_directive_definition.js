function MyComponent_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementContainerStart(0, 1);
    $r3$.ɵɵtext(1, "Some content");
    $r3$.ɵɵelementContainerEnd();
  }
}
…
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  …
  consts: [["directiveA", "", __AttributeMarker.Template__, "ngIf"], ["directiveA", ""]],
  template: function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtemplate(0, MyComponent_ng_container_0_Template, 2, 0, "ng-container", 0);
    }
    if (rf & 2) {
      $r3$.ɵɵproperty("ngIf", ctx.showing);
    }
  },
  …
  dependencies: [DirectiveA],
  …
});

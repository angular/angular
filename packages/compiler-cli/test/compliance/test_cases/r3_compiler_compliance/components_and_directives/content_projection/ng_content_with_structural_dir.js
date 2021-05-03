SimpleComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: SimpleComponent,
  selectors: [["simple"]],
  ngContentSelectors: $c0$,
  decls: 1,
  vars: 1,
  consts: [[__AttributeMarker.Template__, "ngIf"]],
  template:  function SimpleComponent_Template(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵprojectionDef();
      i0.ɵɵtemplate(0, SimpleComponent_ng_content_0_Template, 1, 0, "ng-content", 0);
    }
    if (rf & 2) {
      i0.ɵɵproperty("ngIf", ctx.showContent);
    }
  },
  encapsulation: 2
});

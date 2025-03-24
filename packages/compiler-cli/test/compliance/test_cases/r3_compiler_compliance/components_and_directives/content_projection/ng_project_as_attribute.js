MyApp.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
  type: MyApp,
  selectors: [
      ["my-app"]
  ],
  standalone: false,
  decls: 1,
  vars: 1,
  consts: [
      ["ngProjectAs", ".someclass", __AttributeMarker.ProjectAs__, ["", 8, "someclass"], __AttributeMarker.Template__, "ngIf"],
      ["ngProjectAs", ".someclass", __AttributeMarker.ProjectAs__, ["", 8, "someclass"]]
  ],
  template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
          i0.ɵɵtemplate(0, MyApp_div_0_Template, 1, 0, "div", 0);
      }
      if (rf & 2) {
          i0.ɵɵproperty("ngIf", ctx.show);
      }
  },
  encapsulation: 2
});

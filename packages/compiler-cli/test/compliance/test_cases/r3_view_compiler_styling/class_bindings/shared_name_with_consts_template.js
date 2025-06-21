consts: () => {
  __i18nMsg__('label', [], {}, {})
  return [
    ["attr", "", __AttributeMarker.Classes__, "attr"],
    ["ngProjectAs", "selector", __AttributeMarker.ProjectAs__, ["selector"], __AttributeMarker.Classes__, "selector"],
    [__AttributeMarker.Classes__, "width", __AttributeMarker.Styles__, "width", "0px"],
    [__AttributeMarker.Classes__, "tabindex", __AttributeMarker.Bindings__, "tabindex"],
    ["class", "ngIf", __AttributeMarker.Template__, "ngIf"],
    ["aria-label", i18n_0, __AttributeMarker.Classes__, "aria-label"],
    // NOTE: We tolerate a slight difference -- we emit `all` as a Template binding
    ["all", "", "ngProjectAs", "all", "style", "all:all", "class", "all", __AttributeMarker.ProjectAs__, ["all"], __AttributeMarker.Bindings__, "all", __AttributeMarker.Template__, "all"],
    [__AttributeMarker.Classes__, "ngIf"],
    ["all", "", "ngProjectAs", "all", __AttributeMarker.ProjectAs__, ["all"], __AttributeMarker.Classes__, "all", __AttributeMarker.Styles__, "all", "all", __AttributeMarker.Bindings__, "all"]
  ];
  },
  template: function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdomElement(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3);
      $r3$.ɵɵdomTemplate(4, MyComponent_div_4_Template, 1, 0, "div", 4);
      $r3$.ɵɵdomElement(5, "div", 5);
      $r3$.ɵɵdomTemplate(6, MyComponent_div_6_Template, 1, 1, "div", 6);
    }
    if (rf & 2) {
      $r3$.ɵɵadvance(3);
      $r3$.ɵɵdomProperty("tabindex", ctx.tabIndex);
      $r3$.ɵɵadvance();
      $r3$.ɵɵdomProperty("ngIf", ctx.cond);
      $r3$.ɵɵadvance(2);
      $r3$.ɵɵdomProperty("all", ctx.all);
    }
  }

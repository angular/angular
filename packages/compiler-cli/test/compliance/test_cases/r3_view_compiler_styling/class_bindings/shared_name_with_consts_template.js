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
	  i0.ɵɵelement(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3);
	  i0.ɵɵtemplate(4, MyComponent_div_4_Template, 1, 0, "div", 4);
	  i0.ɵɵelement(5, "div", 5);
	  i0.ɵɵtemplate(6, MyComponent_div_6_Template, 1, 1, "div", 6);
	}
	if (rf & 2) {
	  i0.ɵɵadvance(3);
	  i0.ɵɵproperty("tabindex", ctx.tabIndex);
	  i0.ɵɵadvance();
	  i0.ɵɵproperty("ngIf", ctx.cond);
	  i0.ɵɵadvance(2);
	  i0.ɵɵproperty("all", ctx.all);
	}
  }

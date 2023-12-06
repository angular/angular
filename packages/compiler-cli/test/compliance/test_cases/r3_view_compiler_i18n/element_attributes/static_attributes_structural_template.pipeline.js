function MyComponent_div_0_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵelement(0, "div", 1);
	}
  }
  …
  consts: () => {
	__i18nMsg__('introduction', [], {}, {meaning: 'm', desc: 'd'})
	return [
	  ["id", "static", "title", $i18n_0$, __AttributeMarker.Template__, "ngIf"],
	  ["id", "static", "title", $i18n_0$]
	];
  },
  template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵtemplate(0, MyComponent_div_0_Template, 1, 0, "div", 0);
	}
	if (rf & 2) {
	  $r3$.ɵɵproperty("ngIf", ctx.exp);
	}
  }
  
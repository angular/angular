consts: () => {
	__i18nMsg__('Hello {$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {original_code: {'interpolation': '{{ name }}'}}, {})
	return [
	   ["title", $i18n_0$],
	   [__AttributeMarker.Bindings__, "title"]
	];
  },
  template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 0, 0, "ng-template", 1);
	  $r3$.ɵɵi18nAttributes(1, 0);
	}
	if (rf & 2) {
	  $r3$.ɵɵi18nExp(ctx.name);
	  $r3$.ɵɵi18nApply(1);
	}
  }
  
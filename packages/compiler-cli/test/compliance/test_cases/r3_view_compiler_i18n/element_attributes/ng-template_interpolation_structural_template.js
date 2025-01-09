function MyComponent_0_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵtemplate(0, MyComponent_0_ng_template_0_Template, 0, 0, "ng-template", 2);
	  $r3$.ɵɵi18nAttributes(1, 0);
	}
	if (rf & 2) {
	  const $ctx_r2$ = $r3$.ɵɵnextContext();
	  $r3$.ɵɵi18nExp($ctx_r2$.name);
	  $r3$.ɵɵi18nApply(1);
	}
  }
  …
  consts: () => {
	__i18nMsg__('Hello {$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {original_code: {'interpolation': '{{ name }}'}}, {})
	return [
	  ["title", $i18n_0$],
	  [__AttributeMarker.Template__, "ngIf"],
	  [__AttributeMarker.Bindings__, "title"]
	];
  },
  template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵtemplate(0, MyComponent_0_Template, 2, 1, null, 1);
	}
	if (rf & 2) {
	  $r3$.ɵɵproperty("ngIf", true);
	}
  },
  
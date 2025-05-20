function MyComponent_img_1_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵelement(0, "img", 1);
	}
  }
  …
  function MyComponent_img_2_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵelementStart(0, "img", 4);
	  $r3$.ɵɵi18nAttributes(1, 0);
	  $r3$.ɵɵelementEnd();
	}
	if (rf & 2) {
	  const $ctx_r1$ = $r3$.ɵɵnextContext();
	  $r3$.ɵɵi18nExp($ctx_r1$.id);
	  $r3$.ɵɵi18nApply(1);
	}
  }
  …
  decls: 3,
  vars: 2,
  consts: () => {
	__i18nMsg__('App logo #{$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {original_code: {'interpolation': '{{ id }}'}}, {})
	return [
	  ["title", $i18n_0$],
	  ["src", "logo.png"],
	  ["src", "logo.png", __AttributeMarker.Template__, "ngIf"],
	  ["src", "logo.png", __AttributeMarker.Bindings__, "title",
						  __AttributeMarker.Template__, "ngIf"],
	  ["src", "logo.png", __AttributeMarker.I18n__, "title"]
	];
  },
  template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵelement(0, "img", 1);
	  $r3$.ɵɵtemplate(1, MyComponent_img_1_Template, 1, 0, "img", 2)(2, MyComponent_img_2_Template, 2, 1, "img", 3);
	}
	if (rf & 2) {
	  $r3$.ɵɵadvance();
	  $r3$.ɵɵproperty("ngIf", ctx.visible);
	  $r3$.ɵɵadvance();
	  $r3$.ɵɵproperty("ngIf", ctx.visible);
	}
  }

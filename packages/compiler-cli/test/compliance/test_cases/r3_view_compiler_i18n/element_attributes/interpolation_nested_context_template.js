function MyComponent_div_0_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵelementStart(0, "div")(1, "div", 2);
	  $r3$.ɵɵpipe(2, "uppercase");
	  $r3$.ɵɵi18nAttributes(3, 0);
	  $r3$.ɵɵelementEnd()();
	}
	if (rf & 2) {
	  const $outer_r1$ = ctx.$implicit;
	  $r3$.ɵɵadvance();
	  $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(2, 1, $outer_r1$));
	  $r3$.ɵɵi18nApply(3);
	}
  }
  …
  decls: 1,
  vars: 1,
  consts: () => {
	__i18nMsg__('different scope {$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {original_code: {'interpolation': '{{ outer | uppercase }}'}}, {meaning: 'm', desc: 'd'})
	return [
	  ["title", $i18n_0$],
	  [__AttributeMarker.Template__, "ngFor", "ngForOf"],
	  [__AttributeMarker.I18n__, "title"]
	];
  },
  template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵtemplate(0, MyComponent_div_0_Template, 4, 3, "div", 1);
	}
	if (rf & 2) {
	  $r3$.ɵɵproperty("ngForOf", ctx.items);
	}
  }

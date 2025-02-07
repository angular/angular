consts: () => {
	__i18nMsg__('intro {$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {original_code: {'interpolation': '{% valueA | uppercase %}'}}, {meaning: 'm', desc: 'd'})
	return [
	  ["title", $i18n_0$],
	  [__AttributeMarker.I18n__, "title"]
	];
  },
  template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵelementStart(0, "div", 1);
	  $r3$.ɵɵpipe(1, "uppercase");
	  $r3$.ɵɵi18nAttributes(2, 0);
	  $r3$.ɵɵelementEnd();
	}
	if (rf & 2) {
	  $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(1, 1, ctx.valueA));
	  $r3$.ɵɵi18nApply(2);
	}
  }
  
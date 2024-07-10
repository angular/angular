consts: () => {
	__i18nMsg__('{$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {original_code: {'interpolation': '{{ attr }}'}}, {})
	__i18nMsg__('{$interpolation}{$startHeadingLevel1}{$closeHeadingLevel1}', [['closeHeadingLevel1', String.raw`\uFFFD/#2\uFFFD`], ['interpolation', String.raw`\uFFFD0\uFFFD`], ['startHeadingLevel1', String.raw`\uFFFD#2\uFFFD`]], {original_code: { 'closeHeadingLevel1': '</h1>', 'interpolation': '{{ text }}', 'startHeadingLevel1': '<h1 i18n-title title=\"{{ attr }}\">' }}, {})
	return [
	  $i18n_0$,
	  ["title", $i18n_1$],
	  [__AttributeMarker.I18n__, "title"]
	];
  },
  template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵelementStart(0, "div");
		i0.ɵɵi18nStart(1, 0);
		i0.ɵɵelementStart(2, "h1", 2);
		i0.ɵɵi18nAttributes(3, 1);
		i0.ɵɵelementEnd();
		i0.ɵɵi18nEnd();
		i0.ɵɵelementEnd();
	  }
	if (rf & 2) {
		i0.ɵɵadvance(2);
		i0.ɵɵi18nExp(ctx.attr);
		i0.ɵɵi18nApply(3);
		i0.ɵɵadvance();
		i0.ɵɵi18nExp(ctx.text);
		i0.ɵɵi18nApply(1);
	}
  }

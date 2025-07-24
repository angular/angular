consts: () => {
	__i18nMsg__('Element title', [], {}, {meaning: 'm', desc: 'd'})
	__i18nMsg__('Some content', [], {}, {})
	return [
	  $i18n_1$,
	  ["title", $i18n_0$]
	];
  },
  template: function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
	  $r3$.ɵɵelementStart(0, "div", 1);
	  $r3$.ɵɵi18n(1, 0);
	  $r3$.ɵɵelementEnd();
	}
  }
  
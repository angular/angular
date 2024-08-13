function MyComponent_div_0_span_1_Template(rf, ctx) {
	if (rf & 1) {
	  $i0$.ɵɵelementStart(0, "span");
	  $i0$.ɵɵtext(1);
	  $i0$.ɵɵelementEnd();
	}
	if (rf & 2) {
	  const $div$ = $i0$.ɵɵnextContext();
	  const $item$ = $div$.$implicit;
	  const $i$ = $div$.index;
	  $r3$.ɵɵadvance();
	  $i0$.ɵɵtextInterpolate2(" ", $i$, " - ", $item$, " ");
	}
  }

  function MyComponent_div_0_Template(rf, ctx) {
	if (rf & 1) {
	  $i0$.ɵɵelementStart(0, "div");
	  $i0$.ɵɵtemplate(1, MyComponent_div_0_span_1_Template, 2, 2, "span", 1);
	  $i0$.ɵɵelementEnd();
	}
	if (rf & 2) {
	  const $app$ = $i0$.ɵɵnextContext();
	  $r3$.ɵɵadvance();
	  $i0$.ɵɵproperty("ngIf", $app$.showing);
	}
  }

  …
  consts: [
	[__AttributeMarker.Template__, "ngFor", "ngForOf"],
	[__AttributeMarker.Template__, "ngIf"]
  ],
  template:function MyComponent_Template(rf, ctx){
	if (rf & 1) {
	  $i0$.ɵɵtemplate(0, MyComponent_div_0_Template, 2, 1, "div", 0);
	}
	if (rf & 2) {
	  $i0$.ɵɵproperty("ngForOf", ctx.items);
	}
  }

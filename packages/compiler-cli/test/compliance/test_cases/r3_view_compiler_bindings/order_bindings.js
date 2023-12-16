function MyCmp_HostBindings(rf, ctx) {
	if (rf & 2) {
		i0.ɵɵhostProperty("prop1", ctx.foo);
		i0.ɵɵattribute("attr1", ctx.foo);
		i0.ɵɵstyleMap(ctx.foo);
        i0.ɵɵclassMap(ctx.foo);
		i0.ɵɵstyleProp("style1", true);
		i0.ɵɵclassProp("class1", false);
	}
}

// ...

function MyCmp_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵelement(0, "some-elem", 0);
	} if (rf & 2) {
		i0.ɵɵstyleProp("style1", ctx.foo);
		i0.ɵɵclassProp("class1", ctx.foo);
		i0.ɵɵattributeInterpolate1("attrInterp1", "interp ", ctx.foo, "");
		i0.ɵɵpropertyInterpolate1("propInterp1", "interp ", ctx.foo, "");
		i0.ɵɵproperty("prop1", ctx.foo);
		i0.ɵɵattribute("attr1", ctx.foo);
	}
}
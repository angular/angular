hostAttrs: ["literal1", "foo"]
// ...
function MyCmp_HostBindings(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵlistener("event1", function MyCmp_event1_HostBindingHandler() { return ctx.foo(); });
	}
	if (rf & 2) {
		i0.ɵɵdomProperty("prop1", ctx.foo);
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
		i0.ɵɵelementStart(0, "some-elem", 0);
		i0.ɵɵlistener("event1", function MyCmp_Template_some_elem_event1_0_listener() {
			return ctx.foo();
		});
		i0.ɵɵelementEnd();
	} if (rf & 2) {
		i0.ɵɵstyleProp("style1", ctx.foo);
		i0.ɵɵclassProp("class1", ctx.foo);
		i0.ɵɵattributeInterpolate1("attrInterp1", "interp ", ctx.foo);
		i0.ɵɵpropertyInterpolate1("propInterp1", "interp ", ctx.foo);
		i0.ɵɵproperty("prop1", ctx.foo);
		i0.ɵɵattribute("attr1", ctx.foo);
	}
}
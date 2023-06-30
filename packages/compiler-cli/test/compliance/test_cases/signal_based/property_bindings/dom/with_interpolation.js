template: function LiteralValueBinding_Template(rf, ctx) {
    if (rf & 1) {
        i0.ɵɵelementStart(0, "button");
        i0.ɵɵpropertyCreate(1, "title", function () { return i0.ɵɵstringifyInterpolation`This is a ${"submit"} button`; });
        i0.ɵɵelementEnd();
    }
}

// ...

template: function FromContextBindingStatic_Template(rf, ctx) {
    if (rf & 1) {
        i0.ɵɵelementStart(0, "button");
        i0.ɵɵpropertyCreate(1, "title", function () { return i0.ɵɵstringifyInterpolation`This is a ${ctx.type} button`; });
        i0.ɵɵelementEnd();
    }
}

// ...

template: function FromContextBindingSignal_Template(rf, ctx) {
    if (rf & 1) {
        i0.ɵɵelementStart(0, "button");
        i0.ɵɵpropertyCreate(1, "title", function () { return i0.ɵɵstringifyInterpolation`This is a ${ctx.type()} button`; });
        i0.ɵɵelementEnd();
    }
}
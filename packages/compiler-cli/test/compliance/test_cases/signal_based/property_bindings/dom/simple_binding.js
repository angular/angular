template: function LiteralValueBinding_Template(rf, ctx) {
    if (rf & 1) {
        i0.ɵɵelementStart(0, "button", 0);
        i0.ɵɵpropertyCreate(1, "disabled", function () { return true; });
        i0.ɵɵelementEnd();
    }
}

// ...

template: function FromContextBindingStatic_Template(rf, ctx) {
    if (rf & 1) {
        i0.ɵɵelementStart(0, "button", 0);
        i0.ɵɵpropertyCreate(1, "disabled", function () { return ctx.isDisabled; });
        i0.ɵɵelementEnd();
    }
}

// ...

template: function FromContextBindingSignal_Template(rf, ctx) {
    if (rf & 1) {
        i0.ɵɵelementStart(0, "button", 0);
        i0.ɵɵpropertyCreate(1, "disabled", function () { return ctx.isDisabled(); });
        i0.ɵɵelementEnd();
    }
}
function MyComponent_div_2_Template(rf, ctx) {
    if (rf & 1) {
        i0.ɵɵi18nStart(0, 0, 1);
        i0.ɵɵelement(1, "div");
        i0.ɵɵi18nEnd();
    } if (rf & 2) {
        const diskView_r1 = ctx.$implicit;
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(diskView_r1.name)(diskView_r1.length);
        i0.ɵɵi18nApply(0);
    }
}
…
function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_div_2_Template, 2, 2, "div", 1);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵproperty("ngForOf", ctx.disks);
    }
}

function MyComponent_div_2_Template(rf, ctx) {
    if (rf & 1) {
        $r3$.ɵɵi18nStart(0, 0, 1);
        $r3$.ɵɵdomElement(1, "div");
        $r3$.ɵɵi18nEnd();
    } if (rf & 2) {
        const diskView_r1 = ctx.$implicit;
        $r3$.ɵɵadvance();
        $r3$.ɵɵi18nExp(diskView_r1.name)(diskView_r1.length);
        $r3$.ɵɵi18nApply(0);
    }
}
…
function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
        $r3$.ɵɵdomElementStart(0, "div");
        $r3$.ɵɵi18nStart(1, 0);
        $r3$.ɵɵdomTemplate(2, MyComponent_div_2_Template, 2, 2, "div", 1);
        $r3$.ɵɵi18nEnd();
        $r3$.ɵɵdomElementEnd();
    } if (rf & 2) {
        $r3$.ɵɵadvance(2);
        $r3$.ɵɵdomProperty("ngForOf", ctx.disks);
    }
}

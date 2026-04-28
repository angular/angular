if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate((ctx.x && ctx.y) ?? ctx.z);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx.x && (ctx.y ?? ctx.z));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx.x?.y ?? ctx.y?.z);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate((ctx.x?.y ?? ctx.y) || ctx.z);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate((ctx.x?.y ?? ctx.y) && ctx.z);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx.z || (ctx.x?.y ?? ctx.y));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx.z && (ctx.x?.y ?? ctx.y));
}

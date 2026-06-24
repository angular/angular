TestComp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
    …
    contentQueries: function TestComp_ContentQueries(rf, ctx, dirIndex) {
        if (rf & 1) {
            i0.ɵɵcontentQuerySignal(dirIndex, ctx.query3, _c0, 5);
            i0.ɵɵcontentQuerySignal(dirIndex, ctx.query4, _c1, 4);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(2);
        }
    },
    viewQuery: function TestComp_Query(rf, ctx) {
        if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.query1, _c2, 5);
            i0.ɵɵviewQuerySignal(ctx.query2, _c3, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(2);
        }
    },
    …
  });

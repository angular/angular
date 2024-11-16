const _c0 = ["locatorC"];
const _c1 = ["locatorD"];
const _c2 = ["locatorF", "locatorG"];
const _c3 = ["locatorA"];
const _c4 = ["locatorB"];
const _c5 = ["locatorE"];

…

TestDir.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
    …
    contentQueries: function TestDir_ContentQueries(rf, ctx, dirIndex) {
        if (rf & 1) {
            i0.ɵɵcontentQuerySignal(dirIndex, ctx.query3, _c0, 5);
            i0.ɵɵcontentQuerySignal(dirIndex, ctx.query4, _c1, 4);
            i0.ɵɵcontentQuerySignal(dirIndex, ctx.query8, _c2, 5);
            i0.ɵɵcontentQuerySignal(dirIndex, ctx.query9, nonAnalyzableRefersToString, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(4);
        }
    },
    viewQuery: function TestDir_Query(rf, ctx) {
        if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.query1, _c3, 5);
            i0.ɵɵviewQuerySignal(ctx.query2, _c4, 5);
            i0.ɵɵviewQuerySignal(ctx.query5, SomeToken, 5);
            i0.ɵɵviewQuerySignal(ctx.query6, SomeToken, 5);
            i0.ɵɵviewQuerySignal(ctx.query7, _c5, 5, SomeToken);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(5);
        }
    }
    …
  });

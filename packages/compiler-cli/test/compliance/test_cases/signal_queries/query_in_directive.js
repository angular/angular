const _c0 = ["locatorC"];
const _c1 = ["locatorD"];
const _c2 = ["locatorF", "locatorG"];
const _c3 = ["locatorA"];
const _c4 = ["locatorB"];
const _c5 = ["locatorE"];

…

export class TestDir {
  …
  static ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
    …
    contentQueries: function TestDir_ContentQueries(rf, ctx, dirIndex) {
        if (rf & 1) {
            $r3$.ɵɵcontentQuerySignal(dirIndex, ctx.query3, _c0, 5)(dirIndex, ctx.query4, _c1, 4)(dirIndex, ctx.query8, _c2, 5)(dirIndex, ctx.query9, nonAnalyzableRefersToString, 5);
        } if (rf & 2) {
            $r3$.ɵɵqueryAdvance(4);
        }
    },
    viewQuery: function TestDir_Query(rf, ctx) {
        if (rf & 1) {
            $r3$.ɵɵviewQuerySignal(ctx.query1, _c3, 5)(ctx.query2, _c4, 5)(ctx.query5, SomeToken, 5)(ctx.query6, SomeToken, 5)(ctx.query7, _c5, 5, SomeToken);
        } if (rf & 2) {
            $r3$.ɵɵqueryAdvance(5);
        }
    }
    …
  });
}

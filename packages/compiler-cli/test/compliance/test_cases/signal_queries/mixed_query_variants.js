TestDir.ɵdir = /* @__PURE__ */ $r3$.ɵɵdefineDirective({
  …
  contentQueries: function TestDir_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      i0.ɵɵcontentQuerySignal(dirIndex, ctx.signalContentChild, _c0, 5);
      i0.ɵɵcontentQuery(dirIndex, _c0, 5);
    } if (rf & 2) {
      i0.ɵɵqueryAdvance();
      let _t;
      i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.decoratorContentChild = _t.first);
    }
  },
  viewQuery: function TestDir_Query(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵviewQuerySignal(ctx.signalViewChild, _c1, 5);
      i0.ɵɵviewQuery(_c1, 5);
    } if (rf & 2) {
      i0.ɵɵqueryAdvance();
      let _t;
      i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.decoratorViewChild = _t.first);
    }
  }
  …
});

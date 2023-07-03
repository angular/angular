const _c0 = ["buttons"];
// ...
viewQuery: function SimpleViewChildrenWithName_Query(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵviewQueryCreate(ctx.buttonEls, _c0, 5);
  }
}

// ...
viewQuery: function SimpleViewChildrenWithType_Query(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵviewQueryCreate(ctx.buttonEls, ButtonComp, 5);
    }
  }
  
const _c0 = ["button"];
// ...
viewQuery: function SimpleViewChildWithName_Query(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵviewQueryCreate(ctx.buttonEl, _c0, 5);
  }
}

// ...
viewQuery: function SimpleViewChildWithType_Query(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵviewQueryCreate(ctx.buttonEl, ButtonComp, 5);
    }
  }
  
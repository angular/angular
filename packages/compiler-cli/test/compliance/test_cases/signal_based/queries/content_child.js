const _c0 = ["button"];
// ...
contentQueries:
    function SimpleContentChildWithName_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        i0.ɵɵcontentQueryCreate(ctx.buttonEl, dirIndex, _c0, 5);
      }
    }

// ...
contentQueries: function SimpleContentChildWithType_ContentQueries(rf, ctx, dirIndex) {
  if (rf & 1) {
    i0.ɵɵcontentQueryCreate(ctx.buttonComp, dirIndex, ButtonComp, 5);
  }
}

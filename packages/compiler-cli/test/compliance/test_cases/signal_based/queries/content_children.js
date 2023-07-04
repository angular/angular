const _c0 = ["button"];
// ...
contentQueries:
    function SimpleContentChildrenWithName_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        i0.ɵɵcontentQueryCreate(ctx.buttonEls, dirIndex, _c0, 4);
      }
    }

// ...
contentQueries: function SimpleContentChildrenWithType_ContentQueries(rf, ctx, dirIndex) {
  if (rf & 1) {
    i0.ɵɵcontentQueryCreate(ctx.buttonComps, dirIndex, ButtonComp, 4);
  }
}

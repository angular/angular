const $_c0$ = function (a0, a1) { return { collapsedHeight: a0, expandedHeight: a1 }; };
const $_c1$ = function (a0, a1) { return { value: a0, params: a1 }; };
const $_c2$ = function (a0, a1) { return { collapsedWidth: a0, expandedWidth: a1 }; };
…
hostVars: 14,
hostBindings: function MyComponent_HostBindings(rf, ctx) {
  if (rf & 2) {
    $r3$.ɵɵsyntheticHostProperty("@expansionHeight",
        $r3$.ɵɵpureFunction2(5, $_c1$, ctx.getExpandedState(),
          $r3$.ɵɵpureFunction2(2, $_c0$, ctx.collapsedHeight, ctx.expandedHeight)
        )
    )("@expansionWidth",
        $r3$.ɵɵpureFunction2(11, $_c1$, ctx.getExpandedState(),
          $r3$.ɵɵpureFunction2(8, $_c2$, ctx.collapsedWidth, ctx.expandedWidth)
        )
    );
  }
},
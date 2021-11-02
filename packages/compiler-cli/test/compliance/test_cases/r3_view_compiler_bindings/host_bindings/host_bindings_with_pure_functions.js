
const $ff$ = function ($v$) { return ["red", $v$]; };
…
HostBindingComp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: HostBindingComp,
  selectors: [["host-binding-comp"]],
  hostVars: 3,
  hostBindings: function HostBindingComp_HostBindings(rf, ctx) {
    if (rf & 2) {
      $r3$.ɵɵhostProperty("id", $r3$.ɵɵpureFunction1(1, $ff$, ctx.id));
    }
  },
  decls: 0,
  vars: 0,
  template: function HostBindingComp_Template(rf, ctx) {},
  encapsulation: 2
});

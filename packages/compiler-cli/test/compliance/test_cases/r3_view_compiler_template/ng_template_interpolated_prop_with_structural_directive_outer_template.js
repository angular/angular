consts: [[4, "ngIf"], [3, "dir"]],
template: function TestComp_Template(rf, ctx) {
  if (rf & 1) {
    $i0$.ɵɵtemplate(0, $TestComp_0_Template$, 1, 1, undefined, 0);
  }
  if (rf & 2) {
    $i0$.ɵɵproperty("ngIf", true);
  }
},

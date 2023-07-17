// ...
  decls: 1,
  vars: 3,
  template: function MyComponentWithInterpolation_Template(rf, $ctx$) {
    if (rf & 1) {
      $r3$.ɵɵelement(0, "div");
    }
    if (rf & 2) {
      $r3$.ɵɵclassMapInterpolate1("foo foo-", $ctx$.fooId, "");
    }
  }
// ...
  decls: 1,
  vars: 4,
  template: function MyComponentWithMuchosInterpolation_Template(rf, $ctx$) {
    if (rf & 1) {
      $r3$.ɵɵelement(0, "div");
    }
    if (rf & 2) {
      $r3$.ɵɵclassMapInterpolate2("foo foo-", $ctx$.fooId, "-", $ctx$.fooUsername, "");
    }
  }
// ...
  decls: 1,
  vars: 2,
  template: function MyComponentWithoutInterpolation_Template(rf, $ctx$) {
    if (rf & 1) {
      $r3$.ɵɵelement(0, "div");
    }
    if (rf & 2) {
      $r3$.ɵɵclassMap($ctx$.exp);
    }
  }

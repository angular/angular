function MyComponent_0_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, "Content");
  }
}
function MyComponent_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomTemplate(0, MyComponent_0_ng_template_0_Template, 1, 0, "ng-template");
  }
}
…
decls: 1,
vars: 1,
consts: [[4, "ngIf"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomTemplate(0, MyComponent_0_Template, 1, 0, null, 0);
  }
  if (rf & 2) {
    $r3$.ɵɵdomProperty("ngIf", true);
  }
}

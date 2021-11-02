// NOTE: the c0 and c1 constants aren't being used in this particular test,
// NOTE: but they are used in some of the logic that is folded under the ellipsis.
const $_c0$ = [[["", "title", ""]]];
const $_c1$ = ["[title]"];
// ...
MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyApp,
  selectors: [["my-app"]],
  decls: 2,
  vars: 0,
  consts: [["ngProjectAs", "[title],[header]", 5, ["", "title", ""]]],
  template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
          $r3$.ɵɵelementStart(0, "simple");
          $r3$.ɵɵelement(1, "h1", 0);
          $r3$.ɵɵelementEnd();
      }
  },
  directives: [SimpleComponent],
  encapsulation: 2
})

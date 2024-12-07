const $_c0$ = [[["", "title", ""]]];
const $_c1$ = ["[title]"];
// ...
MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyApp,
  selectors: [["my-app"]],
  standalone: false,
  decls: 2,
  vars: 0,
  consts: [["ngProjectAs", "[title]", 5, ["", "title", ""]]],
  template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
          $r3$.ɵɵelementStart(0, "simple");
          $r3$.ɵɵelement(1, "h1", 0);
          $r3$.ɵɵelementEnd();
      }
  },
  dependencies: [SimpleComponent],
  encapsulation: 2
})

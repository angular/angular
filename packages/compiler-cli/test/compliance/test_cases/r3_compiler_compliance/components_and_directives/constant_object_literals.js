const $c0$ = () => ({});
const $c1$ = () => ({ a: 1, b: 2 });
// ...
MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyApp,
  selectors: [["ng-component"]],
  standalone: false,
  decls: 1,
  vars: 4,
  consts: [[__AttributeMarker.Bindings__, "prop", "otherProp"]],
  template:  function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelement(0, "some-comp", 0);
    }
    if (rf & 2) {
      $r3$.ɵɵproperty("prop", $r3$.ɵɵpureFunction0(2, $c0$))("otherProp", $r3$.ɵɵpureFunction0(3, $c1$));
    }
  },
  dependencies: [SomeComp],
  encapsulation: 2
});

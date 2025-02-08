MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyComponent,
  selectors: [["my-component"]],
  standalone: false,
  decls: 1,
  vars: 2,
  template:  function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelement(0, "div");
    }
    if (rf & 2) {
      $r3$.ɵɵstyleProp("background-image", ctx.myImage);
    }
  },
  encapsulation: 2
});

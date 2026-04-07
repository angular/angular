export class MyComponent {
  // ...
  static ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 3,
    vars: 0,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        $r3$.ɵɵdomElementStart(0, "div")(1, "p");
        $r3$.ɵɵanimateEnter(function MyComponent_Template_animateenter_cb() { return ctx.enterClass(); });
        $r3$.ɵɵtext(2, "Sliding Content");
        $r3$.ɵɵdomElementEnd()();
      }
    },
    encapsulation: 2
  });
}


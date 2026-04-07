export class MyComponent {
  …
  fadeFn(event) {
      event.target.classList.add('fade-out');
  }
  …
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MyComponent)(); };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 3, vars: 2, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div")(1, "p");
        i0.ɵɵtext(2, "Fading Content");
        i0.ɵɵdomElementEnd()();
    } if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵanimateLeave(ctx.fadeFn);
    } }, encapsulation: 2 });
}

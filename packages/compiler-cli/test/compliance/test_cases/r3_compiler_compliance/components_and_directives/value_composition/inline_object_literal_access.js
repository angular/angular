const $c0$ = () => ({ one: "Hello", two: "Hola" });

…

$r3$.ɵɵdefineComponent({
  …
  decls: 1,
  vars: 2,
  consts: [[3, "title"]],
  template: function Greeting_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdomElement(0, "span", 0);
    } if (rf & 2) {
      $r3$.ɵɵdomProperty("title", $r3$.ɵɵpureFunction0(1, $c0$)[ctx.type()]);
    }
  },
  …
});

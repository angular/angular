const $_c0$ = ["min", "max", "minLength", "maxLength"];
// ...
export class MyComponent {
  // ...
  static ɵcmp = /* @__PURE__ */i0.ɵɵdefineComponent({
    // ...
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "range-control", 0);
        i0.ɵɵcontrolCreate($_c0$);
        i0.ɵɵtwoWayListener("maxChange", function MyComponent_Template_range_control_maxChange_0_listener($event) {
          i0.ɵɵtwoWayBindingSet(ctx.maximum, $event) || (ctx.maximum = $event);
          return $event;
        });
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(1, "range-control", 1);
        i0.ɵɵcontrolCreate();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty("minLength", i0.ɵɵinterpolate(ctx.length))("formField", ctx.field)("min", ctx.minimum);
        i0.ɵɵtwoWayProperty("max", ctx.maximum);
        i0.ɵɵproperty("maxLength", ctx.length);
        i0.ɵɵcontrol();
        i0.ɵɵadvance();
        i0.ɵɵproperty("formField", ctx.field);
        i0.ɵɵattribute("max", 10);
        i0.ɵɵcontrol();
      }
    },
    // ...
  });
}

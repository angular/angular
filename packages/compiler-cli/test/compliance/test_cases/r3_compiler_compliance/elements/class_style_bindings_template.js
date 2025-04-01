MyComponent.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({type:MyComponent,selectors:[["my-component"]],
standalone: false,
decls: 1,
vars: 4,
template: function MyComponent_Template(rf,ctx){
  if (rf & 1) {
    $r3$.ɵɵelement(0, "div");
  }
  if (rf & 2) {
    $r3$.ɵɵstyleProp("background-color", ctx.color);
    $r3$.ɵɵclassProp("error", ctx.error);
  }
},
encapsulation: 2
});

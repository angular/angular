 // NOTE: It *does* mangle the camel case property in the consts array. This was pre-existing TDB behavior, but should be fixed. 
 consts: [[2, "--camel-case", "foo", "--kebab-case", "foo"]],
 template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "div", 0);
  } if (rf & 2) {
    i0.ɵɵstyleProp("--camelCase", ctx.value)("--kebab-case", ctx.value);
  }
}

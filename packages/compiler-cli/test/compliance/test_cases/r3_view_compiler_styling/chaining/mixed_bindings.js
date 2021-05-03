// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  // ...
  template: function MyComponent_Template(rf, $ctx$) {
    // ...
    if (rf & 2) {
      $r3$.ɵɵstyleProp("color", $ctx$.color)("border", $ctx$.border)("transition", $ctx$.transition);
      $r3$.ɵɵclassProp("apple", $ctx$.yesToApple)("orange", $ctx$.yesToOrange)("tomato", $ctx$.yesToTomato);
    }
  },
  encapsulation: 2
});

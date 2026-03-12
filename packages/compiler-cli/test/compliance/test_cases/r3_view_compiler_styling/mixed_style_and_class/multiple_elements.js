// ...
template: function MyComponent_Template(rf, $ctx$) {
  // ...
  if (rf & 2) {
    $r3$.ɵɵstyleProp("width", $ctx$.w1);
    $r3$.ɵɵadvance();
    $r3$.ɵɵstyleProp("height", $ctx$.h1);
    $r3$.ɵɵadvance();
    $r3$.ɵɵclassProp("active", $ctx$.a1);
    $r3$.ɵɵadvance();
    $r3$.ɵɵclassProp("removed", $ctx$.r1);
  }
}

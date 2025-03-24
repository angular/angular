
template:function MyComponent_Template(rf, $ctx$){
  if (rf & 1) {
    $i0$.ɵɵelementStart(0, "div");
    $i0$.ɵɵtext(1);
    $i0$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance();
    $i0$.ɵɵtextInterpolate1("Hello ", $ctx$.name);
  }
}

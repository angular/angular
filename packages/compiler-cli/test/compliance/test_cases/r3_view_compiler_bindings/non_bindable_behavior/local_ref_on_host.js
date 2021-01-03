consts: [["id", "my-id"], ["myRef", ""]],
template:function MyComponent_Template(rf, $ctx$){
  if (rf & 1) {
    $i0$.ɵɵelementStart(0, "b", 0, 1);
    $i0$.ɵɵdisableBindings();
    $i0$.ɵɵelementStart(2, "i");
    $i0$.ɵɵtext(3, "Hello {{ name }}!");
    $i0$.ɵɵelementEnd();
    $i0$.ɵɵenableBindings();
    $i0$.ɵɵelementEnd();
    $i0$.ɵɵtext(4);
  }
  if (rf & 2) {
    const $_r0$ = $i0$.ɵɵreference(1);
    $r3$.ɵɵadvance(4);
    $i0$.ɵɵtextInterpolate1(" ", $_r0$.id, " ");
  }
}

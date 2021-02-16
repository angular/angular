consts: [["value", "one", "#myInput", ""]],
template:function MyComponent_Template(rf, $ctx$){
  if (rf & 1) {
    $i0$.ɵɵelementStart(0, "div");
    $i0$.ɵɵdisableBindings();
    $i0$.ɵɵelement(1, "input", 0);
    $i0$.ɵɵtext(2, " {{ myInput.value }} ");
    $i0$.ɵɵenableBindings();
    $i0$.ɵɵelementEnd();
}

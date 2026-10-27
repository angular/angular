function MyApp_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵnamespaceSVG();
    $r3$.ɵɵdomElement(0, "svg", 0);
  }
}
…
function MyApp_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵnamespaceMathML();
    $r3$.ɵɵdomElement(0, "math", 1);
  }
}
…
$r3$.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 1, 0, "svg", 0)(1, MyApp_Conditional_1_Template, 1, 0, "math", 1);

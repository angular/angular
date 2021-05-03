// NOTE: AttributeMarker.Classes = 1
consts: [["title", "Hello", 1, "my-app"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div", 0);
    $r3$.ɵɵnamespaceMathML();
    $r3$.ɵɵelementStart(1, "math");
    $r3$.ɵɵelement(2, "infinity");
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵnamespaceHTML();
    $r3$.ɵɵelementStart(3, "p");
    $r3$.ɵɵtext(4, "test");
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementEnd();
  }
}
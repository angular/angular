
…
consts: [[__AttributeMarker.Bindings__, "title"]],
template:function MyComponent_Template(rf, $ctx$){
  if (rf & 1) {
    $i0$.ɵɵelement(0, "a", 0);
  }
  if (rf & 2) {
    $i0$.ɵɵproperty("title", $r3$.ɵɵinterpolate1("Hello ", $ctx$.name));
  }
}
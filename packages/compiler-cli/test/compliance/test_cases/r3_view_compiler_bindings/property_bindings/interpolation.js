
…
consts: [[__AttributeMarker.Bindings__, "title"]],
template:function MyComponent_Template(rf, $ctx$){
  if (rf & 1) {
    $i0$.ɵɵelement(0, "a", 0);
  }
  if (rf & 2) {
    $i0$.ɵɵpropertyInterpolate1("title", "Hello ", $ctx$.name, "");
  }
}
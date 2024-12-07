// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
    type: MyComponent,
    selectors:[["my-component"]],
    standalone: false,
    decls: 1,
    vars: 7,
    consts: [[__AttributeMarker.Classes__, "grape"]],
    template:  function MyComponent_Template(rf, $ctx$) {
      if (rf & 1) {
        $r3$.ɵɵelement(0, "div", 0);
      }
      if (rf & 2) {
        $r3$.ɵɵclassMap($ctx$.myClassExp);
        $r3$.ɵɵclassProp("apple", $ctx$.yesToApple)("orange", $ctx$.yesToOrange);
        $r3$.ɵɵattribute("class", "banana");
      }
    },
    encapsulation: 2
  });

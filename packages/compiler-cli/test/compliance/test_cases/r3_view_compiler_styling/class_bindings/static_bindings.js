// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
    type: MyComponent,
    selectors:[["my-component"]],
    decls: 1,
    vars: 2,
    consts: [[__AttributeMarker.Classes__, "foo", __AttributeMarker.Styles__, "width", "100px"]],
    template:  function MyComponent_Template(rf, $ctx$) {
      if (rf & 1) {
        $r3$.ɵɵelement(0, "div", 0);
      }
      if (rf & 2) {
        $r3$.ɵɵattribute("class", "round")("style", "height:100px", $r3$.ɵɵsanitizeStyle);
      }
    },
    encapsulation: 2
  });

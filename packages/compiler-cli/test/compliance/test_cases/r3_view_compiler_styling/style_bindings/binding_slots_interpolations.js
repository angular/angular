// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
    type: MyComponent,
    selectors:[["my-component"]],
    standalone: false,
    decls: 1,
    vars: 7,
    consts: [[__AttributeMarker.Styles__, "opacity", "1"]],
    template:  function MyComponent_Template(rf, $ctx$) {
      if (rf & 1) {
        $r3$.ɵɵelement(0, "div", 0);
      }
      if (rf & 2) {
        $r3$.ɵɵstyleMap($ctx$.myStyleExp);
        $r3$.ɵɵstyleProp("width", $ctx$.myWidth)("height", $ctx$.myHeight);
        $r3$.ɵɵattribute("style", "border-width: 10px", $r3$.ɵɵsanitizeStyle);
      }
    },
    encapsulation: 2
  });

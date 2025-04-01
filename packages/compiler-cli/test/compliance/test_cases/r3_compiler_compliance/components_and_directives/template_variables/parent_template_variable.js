function MyComponent_li_1_li_4_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "li");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $info$ = ctx.$implicit;
    const $item$ = $r3$.ɵɵnextContext().$implicit;
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate2(" ", $item$.name, ": ", $info$.description, " ");
  }
}

function MyComponent_li_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "li")(1, "div");
    $r3$.ɵɵtext(2);
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(3, "ul");
    $r3$.ɵɵtemplate(4, MyComponent_li_1_li_4_Template, 2, 2, "li", 0);
    $r3$.ɵɵelementEnd()();
  }
  if (rf & 2) {
    const $item$ = ctx.$implicit;
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵtextInterpolate(IDENT.name);
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵproperty("forOf", IDENT.infos);
  }
}

// ...
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyComponent,
  selectors: [["my-component"]],
  standalone: false,
  decls: 2,
  vars: 1,
  consts: [[__AttributeMarker.Template__, "for", "forOf"]],
  template:  function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelementStart(0, "ul");
      $r3$.ɵɵtemplate(1, MyComponent_li_1_Template, 5, 2, "li", 0);
      $r3$.ɵɵelementEnd();
    }
    if (rf & 2) {
      $r3$.ɵɵadvance();
      $r3$.ɵɵproperty("forOf", ctx.items);
    }
  },
  dependencies: () => [ForOfDirective],
  encapsulation: 2
});

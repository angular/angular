MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyComponent,
  selectors: [
    ["my-component"]
  ],
  features: [$r3$.ɵɵHostDirectivesFeature(function () {
    return [DirectiveB];
  })],
  decls: 0,
  vars: 0,
  template: function MyComponent_Template(rf, ctx) {},
  encapsulation: 2
});…
DirectiveB.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
  type: DirectiveB,
  standalone: true,
  features: [$r3$.ɵɵHostDirectivesFeature(function () {
    return [{
      directive: DirectiveA,
      inputs: ["value", "value"]
    }];
  })]
});…
DirectiveA.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
  type: DirectiveA,
  inputs: {
    value: "value"
  },
  standalone: true
});

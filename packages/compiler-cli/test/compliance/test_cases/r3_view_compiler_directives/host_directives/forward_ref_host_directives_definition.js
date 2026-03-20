export class MyComponent {
  …
  static ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [
      ["my-component"]
    ],
      standalone: false,
      features: [$r3$.ɵɵHostDirectivesFeature(function () {
      return [DirectiveB];
    })],
    decls: 0,
    vars: 0,
    template: function MyComponent_Template(rf, ctx) {},
    encapsulation: 2
  });
}
…
export class DirectiveB {
  …
  static ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
    type: DirectiveB,
      features: [$r3$.ɵɵHostDirectivesFeature(function () {
      return [{
        directive: DirectiveA,
        inputs: ["value", "value"]
      }];
    })]
  });
}
…
export class DirectiveA {
  …
  static ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
    type: DirectiveA,
    inputs: {
      value: "value"
    }
  });
}

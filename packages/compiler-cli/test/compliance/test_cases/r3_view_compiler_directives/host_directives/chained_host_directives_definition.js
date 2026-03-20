export class DirectiveA {
  // ...
  static ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
    type: DirectiveA
  });
}
// ...
export class DirectiveB {
  // ...
  static ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
    type: DirectiveB,
    features: [$r3$.ɵɵHostDirectivesFeature([DirectiveA])]
  });
}
// ...
export class DirectiveC {
  // ...
  static ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
    type: DirectiveC,
    features: [$r3$.ɵɵHostDirectivesFeature([DirectiveB])]
  });
}
// ...
export class MyComponent {
  // ...
  static ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [
      ["my-component"]
    ],
    standalone: false,
    features: [$r3$.ɵɵHostDirectivesFeature([DirectiveC])],
    decls: 0,
    vars: 0,
    template: function MyComponent_Template(rf, ctx) {},
    encapsulation: 2
  });
}


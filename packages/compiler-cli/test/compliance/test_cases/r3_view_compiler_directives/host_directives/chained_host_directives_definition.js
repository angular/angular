DirectiveA.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
  type: DirectiveA,
  standalone: true
});…
DirectiveB.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
  type: DirectiveB,
  standalone: true,
  features: [$r3$.ɵɵHostDirectivesFeature([DirectiveA])]
});…
DirectiveC.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
  type: DirectiveC,
  standalone: true,
  features: [$r3$.ɵɵHostDirectivesFeature([DirectiveB])]
});…
MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyComponent,
  selectors: [
    ["my-component"]
  ],
  features: [$r3$.ɵɵHostDirectivesFeature([DirectiveC])],
  decls: 0,
  vars: 0,
  template: function MyComponent_Template(rf, ctx) {},
  encapsulation: 2
});

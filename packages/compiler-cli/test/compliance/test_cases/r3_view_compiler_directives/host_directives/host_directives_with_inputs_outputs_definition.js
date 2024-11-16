MyComponent.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: MyComponent,
  selectors: [
    ["my-component"]
  ],
  standalone: false,
  features: [$r3$.ɵɵHostDirectivesFeature([{
    directive: HostDir,
    inputs: ["value", "value", "color", "colorAlias"],
    outputs: ["opened", "opened", "closed", "closedAlias"]
  }])],
  decls: 0,
  vars: 0,
  template: function MyComponent_Template(rf, ctx) {},
  encapsulation: 2
});

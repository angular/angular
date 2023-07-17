
HostAttributeComp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  type: HostAttributeComp,
  selectors: [["my-host-attribute-component"]],
  hostAttrs: ["title", "hello there from component", __AttributeMarker.Styles__, "opacity", "1"],
…
HostAttributeDir.ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
  type: HostAttributeDir,
  selectors: [["", "hostAttributeDir", ""]],
  hostAttrs: ["title", "hello there from directive", __AttributeMarker.Classes__, "one", "two", __AttributeMarker.Styles__, "width", "200px", "height", "500px"],
  hostVars: 4,
  hostBindings: function HostAttributeDir_HostBindings(rf, ctx) {
    …
  }

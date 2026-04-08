export class HostBindingDir {
  // ...
  static ɵdir = /*@__PURE__*/ $r3$.ɵɵdefineDirective({
    type: HostBindingDir,
    selectors: [["", "hostBindingDir", ""]],
      hostVars: 1,
      hostBindings: function HostBindingDir_HostBindings(rf, ctx) {
        if (rf & 2) {
          i0.ɵɵdomProperty("id", ctx.getData()?.id);
        }
      },
    standalone: false
  });
}

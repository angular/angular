MyDir.ɵfac = …;
MyDir.ɵdir = …;
__decorate([
  CustomPropDecorator(),
  __metadata("design:type", String)
], MyDir.prototype, "custom", void 0);
__decorate([
  CustomPropDecorator(),
  __metadata("design:type", String)
], MyDir.prototype, "mixed", void 0);
(function () {
  (typeof ngDevMode === "undefined" || ngDevMode) && $i0$.ɵsetClassMetadata(MyDir, [{
    type: Directive
  }], null, {
    foo: [{
      type: Input
    }], bar: [{
      type: Input,
      args: ['baz']
    }], custom: [], mixed: [{
      type: Input
    }, {
      type: Output
    }]
  });
})();

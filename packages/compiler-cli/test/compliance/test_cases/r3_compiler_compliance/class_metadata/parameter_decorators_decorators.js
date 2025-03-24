ParameterizedInjectable.ɵfac = …;
ParameterizedInjectable.ɵprov = …;
ParameterizedInjectable = __decorate([
  __param(2, CustomParamDecorator()),
  __param(3, CustomParamDecorator()),
  __metadata("design:paramtypes", [Service, String, Service, String])
], ParameterizedInjectable);
…
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ParameterizedInjectable, [{
    type: Injectable
  }], () => [{ type: Service }, {
      type: undefined, decorators: [{
        type: Inject,
        args: [TOKEN]
      }]
    }, { type: Service, decorators: [] }, {
      type: undefined, decorators: [{
        type: Inject,
        args: [TOKEN]
      }, {
        type: SkipSelf
      }]
    }], null);
})();

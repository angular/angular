ParamerizedInjectable.ɵfac = …;
ParamerizedInjectable.ɵprov = …;
ParamerizedInjectable = __decorate([
  __param(2, CustomParamDecorator()),
  __param(3, CustomParamDecorator()),
  __metadata("design:paramtypes", [Service, String, Service, String])
], ParamerizedInjectable);
export {ParamerizedInjectable};
(function () {
  (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ParamerizedInjectable, [{
    type: Injectable
  }], function () {
    return [{type: Service}, {
      type: undefined, decorators: [{
        type: Inject,
        args: [TOKEN]
      }]
    }, {type: Service, decorators: []}, {
      type: undefined, decorators: [{
        type: Inject,
        args: [TOKEN]
      }, {
        type: SkipSelf
      }]
    }];
  }, null);
})();

BasicInjectable.ɵfac = …;
BasicInjectable.ɵprov = …;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $i0$.ɵsetClassMetadata(BasicInjectable, [{
    type: Injectable
  }], null, null);
})();

…

RootInjectable.ɵfac = …;
RootInjectable.ɵprov = …;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $i0$.ɵsetClassMetadata(RootInjectable, [{
    type: Injectable,
    args: [{providedIn: 'root'}]
  }], null, null);
})();

…

CustomInjectable.ɵfac = …;
CustomInjectable.ɵprov = …;
CustomInjectable = __decorate([
  CustomClassDecorator()
], CustomInjectable);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $i0$.ɵsetClassMetadata(CustomInjectable, [{
    type: Injectable
  }], null, null);
})();

…

ComponentWithExternalResource.ɵfac = …;
ComponentWithExternalResource.ɵcmp = …;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $i0$.ɵsetClassMetadata(ComponentWithExternalResource, [{
    type: Component,
    args: [{
      selector: 'test-cmp',
      template: "<span>Test template</span>\n"
    }]
  }], null, null);
})();

export function provideModule() {
    return { ngModule: ForwardModule };
}
…
class TestModule {}
TestModule.ɵfac = function TestModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TestModule)(); };
TestModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: TestModule, imports: function () { return [ForwardModule]; } });
TestModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [provideModule()] });
export { TestModule };
…
class ForwardModule {}
ForwardModule.ɵfac = function ForwardModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ForwardModule)(); };
ForwardModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ForwardModule });
ForwardModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
export { ForwardModule };

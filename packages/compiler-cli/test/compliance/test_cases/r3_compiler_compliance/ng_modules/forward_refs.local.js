export function provideModule() {
    return { ngModule: ForwardModule };
}
…
class TestModule {}
TestModule.ɵfac = function TestModule_Factory(ɵt) { return new (ɵt || TestModule)(); };
TestModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: TestModule, imports: function () { return [ForwardModule]; } });
TestModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [provideModule()] });
export { TestModule };
…
class ForwardModule {}
ForwardModule.ɵfac = function ForwardModule_Factory(ɵt) { return new (ɵt || ForwardModule)(); };
ForwardModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ForwardModule });
ForwardModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
export { ForwardModule };

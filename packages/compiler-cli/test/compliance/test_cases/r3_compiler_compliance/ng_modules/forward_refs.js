export function provideModule() {
    return { ngModule: ForwardModule };
}
…
export class TestModule {}
TestModule.ɵfac = function TestModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TestModule)(); };
TestModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: TestModule, imports: () => [ForwardModule] });
TestModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [provideModule()] });
…
export class ForwardModule {}
ForwardModule.ɵfac = function ForwardModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ForwardModule)(); };
ForwardModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ForwardModule });
ForwardModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});

import * as i0 from "@angular/core";
export declare class NotStandaloneDir {
    static ɵfac: i0.ɵɵFactoryDeclaration<NotStandaloneDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NotStandaloneDir, "[not-standalone]", never, {}, {}, never, never, false, never>;
}
export declare class NotStandalonePipe {
    transform(value: any): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<NotStandalonePipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<NotStandalonePipe, "nspipe", false>;
}
export declare class NotStandaloneStuffModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<NotStandaloneStuffModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<NotStandaloneStuffModule, never, never, [typeof NotStandaloneDir, typeof NotStandalonePipe]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<NotStandaloneStuffModule>;
}
export declare class IndirectDir {
    static ɵfac: i0.ɵɵFactoryDeclaration<IndirectDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IndirectDir, "[indirect]", never, {}, {}, never, never, true, never>;
}
export declare class IndirectPipe {
    transform(value: any): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<IndirectPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<IndirectPipe, "indirectpipe", true>;
}
export declare class SomeModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<SomeModule, never, [typeof IndirectDir, typeof IndirectPipe], [typeof NotStandaloneStuffModule, typeof IndirectDir, typeof IndirectPipe]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<SomeModule>;
}
export declare class DirectDir {
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DirectDir, "[direct]", never, {}, {}, never, never, true, never>;
}
export declare class DirectPipe {
    transform(value: any): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<DirectPipe, "directpipe", true>;
}
export declare class TestCmp {
    data: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, true, never>;
}


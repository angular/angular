import { QueryList } from '@angular/core';
import * as i0 from "@angular/core";
export declare class ContentQueryComponent {
    someDir: SomeDirective;
    someDirList: QueryList<SomeDirective>;
    static ɵfac: i0.ɵɵFactoryDeclaration<ContentQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ContentQueryComponent, "content-query-component", never, {}, {}, ["someDir", "someDirList"], ["*"], false, never>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[someDir]", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}


import { ElementRef, QueryList, TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
export declare class ContentQueryComponent {
    myRef: TemplateRef<unknown>;
    myRefs: QueryList<ElementRef>;
    someDir: ElementRef;
    someDirs: QueryList<TemplateRef<unknown>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<ContentQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ContentQueryComponent, "content-query-component", never, {}, {}, ["myRef", "someDir", "myRefs", "someDirs"], never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}


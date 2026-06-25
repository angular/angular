import * as i0 from "@angular/core";
export declare class AsyncPipe {
    transform(v: any): null | any;
    static ɵfac: i0.ɵɵFactoryDeclaration<AsyncPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<AsyncPipe, "async", false>;
}
export declare class MyComponent {
    myTitle: string;
    auth: () => {
        identity(): any;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class MyMod {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyMod, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyMod, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyMod>;
}


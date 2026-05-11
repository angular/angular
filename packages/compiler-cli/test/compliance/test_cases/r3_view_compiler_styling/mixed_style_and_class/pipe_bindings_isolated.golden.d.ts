import * as i0 from "@angular/core";
export declare class StylePipe {
    transform(v: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<StylePipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<StylePipe, "stylePipe", false>;
}
export declare class ClassPipe {
    transform(v: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ClassPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<ClassPipe, "classPipe", false>;
}
export declare class MyComponent {
    myStyleExp: ({
        color: string;
        duration?: undefined;
    } | {
        color: string;
        duration: number;
    })[];
    myClassExp: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}


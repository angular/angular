import * as i0 from "@angular/core";
export declare class MyApp {
    person?: {
        getName: (includeTitle: boolean | undefined) => string;
    };
    config: {
        get: (name: string) => {
            enabled: boolean;
        } | undefined;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}


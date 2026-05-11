import * as i0 from "@angular/core";
export declare class LifecycleComp {
    nameMin: string;
    ngOnChanges(): void;
    ngOnInit(): void;
    ngDoCheck(): void;
    ngAfterContentInit(): void;
    ngAfterContentChecked(): void;
    ngAfterViewInit(): void;
    ngAfterViewChecked(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<LifecycleComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LifecycleComp, "lifecycle-comp", never, { "nameMin": { "alias": "name"; "required": false; }; }, {}, never, never, false, never>;
}
export declare class SimpleLayout {
    name1: string;
    name2: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<SimpleLayout, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SimpleLayout, "simple-layout", never, {}, {}, never, never, false, never>;
}
export declare class LifecycleModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<LifecycleModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<LifecycleModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<LifecycleModule>;
}


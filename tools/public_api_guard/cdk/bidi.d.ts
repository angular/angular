export declare class BidiModule {
    static ɵinj: i0.ɵɵInjectorDef<BidiModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<BidiModule, [typeof i1.Dir], never, [typeof i1.Dir]>;
}

export declare class Dir implements Directionality, AfterContentInit, OnDestroy {
    _rawDir: string;
    change: EventEmitter<Direction>;
    dir: Direction;
    readonly value: Direction;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<Dir, "[dir]", ["dir"], { 'dir': "dir" }, { 'change': "dirChange" }, never>;
    static ɵfac: i0.ɵɵFactoryDef<Dir>;
}

export declare const DIR_DOCUMENT: InjectionToken<Document>;

export declare type Direction = 'ltr' | 'rtl';

export declare class Directionality implements OnDestroy {
    readonly change: EventEmitter<Direction>;
    readonly value: Direction;
    constructor(_document?: any);
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDef<Directionality>;
    static ɵprov: i0.ɵɵInjectableDef<Directionality>;
}

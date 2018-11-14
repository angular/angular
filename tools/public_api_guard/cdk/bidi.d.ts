export declare class BidiModule {
}

export declare class Dir implements Directionality, AfterContentInit, OnDestroy {
    _rawDir: string;
    change: EventEmitter<Direction>;
    dir: Direction;
    readonly value: Direction;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
}

export declare const DIR_DOCUMENT: InjectionToken<Document>;

export declare type Direction = 'ltr' | 'rtl';

export declare class Directionality implements OnDestroy {
    readonly change: EventEmitter<Direction>;
    readonly value: Direction;
    constructor(_document?: any);
    ngOnDestroy(): void;
}

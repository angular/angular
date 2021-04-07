export declare const MAT_PROGRESS_BAR_LOCATION: InjectionToken<MatProgressBarLocation>;

export declare function MAT_PROGRESS_BAR_LOCATION_FACTORY(): MatProgressBarLocation;

export declare class MatProgressBar extends _MatProgressBarMixinBase implements CanColor, AfterViewInit, OnDestroy {
    _animationMode?: string | undefined;
    _elementRef: ElementRef;
    _isNoopAnimation: boolean;
    _primaryValueBar: ElementRef;
    _rectangleFillValue: string;
    readonly animationEnd: EventEmitter<ProgressAnimationEnd>;
    get bufferValue(): number;
    set bufferValue(v: number);
    mode: ProgressBarMode;
    progressbarId: string;
    get value(): number;
    set value(v: number);
    constructor(_elementRef: ElementRef, _ngZone: NgZone, _animationMode?: string | undefined,
    location?: MatProgressBarLocation);
    _bufferTransform(): {
        transform: string;
    } | null;
    _primaryTransform(): {
        transform: string;
    };
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_value: NumberInput;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatProgressBar, "mat-progress-bar", ["matProgressBar"], { "color": "color"; "value": "value"; "bufferValue": "bufferValue"; "mode": "mode"; }, { "animationEnd": "animationEnd"; }, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatProgressBar, [null, null, { optional: true; }, { optional: true; }]>;
}

export interface MatProgressBarLocation {
    getPathname: () => string;
}

export declare class MatProgressBarModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatProgressBarModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatProgressBarModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatProgressBarModule, [typeof i1.MatProgressBar], [typeof i2.CommonModule, typeof i3.MatCommonModule], [typeof i1.MatProgressBar, typeof i3.MatCommonModule]>;
}

export interface ProgressAnimationEnd {
    value: number;
}

export declare type ProgressBarMode = 'determinate' | 'indeterminate' | 'buffer' | 'query';

export declare const MAT_PROGRESS_BAR_LOCATION: InjectionToken<MatProgressBarLocation>;

export declare function MAT_PROGRESS_BAR_LOCATION_FACTORY(): MatProgressBarLocation;

export declare class MatProgressBar extends _MatProgressBarMixinBase implements CanColor, AfterViewInit, OnDestroy {
    _animationMode?: string | undefined;
    _elementRef: ElementRef;
    _isNoopAnimation: boolean;
    _primaryValueBar: ElementRef;
    _rectangleFillValue: string;
    animationEnd: EventEmitter<ProgressAnimationEnd>;
    bufferValue: number;
    mode: ProgressBarMode;
    progressbarId: string;
    value: number;
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
    static ngAcceptInputType_value: number | string;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatProgressBar, "mat-progress-bar", ["matProgressBar"], { 'color': "color", 'value': "value", 'bufferValue': "bufferValue", 'mode': "mode" }, { 'animationEnd': "animationEnd" }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatProgressBar>;
}

export interface MatProgressBarLocation {
    getPathname: () => string;
}

export declare class MatProgressBarModule {
    static ɵinj: i0.ɵɵInjectorDef<MatProgressBarModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatProgressBarModule, [typeof i1.MatProgressBar], [typeof i2.CommonModule, typeof i3.MatCommonModule], [typeof i1.MatProgressBar, typeof i3.MatCommonModule]>;
}

export interface ProgressAnimationEnd {
    value: number;
}

export declare type ProgressBarMode = 'determinate' | 'indeterminate' | 'buffer' | 'query';

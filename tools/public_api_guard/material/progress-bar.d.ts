export declare const _MatProgressBarMixinBase: CanColorCtor & typeof MatProgressBarBase;

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
    mode: 'determinate' | 'indeterminate' | 'buffer' | 'query';
    progressbarId: string;
    value: number;
    constructor(_elementRef: ElementRef, _ngZone: NgZone, _animationMode?: string | undefined,
    location?: MatProgressBarLocation);
    _bufferTransform(): {
        transform: string;
    } | undefined;
    _primaryTransform(): {
        transform: string;
    };
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
}

export declare class MatProgressBarBase {
    _elementRef: ElementRef;
    constructor(_elementRef: ElementRef);
}

export interface MatProgressBarLocation {
    getPathname: () => string;
}

export declare class MatProgressBarModule {
}

export interface ProgressAnimationEnd {
    value: number;
}

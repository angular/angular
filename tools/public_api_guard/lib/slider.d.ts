export declare const _MatSliderMixinBase: HasTabIndexCtor & CanColorCtor & CanDisableCtor & typeof MatSliderBase;

export declare const MAT_SLIDER_VALUE_ACCESSOR: any;

export declare class MatSlider extends _MatSliderMixinBase implements ControlValueAccessor, OnDestroy, CanDisable, CanColor, OnInit, HasTabIndex {
    _animationMode?: string | undefined;
    readonly _invertAxis: boolean;
    _isActive: boolean;
    readonly _isMinValue: boolean;
    _isSliding: boolean;
    readonly _thumbContainerStyles: {
        [key: string]: string;
    };
    readonly _thumbGap: 7 | 10 | 0;
    readonly _ticksContainerStyles: {
        [key: string]: string;
    };
    readonly _ticksStyles: {
        [key: string]: string;
    };
    readonly _trackBackgroundStyles: {
        [key: string]: string;
    };
    readonly _trackFillStyles: {
        [key: string]: string;
    };
    readonly change: EventEmitter<MatSliderChange>;
    readonly displayValue: string | number;
    displayWith: (value: number | null) => string | number;
    readonly input: EventEmitter<MatSliderChange>;
    invert: boolean;
    max: number;
    min: number;
    onTouched: () => any;
    readonly percent: number;
    step: number;
    thumbLabel: boolean;
    tickInterval: 'auto' | number;
    value: number | null;
    readonly valueChange: EventEmitter<number | null>;
    vertical: boolean;
    constructor(elementRef: ElementRef, _focusMonitor: FocusMonitor, _changeDetectorRef: ChangeDetectorRef, _dir: Directionality, tabIndex: string, _animationMode?: string | undefined);
    _onBlur(): void;
    _onFocus(): void;
    _onKeydown(event: KeyboardEvent): void;
    _onKeyup(): void;
    _onMousedown(event: MouseEvent): void;
    _onMouseenter(): void;
    _onSlide(event: HammerInput): void;
    _onSlideEnd(): void;
    _onSlideStart(event: HammerInput | null): void;
    blur(): void;
    focus(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
}

export declare class MatSliderBase {
    _elementRef: ElementRef;
    constructor(_elementRef: ElementRef);
}

export declare class MatSliderChange {
    source: MatSlider;
    value: number | null;
}

export declare class MatSliderModule {
}

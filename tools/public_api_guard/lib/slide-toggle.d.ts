export declare const _MatSlideToggleMixinBase: HasTabIndexCtor & CanColorCtor & CanDisableRippleCtor & CanDisableCtor & typeof MatSlideToggleBase;

export declare const MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS: InjectionToken<MatSlideToggleDefaultOptions>;

export declare const MAT_SLIDE_TOGGLE_VALUE_ACCESSOR: any;

export declare class MatSlideToggle extends _MatSlideToggleMixinBase implements OnDestroy, AfterContentInit, ControlValueAccessor, CanDisable, CanColor, HasTabIndex, CanDisableRipple {
    _animationMode?: string | undefined;
    _inputElement: ElementRef<HTMLInputElement>;
    _thumbBarEl: ElementRef;
    _thumbEl: ElementRef;
    ariaLabel: string | null;
    ariaLabelledby: string | null;
    readonly change: EventEmitter<MatSlideToggleChange>;
    checked: boolean;
    defaults: MatSlideToggleDefaultOptions;
    readonly dragChange: EventEmitter<void>;
    id: string;
    readonly inputId: string;
    labelPosition: 'before' | 'after';
    name: string | null;
    required: boolean;
    readonly toggleChange: EventEmitter<void>;
    constructor(elementRef: ElementRef,
    _platform: Platform, _focusMonitor: FocusMonitor, _changeDetectorRef: ChangeDetectorRef, tabIndex: string, _ngZone: NgZone, defaults: MatSlideToggleDefaultOptions, _animationMode?: string | undefined, _dir?: Directionality | undefined);
    _onChangeEvent(event: Event): void;
    _onDrag(event: HammerInput): void;
    _onDragEnd(): void;
    _onDragStart(): void;
    _onInputClick(event: Event): void;
    _onLabelTextChange(): void;
    focus(): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    toggle(): void;
    writeValue(value: any): void;
}

export declare class MatSlideToggleBase {
    _elementRef: ElementRef;
    constructor(_elementRef: ElementRef);
}

export declare class MatSlideToggleChange {
    checked: boolean;
    source: MatSlideToggle;
    constructor(
    source: MatSlideToggle,
    checked: boolean);
}

export interface MatSlideToggleDefaultOptions {
    disableDragValue?: boolean;
    disableToggleValue?: boolean;
}

export declare class MatSlideToggleModule {
}

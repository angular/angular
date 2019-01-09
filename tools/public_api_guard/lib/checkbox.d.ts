export declare const _MatCheckboxMixinBase: HasTabIndexCtor & CanColorCtor & CanDisableRippleCtor & CanDisableCtor & typeof MatCheckboxBase;

export declare const MAT_CHECKBOX_CLICK_ACTION: InjectionToken<MatCheckboxClickAction>;

export declare const MAT_CHECKBOX_CONTROL_VALUE_ACCESSOR: any;

export declare const MAT_CHECKBOX_REQUIRED_VALIDATOR: Provider;

export declare class MatCheckbox extends _MatCheckboxMixinBase implements ControlValueAccessor, AfterViewChecked, OnDestroy, CanColor, CanDisable, HasTabIndex, CanDisableRipple {
    _animationMode?: string | undefined;
    _inputElement: ElementRef<HTMLInputElement>;
    _onTouched: () => any;
    ariaLabel: string;
    ariaLabelledby: string | null;
    readonly change: EventEmitter<MatCheckboxChange>;
    checked: boolean;
    disabled: any;
    id: string;
    indeterminate: boolean;
    readonly indeterminateChange: EventEmitter<boolean>;
    readonly inputId: string;
    labelPosition: 'before' | 'after';
    name: string | null;
    required: boolean;
    ripple: MatRipple;
    value: string;
    constructor(elementRef: ElementRef<HTMLElement>, _changeDetectorRef: ChangeDetectorRef, _focusMonitor: FocusMonitor, _ngZone: NgZone, tabIndex: string, _clickAction: MatCheckboxClickAction, _animationMode?: string | undefined);
    _getAriaChecked(): 'true' | 'false' | 'mixed';
    _isRippleDisabled(): any;
    _onInputClick(event: Event): void;
    _onInteractionEvent(event: Event): void;
    _onLabelTextChange(): void;
    focus(): void;
    ngAfterViewChecked(): void;
    ngOnDestroy(): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    toggle(): void;
    writeValue(value: any): void;
}

export declare class MatCheckboxBase {
    _elementRef: ElementRef;
    constructor(_elementRef: ElementRef);
}

export declare class MatCheckboxChange {
    checked: boolean;
    source: MatCheckbox;
}

export declare type MatCheckboxClickAction = 'noop' | 'check' | 'check-indeterminate' | undefined;

export declare class MatCheckboxModule {
}

export declare class MatCheckboxRequiredValidator extends CheckboxRequiredValidator {
}

export declare enum TransitionCheckState {
    Init = 0,
    Checked = 1,
    Unchecked = 2,
    Indeterminate = 3
}

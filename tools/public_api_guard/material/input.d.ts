export declare const _MatInputMixinBase: CanUpdateErrorStateCtor & typeof MatInputBase;

export declare function getMatInputUnsupportedTypeError(type: string): Error;

export declare const MAT_INPUT_VALUE_ACCESSOR: InjectionToken<{
    value: any;
}>;

export declare class MatInput extends _MatInputMixinBase implements MatFormFieldControl<any>, OnChanges, OnDestroy, OnInit, DoCheck, CanUpdateErrorState {
    _ariaDescribedby: string;
    protected _disabled: boolean;
    protected _elementRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
    protected _id: string;
    _isNativeSelect: boolean;
    _isServer: boolean;
    protected _neverEmptyInputTypes: string[];
    protected _platform: Platform;
    protected _previousNativeValue: any;
    protected _required: boolean;
    protected _type: string;
    protected _uid: string;
    autofilled: boolean;
    controlType: string;
    disabled: boolean;
    readonly empty: boolean;
    errorStateMatcher: ErrorStateMatcher;
    focused: boolean;
    id: string;
    ngControl: NgControl;
    placeholder: string;
    readonly: boolean;
    required: boolean;
    readonly shouldLabelFloat: boolean;
    readonly stateChanges: Subject<void>;
    type: string;
    value: string;
    constructor(_elementRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, _platform: Platform,
    ngControl: NgControl, _parentForm: NgForm, _parentFormGroup: FormGroupDirective, _defaultErrorStateMatcher: ErrorStateMatcher, inputValueAccessor: any, _autofillMonitor: AutofillMonitor, ngZone: NgZone);
    protected _dirtyCheckNativeValue(): void;
    _focusChanged(isFocused: boolean): void;
    protected _isBadInput(): boolean;
    protected _isNeverEmpty(): boolean;
    protected _isTextarea(): boolean;
    _onInput(): void;
    protected _validateType(): void;
    focus(): void;
    ngDoCheck(): void;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    onContainerClick(): void;
    setDescribedByIds(ids: string[]): void;
}

export declare class MatInputBase {
    _defaultErrorStateMatcher: ErrorStateMatcher;
    _parentForm: NgForm;
    _parentFormGroup: FormGroupDirective;
    ngControl: NgControl;
    constructor(_defaultErrorStateMatcher: ErrorStateMatcher, _parentForm: NgForm, _parentFormGroup: FormGroupDirective,
    ngControl: NgControl);
}

export declare class MatInputModule {
}

export declare class MatTextareaAutosize extends CdkTextareaAutosize {
    matAutosize: boolean;
    matAutosizeMaxRows: number;
    matAutosizeMinRows: number;
    matTextareaAutosize: boolean;
}

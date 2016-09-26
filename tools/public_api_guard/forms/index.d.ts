/** @stable */
export declare abstract class AbstractControl {
    asyncValidator: AsyncValidatorFn;
    dirty: boolean;
    disabled: boolean;
    enabled: boolean;
    errors: {
        [key: string]: any;
    };
    invalid: boolean;
    pending: boolean;
    pristine: boolean;
    root: AbstractControl;
    status: string;
    statusChanges: Observable<any>;
    touched: boolean;
    untouched: boolean;
    valid: boolean;
    validator: ValidatorFn;
    value: any;
    valueChanges: Observable<any>;
    constructor(validator: ValidatorFn, asyncValidator: AsyncValidatorFn);
    clearAsyncValidators(): void;
    clearValidators(): void;
    disable({onlySelf, emitEvent}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    enable({onlySelf, emitEvent}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    get(path: Array<string | number> | string): AbstractControl;
    getError(errorCode: string, path?: string[]): any;
    hasError(errorCode: string, path?: string[]): boolean;
    markAsDirty({onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    markAsPending({onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    markAsPristine({onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    markAsTouched({onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    markAsUntouched({onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    abstract patchValue(value: any, options?: Object): void;
    abstract reset(value?: any, options?: Object): void;
    setAsyncValidators(newValidator: AsyncValidatorFn | AsyncValidatorFn[]): void;
    setErrors(errors: {
        [key: string]: any;
    }, {emitEvent}?: {
        emitEvent?: boolean;
    }): void;
    setParent(parent: FormGroup | FormArray): void;
    setValidators(newValidator: ValidatorFn | ValidatorFn[]): void;
    abstract setValue(value: any, options?: Object): void;
    updateValueAndValidity({onlySelf, emitEvent}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
}

/** @stable */
export declare abstract class AbstractControlDirective {
    control: AbstractControl;
    dirty: boolean;
    disabled: boolean;
    enabled: boolean;
    errors: {
        [key: string]: any;
    };
    invalid: boolean;
    path: string[];
    pending: boolean;
    pristine: boolean;
    statusChanges: Observable<any>;
    touched: boolean;
    untouched: boolean;
    valid: boolean;
    value: any;
    valueChanges: Observable<any>;
    reset(value?: any): void;
}

/** @stable */
export declare class AbstractFormGroupDirective extends ControlContainer implements OnInit, OnDestroy {
    asyncValidator: AsyncValidatorFn;
    control: FormGroup;
    formDirective: Form;
    path: string[];
    validator: ValidatorFn;
    ngOnDestroy(): void;
    ngOnInit(): void;
}

/** @stable */
export interface AsyncValidatorFn {
    (c: AbstractControl): any;
}

/** @stable */
export declare class CheckboxControlValueAccessor implements ControlValueAccessor {
    onChange: (_: any) => void;
    onTouched: () => void;
    constructor(_renderer: Renderer, _elementRef: ElementRef);
    registerOnChange(fn: (_: any) => {}): void;
    registerOnTouched(fn: () => {}): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
}

/** @stable */
export declare class ControlContainer extends AbstractControlDirective {
    formDirective: Form;
    name: string;
    path: string[];
}

/** @stable */
export interface ControlValueAccessor {
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    setDisabledState?(isDisabled: boolean): void;
    writeValue(obj: any): void;
}

/** @stable */
export declare class DefaultValueAccessor implements ControlValueAccessor {
    onChange: (_: any) => void;
    onTouched: () => void;
    constructor(_renderer: Renderer, _elementRef: ElementRef);
    registerOnChange(fn: (_: any) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
}

/** @stable */
export interface Form {
    addControl(dir: NgControl): void;
    addFormGroup(dir: AbstractFormGroupDirective): void;
    getControl(dir: NgControl): FormControl;
    getFormGroup(dir: AbstractFormGroupDirective): FormGroup;
    removeControl(dir: NgControl): void;
    removeFormGroup(dir: AbstractFormGroupDirective): void;
    updateModel(dir: NgControl, value: any): void;
}

/** @stable */
export declare class FormArray extends AbstractControl {
    controls: AbstractControl[];
    length: number;
    constructor(controls: AbstractControl[], validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn);
    at(index: number): AbstractControl;
    getRawValue(): any[];
    insert(index: number, control: AbstractControl): void;
    patchValue(value: any[], {onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    push(control: AbstractControl): void;
    removeAt(index: number): void;
    reset(value?: any, {onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    setControl(index: number, control: AbstractControl): void;
    setValue(value: any[], {onlySelf}?: {
        onlySelf?: boolean;
    }): void;
}

/** @stable */
export declare class FormArrayName extends ControlContainer implements OnInit, OnDestroy {
    asyncValidator: AsyncValidatorFn;
    control: FormArray;
    formDirective: FormGroupDirective;
    name: string;
    path: string[];
    validator: ValidatorFn;
    constructor(parent: ControlContainer, validators: any[], asyncValidators: any[]);
    ngOnDestroy(): void;
    ngOnInit(): void;
}

/** @stable */
export declare class FormBuilder {
    array(controlsConfig: any[], validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn): FormArray;
    control(formState: Object, validator?: ValidatorFn | ValidatorFn[], asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[]): FormControl;
    group(controlsConfig: {
        [key: string]: any;
    }, extra?: {
        [key: string]: any;
    }): FormGroup;
}

/** @stable */
export declare class FormControl extends AbstractControl {
    constructor(formState?: any, validator?: ValidatorFn | ValidatorFn[], asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[]);
    patchValue(value: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        emitModelToViewChange?: boolean;
        emitViewToModelChange?: boolean;
    }): void;
    registerOnChange(fn: Function): void;
    registerOnDisabledChange(fn: (isDisabled: boolean) => void): void;
    reset(formState?: any, {onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    setValue(value: any, {onlySelf, emitEvent, emitModelToViewChange, emitViewToModelChange}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        emitModelToViewChange?: boolean;
        emitViewToModelChange?: boolean;
    }): void;
}

/** @stable */
export declare class FormControlDirective extends NgControl implements OnChanges {
    asyncValidator: AsyncValidatorFn;
    control: FormControl;
    form: FormControl;
    isDisabled: boolean;
    model: any;
    path: string[];
    update: EventEmitter<{}>;
    validator: ValidatorFn;
    viewModel: any;
    constructor(validators: Array<Validator | ValidatorFn>, asyncValidators: Array<Validator | AsyncValidatorFn>, valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    viewToModelUpdate(newValue: any): void;
}

/** @stable */
export declare class FormControlName extends NgControl implements OnChanges, OnDestroy {
    asyncValidator: AsyncValidatorFn;
    control: FormControl;
    formDirective: any;
    isDisabled: boolean;
    model: any;
    name: string;
    path: string[];
    update: EventEmitter<{}>;
    validator: ValidatorFn;
    constructor(parent: ControlContainer, validators: Array<Validator | ValidatorFn>, asyncValidators: Array<Validator | AsyncValidatorFn>, valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    viewToModelUpdate(newValue: any): void;
}

/** @stable */
export declare class FormGroup extends AbstractControl {
    controls: {
        [key: string]: AbstractControl;
    };
    constructor(controls: {
        [key: string]: AbstractControl;
    }, validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn);
    addControl(name: string, control: AbstractControl): void;
    contains(controlName: string): boolean;
    getRawValue(): Object;
    patchValue(value: {
        [key: string]: any;
    }, {onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    registerControl(name: string, control: AbstractControl): AbstractControl;
    removeControl(name: string): void;
    reset(value?: any, {onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    setControl(name: string, control: AbstractControl): void;
    setValue(value: {
        [key: string]: any;
    }, {onlySelf}?: {
        onlySelf?: boolean;
    }): void;
}

/** @stable */
export declare class FormGroupDirective extends ControlContainer implements Form, OnChanges {
    control: FormGroup;
    directives: FormControlName[];
    form: FormGroup;
    formDirective: Form;
    ngSubmit: EventEmitter<{}>;
    path: string[];
    submitted: boolean;
    constructor(_validators: any[], _asyncValidators: any[]);
    addControl(dir: FormControlName): FormControl;
    addFormArray(dir: FormArrayName): void;
    addFormGroup(dir: FormGroupName): void;
    getControl(dir: FormControlName): FormControl;
    getFormArray(dir: FormArrayName): FormArray;
    getFormGroup(dir: FormGroupName): FormGroup;
    ngOnChanges(changes: SimpleChanges): void;
    onReset(): void;
    onSubmit(): boolean;
    removeControl(dir: FormControlName): void;
    removeFormArray(dir: FormArrayName): void;
    removeFormGroup(dir: FormGroupName): void;
    resetForm(value?: any): void;
    updateModel(dir: FormControlName, value: any): void;
}

/** @stable */
export declare class FormGroupName extends AbstractFormGroupDirective implements OnInit, OnDestroy {
    name: string;
    constructor(parent: ControlContainer, validators: any[], asyncValidators: any[]);
}

/** @stable */
export declare class FormsModule {
}

/** @stable */
export declare class MaxLengthValidator implements Validator, OnChanges {
    maxlength: string;
    ngOnChanges(changes: SimpleChanges): void;
    registerOnValidatorChange(fn: () => void): void;
    validate(c: AbstractControl): {
        [key: string]: any;
    };
}

/** @stable */
export declare class MinLengthValidator implements Validator, OnChanges {
    minlength: string;
    ngOnChanges(changes: SimpleChanges): void;
    registerOnValidatorChange(fn: () => void): void;
    validate(c: AbstractControl): {
        [key: string]: any;
    };
}

/** @stable */
export declare const NG_ASYNC_VALIDATORS: OpaqueToken;

/** @stable */
export declare const NG_VALIDATORS: OpaqueToken;

/** @stable */
export declare const NG_VALUE_ACCESSOR: OpaqueToken;

/** @stable */
export declare abstract class NgControl extends AbstractControlDirective {
    asyncValidator: AsyncValidatorFn;
    name: string;
    validator: ValidatorFn;
    valueAccessor: ControlValueAccessor;
    abstract viewToModelUpdate(newValue: any): void;
}

/** @stable */
export declare class NgControlStatus extends AbstractControlStatus {
    constructor(cd: NgControl);
}

/** @stable */
export declare class NgControlStatusGroup extends AbstractControlStatus {
    constructor(cd: ControlContainer);
}

/** @stable */
export declare class NgForm extends ControlContainer implements Form {
    control: FormGroup;
    controls: {
        [key: string]: AbstractControl;
    };
    form: FormGroup;
    formDirective: Form;
    ngSubmit: EventEmitter<{}>;
    path: string[];
    submitted: boolean;
    constructor(validators: any[], asyncValidators: any[]);
    addControl(dir: NgModel): void;
    addFormGroup(dir: NgModelGroup): void;
    getControl(dir: NgModel): FormControl;
    getFormGroup(dir: NgModelGroup): FormGroup;
    onReset(): void;
    onSubmit(): boolean;
    removeControl(dir: NgModel): void;
    removeFormGroup(dir: NgModelGroup): void;
    resetForm(value?: any): void;
    setValue(value: {
        [key: string]: any;
    }): void;
    updateModel(dir: NgControl, value: any): void;
}

/** @stable */
export declare class NgModel extends NgControl implements OnChanges, OnDestroy {
    asyncValidator: AsyncValidatorFn;
    control: FormControl;
    formDirective: any;
    isDisabled: boolean;
    model: any;
    name: string;
    options: {
        name?: string;
        standalone?: boolean;
    };
    path: string[];
    update: EventEmitter<{}>;
    validator: ValidatorFn;
    viewModel: any;
    constructor(parent: ControlContainer, validators: Array<Validator | ValidatorFn>, asyncValidators: Array<Validator | AsyncValidatorFn>, valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    viewToModelUpdate(newValue: any): void;
}

/** @stable */
export declare class NgModelGroup extends AbstractFormGroupDirective implements OnInit, OnDestroy {
    name: string;
    constructor(parent: ControlContainer, validators: any[], asyncValidators: any[]);
}

/** @stable */
export declare class NgSelectOption implements OnDestroy {
    id: string;
    ngValue: any;
    value: any;
    constructor(_element: ElementRef, _renderer: Renderer, _select: SelectControlValueAccessor);
    ngOnDestroy(): void;
}

/** @stable */
export declare class PatternValidator implements Validator, OnChanges {
    pattern: string;
    ngOnChanges(changes: SimpleChanges): void;
    registerOnValidatorChange(fn: () => void): void;
    validate(c: AbstractControl): {
        [key: string]: any;
    };
}

/** @stable */
export declare class RadioControlValueAccessor implements ControlValueAccessor, OnDestroy, OnInit {
    formControlName: string;
    name: string;
    onChange: () => void;
    onTouched: () => void;
    value: any;
    constructor(_renderer: Renderer, _elementRef: ElementRef, _registry: RadioControlRegistry, _injector: Injector);
    fireUncheck(value: any): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    registerOnChange(fn: (_: any) => {}): void;
    registerOnTouched(fn: () => {}): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
}

/** @stable */
export declare class ReactiveFormsModule {
}

/** @stable */
export declare class RequiredValidator implements Validator {
    required: boolean;
    registerOnValidatorChange(fn: () => void): void;
    validate(c: AbstractControl): {
        [key: string]: any;
    };
}

/** @stable */
export declare class SelectControlValueAccessor implements ControlValueAccessor {
    onChange: (_: any) => void;
    onTouched: () => void;
    value: any;
    constructor(_renderer: Renderer, _elementRef: ElementRef);
    registerOnChange(fn: (value: any) => any): void;
    registerOnTouched(fn: () => any): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
}

/** @stable */
export declare class SelectMultipleControlValueAccessor implements ControlValueAccessor {
    onChange: (_: any) => void;
    onTouched: () => void;
    value: any;
    constructor(_renderer: Renderer, _elementRef: ElementRef);
    registerOnChange(fn: (value: any) => any): void;
    registerOnTouched(fn: () => any): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
}

/** @stable */
export interface Validator {
    registerOnValidatorChange?(fn: () => void): void;
    validate(c: AbstractControl): {
        [key: string]: any;
    };
}

/** @stable */
export interface ValidatorFn {
    (c: AbstractControl): {
        [key: string]: any;
    };
}

/** @stable */
export declare class Validators {
    static compose(validators: ValidatorFn[]): ValidatorFn;
    static composeAsync(validators: AsyncValidatorFn[]): AsyncValidatorFn;
    static maxLength(maxLength: number): ValidatorFn;
    static minLength(minLength: number): ValidatorFn;
    static nullValidator(c: AbstractControl): {
        [key: string]: boolean;
    };
    static pattern(pattern: string): ValidatorFn;
    static required(control: AbstractControl): {
        [key: string]: boolean;
    };
}

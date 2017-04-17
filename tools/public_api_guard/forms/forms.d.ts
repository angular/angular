/** @stable */
export declare abstract class AbstractControl {
    asyncValidator: AsyncValidatorFn;
    readonly dirty: boolean;
    readonly disabled: boolean;
    readonly enabled: boolean;
    readonly errors: ValidationErrors | null;
    readonly invalid: boolean;
    readonly parent: FormGroup | FormArray;
    readonly pending: boolean;
    readonly pristine: boolean;
    readonly root: AbstractControl;
    readonly status: string;
    readonly statusChanges: Observable<any>;
    readonly touched: boolean;
    readonly untouched: boolean;
    readonly valid: boolean;
    validator: ValidatorFn;
    readonly value: any;
    readonly valueChanges: Observable<any>;
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
    setErrors(errors: ValidationErrors | null, {emitEvent}?: {
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
    readonly control: AbstractControl;
    readonly dirty: boolean;
    readonly disabled: boolean;
    readonly enabled: boolean;
    readonly errors: ValidationErrors | null;
    readonly invalid: boolean;
    readonly path: string[];
    readonly pending: boolean;
    readonly pristine: boolean;
    readonly statusChanges: Observable<any>;
    readonly touched: boolean;
    readonly untouched: boolean;
    readonly valid: boolean;
    readonly value: any;
    readonly valueChanges: Observable<any>;
    getError(errorCode: string, path?: string[]): any;
    hasError(errorCode: string, path?: string[]): boolean;
    reset(value?: any): void;
}

/** @stable */
export declare class AbstractFormGroupDirective extends ControlContainer implements OnInit, OnDestroy {
    readonly asyncValidator: AsyncValidatorFn;
    readonly control: FormGroup;
    readonly formDirective: Form;
    readonly path: string[];
    readonly validator: ValidatorFn;
    ngOnDestroy(): void;
    ngOnInit(): void;
}

/** @experimental */
export interface AsyncValidator extends Validator {
    validate(c: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null>;
}

/** @stable */
export interface AsyncValidatorFn {
    (c: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null>;
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

/** @experimental */
export declare class CheckboxRequiredValidator extends RequiredValidator {
    validate(c: AbstractControl): ValidationErrors | null;
}

/** @experimental */
export declare const COMPOSITION_BUFFER_MODE: InjectionToken<boolean>;

/** @stable */
export declare class ControlContainer extends AbstractControlDirective {
    readonly formDirective: Form;
    name: string;
    readonly path: string[];
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
    constructor(_renderer: Renderer, _elementRef: ElementRef, _compositionMode: boolean);
    _compositionEnd(value: any): void;
    _compositionStart(): void;
    _handleInput(value: any): void;
    registerOnChange(fn: (_: any) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
}

/** @experimental */
export declare class EmailValidator implements Validator {
    email: boolean | string;
    registerOnValidatorChange(fn: () => void): void;
    validate(c: AbstractControl): ValidationErrors | null;
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
    readonly length: number;
    constructor(controls: AbstractControl[], validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn);
    at(index: number): AbstractControl;
    getRawValue(): any[];
    insert(index: number, control: AbstractControl): void;
    patchValue(value: any[], {onlySelf, emitEvent}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    push(control: AbstractControl): void;
    removeAt(index: number): void;
    reset(value?: any, {onlySelf, emitEvent}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    setControl(index: number, control: AbstractControl): void;
    setValue(value: any[], {onlySelf, emitEvent}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
}

/** @stable */
export declare class FormArrayName extends ControlContainer implements OnInit, OnDestroy {
    readonly asyncValidator: AsyncValidatorFn;
    readonly control: FormArray;
    readonly formDirective: FormGroupDirective;
    name: string;
    readonly path: string[];
    readonly validator: ValidatorFn;
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
    reset(formState?: any, {onlySelf, emitEvent}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
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
    readonly asyncValidator: AsyncValidatorFn;
    readonly control: FormControl;
    form: FormControl;
    isDisabled: boolean;
    model: any;
    readonly path: string[];
    update: EventEmitter<{}>;
    readonly validator: ValidatorFn;
    viewModel: any;
    constructor(validators: Array<Validator | ValidatorFn>, asyncValidators: Array<AsyncValidator | AsyncValidatorFn>, valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    viewToModelUpdate(newValue: any): void;
}

/** @stable */
export declare class FormControlName extends NgControl implements OnChanges, OnDestroy {
    readonly asyncValidator: AsyncValidatorFn;
    readonly control: FormControl;
    readonly formDirective: any;
    isDisabled: boolean;
    model: any;
    name: string;
    readonly path: string[];
    update: EventEmitter<{}>;
    readonly validator: ValidatorFn;
    constructor(parent: ControlContainer, validators: Array<Validator | ValidatorFn>, asyncValidators: Array<AsyncValidator | AsyncValidatorFn>, valueAccessors: ControlValueAccessor[]);
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
    getRawValue(): any;
    patchValue(value: {
        [key: string]: any;
    }, {onlySelf, emitEvent}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    registerControl(name: string, control: AbstractControl): AbstractControl;
    removeControl(name: string): void;
    reset(value?: any, {onlySelf, emitEvent}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    setControl(name: string, control: AbstractControl): void;
    setValue(value: {
        [key: string]: any;
    }, {onlySelf, emitEvent}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
}

/** @stable */
export declare class FormGroupDirective extends ControlContainer implements Form, OnChanges {
    readonly control: FormGroup;
    directives: FormControlName[];
    form: FormGroup;
    readonly formDirective: Form;
    ngSubmit: EventEmitter<{}>;
    readonly path: string[];
    readonly submitted: boolean;
    constructor(_validators: any[], _asyncValidators: any[]);
    addControl(dir: FormControlName): FormControl;
    addFormArray(dir: FormArrayName): void;
    addFormGroup(dir: FormGroupName): void;
    getControl(dir: FormControlName): FormControl;
    getFormArray(dir: FormArrayName): FormArray;
    getFormGroup(dir: FormGroupName): FormGroup;
    ngOnChanges(changes: SimpleChanges): void;
    onReset(): void;
    onSubmit($event: Event): boolean;
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
    validate(c: AbstractControl): ValidationErrors | null;
}

/** @stable */
export declare class MinLengthValidator implements Validator, OnChanges {
    minlength: string;
    ngOnChanges(changes: SimpleChanges): void;
    registerOnValidatorChange(fn: () => void): void;
    validate(c: AbstractControl): ValidationErrors | null;
}

/** @stable */
export declare const NG_ASYNC_VALIDATORS: InjectionToken<(Function | Validator)[]>;

/** @stable */
export declare const NG_VALIDATORS: InjectionToken<(Function | Validator)[]>;

/** @stable */
export declare const NG_VALUE_ACCESSOR: InjectionToken<ControlValueAccessor>;

/** @stable */
export declare abstract class NgControl extends AbstractControlDirective {
    readonly asyncValidator: AsyncValidatorFn;
    name: string;
    readonly validator: ValidatorFn;
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
    readonly control: FormGroup;
    readonly controls: {
        [key: string]: AbstractControl;
    };
    form: FormGroup;
    readonly formDirective: Form;
    ngSubmit: EventEmitter<{}>;
    readonly path: string[];
    readonly submitted: boolean;
    constructor(validators: any[], asyncValidators: any[]);
    addControl(dir: NgModel): void;
    addFormGroup(dir: NgModelGroup): void;
    getControl(dir: NgModel): FormControl;
    getFormGroup(dir: NgModelGroup): FormGroup;
    onReset(): void;
    onSubmit($event: Event): boolean;
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
    readonly asyncValidator: AsyncValidatorFn;
    readonly control: FormControl;
    readonly formDirective: any;
    isDisabled: boolean;
    model: any;
    name: string;
    options: {
        name?: string;
        standalone?: boolean;
    };
    readonly path: string[];
    update: EventEmitter<{}>;
    readonly validator: ValidatorFn;
    viewModel: any;
    constructor(parent: ControlContainer, validators: Array<Validator | ValidatorFn>, asyncValidators: Array<AsyncValidator | AsyncValidatorFn>, valueAccessors: ControlValueAccessor[]);
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
    pattern: string | RegExp;
    ngOnChanges(changes: SimpleChanges): void;
    registerOnValidatorChange(fn: () => void): void;
    validate(c: AbstractControl): ValidationErrors | null;
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
    required: boolean | string;
    registerOnValidatorChange(fn: () => void): void;
    validate(c: AbstractControl): ValidationErrors | null;
}

/** @stable */
export declare class SelectControlValueAccessor implements ControlValueAccessor {
    compareWith: (o1: any, o2: any) => boolean;
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
    compareWith: (o1: any, o2: any) => boolean;
    onChange: (_: any) => void;
    onTouched: () => void;
    value: any;
    constructor(_renderer: Renderer, _elementRef: ElementRef);
    registerOnChange(fn: (value: any) => any): void;
    registerOnTouched(fn: () => any): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
}

/** @experimental */
export declare type ValidationErrors = {
    [key: string]: any;
};

/** @stable */
export interface Validator {
    registerOnValidatorChange?(fn: () => void): void;
    validate(c: AbstractControl): ValidationErrors | null;
}

/** @stable */
export interface ValidatorFn {
    (c: AbstractControl): ValidationErrors | null;
}

/** @stable */
export declare class Validators {
    static compose(validators: ValidatorFn[]): ValidatorFn;
    static composeAsync(validators: AsyncValidatorFn[]): AsyncValidatorFn;
    static email(control: AbstractControl): ValidationErrors | null;
    static maxLength(maxLength: number): ValidatorFn;
    static minLength(minLength: number): ValidatorFn;
    static nullValidator(c: AbstractControl): ValidationErrors | null;
    static pattern(pattern: string | RegExp): ValidatorFn;
    static required(control: AbstractControl): ValidationErrors | null;
    static requiredTrue(control: AbstractControl): ValidationErrors | null;
}

/** @stable */
export declare const VERSION: Version;

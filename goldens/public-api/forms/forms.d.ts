export declare abstract class AbstractControl {
    get asyncValidator(): AsyncValidatorFn | null;
    set asyncValidator(asyncValidatorFn: AsyncValidatorFn | null);
    get dirty(): boolean;
    get disabled(): boolean;
    get enabled(): boolean;
    readonly errors: ValidationErrors | null;
    get invalid(): boolean;
    get parent(): FormGroup | FormArray | null;
    get pending(): boolean;
    readonly pristine: boolean;
    get root(): AbstractControl;
    readonly status: string;
    readonly statusChanges: Observable<any>;
    readonly touched: boolean;
    get untouched(): boolean;
    get updateOn(): FormHooks;
    get valid(): boolean;
    get validator(): ValidatorFn | null;
    set validator(validatorFn: ValidatorFn | null);
    readonly value: any;
    readonly valueChanges: Observable<any>;
    constructor(validators: ValidatorFn | ValidatorFn[] | null, asyncValidators: AsyncValidatorFn | AsyncValidatorFn[] | null);
    clearAsyncValidators(): void;
    clearValidators(): void;
    disable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    enable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    get(path: Array<string | number> | string): AbstractControl | null;
    getError(errorCode: string, path?: Array<string | number> | string): any;
    hasError(errorCode: string, path?: Array<string | number> | string): boolean;
    markAllAsTouched(): void;
    markAsDirty(opts?: {
        onlySelf?: boolean;
    }): void;
    markAsPending(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    markAsPristine(opts?: {
        onlySelf?: boolean;
    }): void;
    markAsTouched(opts?: {
        onlySelf?: boolean;
    }): void;
    markAsUntouched(opts?: {
        onlySelf?: boolean;
    }): void;
    abstract patchValue(value: any, options?: Object): void;
    abstract reset(value?: any, options?: Object): void;
    setAsyncValidators(newValidator: AsyncValidatorFn | AsyncValidatorFn[] | null): void;
    setErrors(errors: ValidationErrors | null, opts?: {
        emitEvent?: boolean;
    }): void;
    setParent(parent: FormGroup | FormArray): void;
    setValidators(newValidator: ValidatorFn | ValidatorFn[] | null): void;
    abstract setValue(value: any, options?: Object): void;
    updateValueAndValidity(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
}

export declare abstract class AbstractControlDirective {
    get asyncValidator(): AsyncValidatorFn | null;
    abstract get control(): AbstractControl | null;
    get dirty(): boolean | null;
    get disabled(): boolean | null;
    get enabled(): boolean | null;
    get errors(): ValidationErrors | null;
    get invalid(): boolean | null;
    get path(): string[] | null;
    get pending(): boolean | null;
    get pristine(): boolean | null;
    get status(): string | null;
    get statusChanges(): Observable<any> | null;
    get touched(): boolean | null;
    get untouched(): boolean | null;
    get valid(): boolean | null;
    get validator(): ValidatorFn | null;
    get value(): any;
    get valueChanges(): Observable<any> | null;
    getError(errorCode: string, path?: Array<string | number> | string): any;
    hasError(errorCode: string, path?: Array<string | number> | string): boolean;
    reset(value?: any): void;
}

export declare interface AbstractControlOptions {
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null;
    updateOn?: 'change' | 'blur' | 'submit';
    validators?: ValidatorFn | ValidatorFn[] | null;
}

export declare class AbstractFormGroupDirective extends ControlContainer implements OnInit, OnDestroy {
    get control(): FormGroup;
    get formDirective(): Form | null;
    get path(): string[];
    ngOnDestroy(): void;
    ngOnInit(): void;
}

export declare interface AsyncValidator extends Validator {
    validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null>;
}

export declare interface AsyncValidatorFn {
    (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null>;
}

export declare class CheckboxControlValueAccessor extends ɵangular_packages_forms_forms_f implements ControlValueAccessor {
    onChange: (_: any) => void;
    onTouched: () => void;
    constructor(_renderer: Renderer2, _elementRef: ElementRef);
    registerOnChange(fn: (_: any) => {}): void;
    registerOnTouched(fn: () => {}): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
}

export declare class CheckboxRequiredValidator extends RequiredValidator {
    validate(control: AbstractControl): ValidationErrors | null;
}

export declare const COMPOSITION_BUFFER_MODE: InjectionToken<boolean>;

export declare abstract class ControlContainer extends AbstractControlDirective {
    get formDirective(): Form | null;
    name: string | number | null;
    get path(): string[] | null;
}

export declare interface ControlValueAccessor {
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    setDisabledState?(isDisabled: boolean): void;
    writeValue(obj: any): void;
}

export declare class DefaultValueAccessor implements ControlValueAccessor {
    onChange: (_: any) => void;
    onTouched: () => void;
    constructor(_renderer: Renderer2, _elementRef: ElementRef, _compositionMode: boolean);
    registerOnChange(fn: (_: any) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
}

export declare class EmailValidator implements Validator {
    set email(value: boolean | string);
    registerOnValidatorChange(fn: () => void): void;
    validate(control: AbstractControl): ValidationErrors | null;
}

export declare interface Form {
    addControl(dir: NgControl): void;
    addFormGroup(dir: AbstractFormGroupDirective): void;
    getControl(dir: NgControl): FormControl;
    getFormGroup(dir: AbstractFormGroupDirective): FormGroup;
    removeControl(dir: NgControl): void;
    removeFormGroup(dir: AbstractFormGroupDirective): void;
    updateModel(dir: NgControl, value: any): void;
}

export declare class FormArray extends AbstractControl {
    controls: AbstractControl[];
    get length(): number;
    constructor(controls: AbstractControl[], validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null);
    at(index: number): AbstractControl;
    clear(options?: {
        emitEvent?: boolean;
    }): void;
    getRawValue(): any[];
    insert(index: number, control: AbstractControl, options?: {
        emitEvent?: boolean;
    }): void;
    patchValue(value: any[], options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    push(control: AbstractControl, options?: {
        emitEvent?: boolean;
    }): void;
    removeAt(index: number, options?: {
        emitEvent?: boolean;
    }): void;
    reset(value?: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    setControl(index: number, control: AbstractControl, options?: {
        emitEvent?: boolean;
    }): void;
    setValue(value: any[], options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
}

export declare class FormArrayName extends ControlContainer implements OnInit, OnDestroy {
    get control(): FormArray;
    get formDirective(): FormGroupDirective | null;
    name: string | number | null;
    get path(): string[];
    constructor(parent: ControlContainer, validators: (Validator | ValidatorFn)[], asyncValidators: (AsyncValidator | AsyncValidatorFn)[]);
    ngOnDestroy(): void;
    ngOnInit(): void;
}

export declare class FormBuilder {
    array(controlsConfig: any[], validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null): FormArray;
    control(formState: any, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null): FormControl;
    group(controlsConfig: {
        [key: string]: any;
    }, options?: AbstractControlOptions | null): FormGroup;
    /** @deprecated */ group(controlsConfig: {
        [key: string]: any;
    }, options: {
        [key: string]: any;
    }): FormGroup;
}

export declare class FormControl extends AbstractControl {
    constructor(formState?: any, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null);
    patchValue(value: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        emitModelToViewChange?: boolean;
        emitViewToModelChange?: boolean;
    }): void;
    registerOnChange(fn: Function): void;
    registerOnDisabledChange(fn: (isDisabled: boolean) => void): void;
    reset(formState?: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    setValue(value: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        emitModelToViewChange?: boolean;
        emitViewToModelChange?: boolean;
    }): void;
}

export declare class FormControlDirective extends NgControl implements OnChanges, OnDestroy {
    get control(): FormControl;
    form: FormControl;
    set isDisabled(isDisabled: boolean);
    /** @deprecated */ model: any;
    get path(): string[];
    /** @deprecated */ update: EventEmitter<any>;
    viewModel: any;
    constructor(validators: (Validator | ValidatorFn)[], asyncValidators: (AsyncValidator | AsyncValidatorFn)[], valueAccessors: ControlValueAccessor[], _ngModelWarningConfig: string | null);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    viewToModelUpdate(newValue: any): void;
}

export declare class FormControlName extends NgControl implements OnChanges, OnDestroy {
    readonly control: FormControl;
    get formDirective(): any;
    set isDisabled(isDisabled: boolean);
    /** @deprecated */ model: any;
    name: string | number | null;
    get path(): string[];
    /** @deprecated */ update: EventEmitter<any>;
    constructor(parent: ControlContainer, validators: (Validator | ValidatorFn)[], asyncValidators: (AsyncValidator | AsyncValidatorFn)[], valueAccessors: ControlValueAccessor[], _ngModelWarningConfig: string | null);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    viewToModelUpdate(newValue: any): void;
}

export declare class FormGroup extends AbstractControl {
    controls: {
        [key: string]: AbstractControl;
    };
    constructor(controls: {
        [key: string]: AbstractControl;
    }, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null);
    addControl(name: string, control: AbstractControl, options?: {
        emitEvent?: boolean;
    }): void;
    contains(controlName: string): boolean;
    getRawValue(): any;
    patchValue(value: {
        [key: string]: any;
    }, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    registerControl(name: string, control: AbstractControl): AbstractControl;
    removeControl(name: string, options?: {
        emitEvent?: boolean;
    }): void;
    reset(value?: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    setControl(name: string, control: AbstractControl, options?: {
        emitEvent?: boolean;
    }): void;
    setValue(value: {
        [key: string]: any;
    }, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
}

export declare class FormGroupDirective extends ControlContainer implements Form, OnChanges, OnDestroy {
    get control(): FormGroup;
    directives: FormControlName[];
    form: FormGroup;
    get formDirective(): Form;
    ngSubmit: EventEmitter<any>;
    get path(): string[];
    readonly submitted: boolean;
    constructor(validators: (Validator | ValidatorFn)[], asyncValidators: (AsyncValidator | AsyncValidatorFn)[]);
    addControl(dir: FormControlName): FormControl;
    addFormArray(dir: FormArrayName): void;
    addFormGroup(dir: FormGroupName): void;
    getControl(dir: FormControlName): FormControl;
    getFormArray(dir: FormArrayName): FormArray;
    getFormGroup(dir: FormGroupName): FormGroup;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    onReset(): void;
    onSubmit($event: Event): boolean;
    removeControl(dir: FormControlName): void;
    removeFormArray(dir: FormArrayName): void;
    removeFormGroup(dir: FormGroupName): void;
    resetForm(value?: any): void;
    updateModel(dir: FormControlName, value: any): void;
}

export declare class FormGroupName extends AbstractFormGroupDirective implements OnInit, OnDestroy {
    name: string | number | null;
    constructor(parent: ControlContainer, validators: (Validator | ValidatorFn)[], asyncValidators: (AsyncValidator | AsyncValidatorFn)[]);
}

export declare class FormsModule {
}

export declare class MaxLengthValidator implements Validator, OnChanges {
    maxlength: string | number;
    ngOnChanges(changes: SimpleChanges): void;
    registerOnValidatorChange(fn: () => void): void;
    validate(control: AbstractControl): ValidationErrors | null;
}

export declare class MaxValidator extends AbstractValidatorDirective implements OnChanges {
    max: string | number;
    ngOnChanges(changes: SimpleChanges): void;
}

export declare class MinLengthValidator implements Validator, OnChanges {
    minlength: string | number;
    ngOnChanges(changes: SimpleChanges): void;
    registerOnValidatorChange(fn: () => void): void;
    validate(control: AbstractControl): ValidationErrors | null;
}

export declare class MinValidator extends AbstractValidatorDirective implements OnChanges {
    min: string | number;
    ngOnChanges(changes: SimpleChanges): void;
}

export declare const NG_ASYNC_VALIDATORS: InjectionToken<(Function | Validator)[]>;

export declare const NG_VALIDATORS: InjectionToken<(Function | Validator)[]>;

export declare const NG_VALUE_ACCESSOR: InjectionToken<readonly ControlValueAccessor[]>;

export declare abstract class NgControl extends AbstractControlDirective {
    name: string | number | null;
    valueAccessor: ControlValueAccessor | null;
    abstract viewToModelUpdate(newValue: any): void;
}

export declare class NgControlStatus extends ɵangular_packages_forms_forms_h {
    constructor(cd: NgControl);
}

export declare class NgControlStatusGroup extends ɵangular_packages_forms_forms_h {
    constructor(cd: ControlContainer);
}

export declare class NgForm extends ControlContainer implements Form, AfterViewInit {
    get control(): FormGroup;
    get controls(): {
        [key: string]: AbstractControl;
    };
    form: FormGroup;
    get formDirective(): Form;
    ngSubmit: EventEmitter<any>;
    options: {
        updateOn?: FormHooks;
    };
    get path(): string[];
    readonly submitted: boolean;
    constructor(validators: (Validator | ValidatorFn)[], asyncValidators: (AsyncValidator | AsyncValidatorFn)[]);
    addControl(dir: NgModel): void;
    addFormGroup(dir: NgModelGroup): void;
    getControl(dir: NgModel): FormControl;
    getFormGroup(dir: NgModelGroup): FormGroup;
    ngAfterViewInit(): void;
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

export declare class NgModel extends NgControl implements OnChanges, OnDestroy {
    readonly control: FormControl;
    get formDirective(): any;
    isDisabled: boolean;
    model: any;
    name: string;
    options: {
        name?: string;
        standalone?: boolean;
        updateOn?: FormHooks;
    };
    get path(): string[];
    update: EventEmitter<any>;
    viewModel: any;
    constructor(parent: ControlContainer, validators: (Validator | ValidatorFn)[], asyncValidators: (AsyncValidator | AsyncValidatorFn)[], valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    viewToModelUpdate(newValue: any): void;
    static ngAcceptInputType_isDisabled: boolean | string;
}

export declare class NgModelGroup extends AbstractFormGroupDirective implements OnInit, OnDestroy {
    name: string;
    constructor(parent: ControlContainer, validators: (Validator | ValidatorFn)[], asyncValidators: (AsyncValidator | AsyncValidatorFn)[]);
}

export declare class NgSelectOption implements OnDestroy {
    id: string;
    set ngValue(value: any);
    set value(value: any);
    constructor(_element: ElementRef, _renderer: Renderer2, _select: SelectControlValueAccessor);
    ngOnDestroy(): void;
}

export declare class NumberValueAccessor extends ɵangular_packages_forms_forms_f implements ControlValueAccessor {
    onChange: (_: any) => void;
    onTouched: () => void;
    constructor(_renderer: Renderer2, _elementRef: ElementRef);
    registerOnChange(fn: (_: number | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: number): void;
}

export declare class PatternValidator implements Validator, OnChanges {
    pattern: string | RegExp;
    ngOnChanges(changes: SimpleChanges): void;
    registerOnValidatorChange(fn: () => void): void;
    validate(control: AbstractControl): ValidationErrors | null;
}

export declare class RadioControlValueAccessor extends ɵangular_packages_forms_forms_f implements ControlValueAccessor, OnDestroy, OnInit {
    formControlName: string;
    name: string;
    onChange: () => void;
    onTouched: () => void;
    value: any;
    constructor(_renderer: Renderer2, _elementRef: ElementRef, _registry: ɵangular_packages_forms_forms_p, _injector: Injector);
    fireUncheck(value: any): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    registerOnChange(fn: (_: any) => {}): void;
    registerOnTouched(fn: () => {}): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
}

export declare class RangeValueAccessor extends ɵangular_packages_forms_forms_f implements ControlValueAccessor {
    onChange: (_: any) => void;
    onTouched: () => void;
    constructor(_renderer: Renderer2, _elementRef: ElementRef);
    registerOnChange(fn: (_: number | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
}

export declare class ReactiveFormsModule {
    static withConfig(opts: { warnOnNgModelWithFormControl: 'never' | 'once' | 'always';
    }): ModuleWithProviders<ReactiveFormsModule>;
}

export declare class RequiredValidator implements Validator {
    get required(): boolean | string;
    set required(value: boolean | string);
    registerOnValidatorChange(fn: () => void): void;
    validate(control: AbstractControl): ValidationErrors | null;
}

export declare class SelectControlValueAccessor extends ɵangular_packages_forms_forms_f implements ControlValueAccessor {
    set compareWith(fn: (o1: any, o2: any) => boolean);
    onChange: (_: any) => void;
    onTouched: () => void;
    value: any;
    constructor(_renderer: Renderer2, _elementRef: ElementRef);
    registerOnChange(fn: (value: any) => any): void;
    registerOnTouched(fn: () => any): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
}

export declare class SelectMultipleControlValueAccessor extends ɵangular_packages_forms_forms_f implements ControlValueAccessor {
    set compareWith(fn: (o1: any, o2: any) => boolean);
    onChange: (_: any) => void;
    onTouched: () => void;
    value: any;
    constructor(_renderer: Renderer2, _elementRef: ElementRef);
    registerOnChange(fn: (value: any) => any): void;
    registerOnTouched(fn: () => any): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
}

export declare type ValidationErrors = {
    [key: string]: any;
};

export declare interface Validator {
    registerOnValidatorChange?(fn: () => void): void;
    validate(control: AbstractControl): ValidationErrors | null;
}

export declare interface ValidatorFn {
    (control: AbstractControl): ValidationErrors | null;
}

export declare class Validators {
    static compose(validators: null): null;
    static compose(validators: (ValidatorFn | null | undefined)[]): ValidatorFn | null;
    static composeAsync(validators: (AsyncValidatorFn | null)[]): AsyncValidatorFn | null;
    static email(control: AbstractControl): ValidationErrors | null;
    static max(max: number): ValidatorFn;
    static maxLength(maxLength: number): ValidatorFn;
    static min(min: number): ValidatorFn;
    static minLength(minLength: number): ValidatorFn;
    static nullValidator(control: AbstractControl): ValidationErrors | null;
    static pattern(pattern: string | RegExp): ValidatorFn;
    static required(control: AbstractControl): ValidationErrors | null;
    static requiredTrue(control: AbstractControl): ValidationErrors | null;
}

export declare const VERSION: Version;

export declare abstract class AbstractControl {
    validator: ValidatorFn;
    asyncValidator: AsyncValidatorFn;
    constructor(validator: ValidatorFn, asyncValidator: AsyncValidatorFn);
    value: any;
    status: string;
    valid: boolean;
    errors: {
        [key: string]: any;
    };
    pristine: boolean;
    dirty: boolean;
    touched: boolean;
    untouched: boolean;
    valueChanges: Observable<any>;
    statusChanges: Observable<any>;
    pending: boolean;
    setAsyncValidators(newValidator: AsyncValidatorFn | AsyncValidatorFn[]): void;
    clearAsyncValidators(): void;
    setValidators(newValidator: ValidatorFn | ValidatorFn[]): void;
    clearValidators(): void;
    markAsTouched(): void;
    markAsDirty({onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    markAsPending({onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    setParent(parent: FormGroup | FormArray): void;
    updateValueAndValidity({onlySelf, emitEvent}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    setErrors(errors: {
        [key: string]: any;
    }, {emitEvent}?: {
        emitEvent?: boolean;
    }): void;
    find(path: Array<string | number> | string): AbstractControl;
    getError(errorCode: string, path?: string[]): any;
    hasError(errorCode: string, path?: string[]): boolean;
    root: AbstractControl;
}

export declare abstract class AbstractControlDirective {
    control: AbstractControl;
    value: any;
    valid: boolean;
    errors: {
        [key: string]: any;
    };
    pristine: boolean;
    dirty: boolean;
    touched: boolean;
    untouched: boolean;
    path: string[];
}

export declare class CheckboxControlValueAccessor implements ControlValueAccessor {
    onChange: (_: any) => void;
    onTouched: () => void;
    constructor(_renderer: Renderer, _elementRef: ElementRef);
    writeValue(value: any): void;
    registerOnChange(fn: (_: any) => {}): void;
    registerOnTouched(fn: () => {}): void;
}

export declare class ControlContainer extends AbstractControlDirective {
    name: string;
    formDirective: Form;
    path: string[];
}

export interface ControlValueAccessor {
    writeValue(obj: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
}

export declare class DefaultValueAccessor implements ControlValueAccessor {
    onChange: (_: any) => void;
    onTouched: () => void;
    constructor(_renderer: Renderer, _elementRef: ElementRef);
    writeValue(value: any): void;
    registerOnChange(fn: (_: any) => void): void;
    registerOnTouched(fn: () => void): void;
}

export declare function disableDeprecatedForms(): any[];

export interface Form {
    addControl(dir: NgControl): void;
    removeControl(dir: NgControl): void;
    getControl(dir: NgControl): FormControl;
    addFormGroup(dir: AbstractFormGroupDirective): void;
    removeFormGroup(dir: AbstractFormGroupDirective): void;
    getFormGroup(dir: AbstractFormGroupDirective): FormGroup;
    updateModel(dir: NgControl, value: any): void;
}

export declare const FORM_DIRECTIVES: Type[];

export declare const FORM_PROVIDERS: Type[];

export declare class FormArray extends AbstractControl {
    controls: AbstractControl[];
    constructor(controls: AbstractControl[], validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn);
    at(index: number): AbstractControl;
    push(control: AbstractControl): void;
    insert(index: number, control: AbstractControl): void;
    removeAt(index: number): void;
    length: number;
}

export declare class FormBuilder {
    group(controlsConfig: {
        [key: string]: any;
    }, extra?: {
        [key: string]: any;
    }): FormGroup;
    control(value: Object, validator?: ValidatorFn | ValidatorFn[], asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[]): FormControl;
    array(controlsConfig: any[], validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn): FormArray;
}

export declare class FormControl extends AbstractControl {
    constructor(value?: any, validator?: ValidatorFn | ValidatorFn[], asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[]);
    updateValue(value: any, {onlySelf, emitEvent, emitModelToViewChange}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        emitModelToViewChange?: boolean;
    }): void;
    registerOnChange(fn: Function): void;
}

export declare class FormControlDirective extends NgControl implements OnChanges {
    viewModel: any;
    form: FormControl;
    model: any;
    update: EventEmitter<{}>;
    constructor(_validators: any[], _asyncValidators: any[], valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    path: string[];
    validator: ValidatorFn;
    asyncValidator: AsyncValidatorFn;
    control: FormControl;
    viewToModelUpdate(newValue: any): void;
}

export declare class FormControlName extends NgControl implements OnChanges, OnDestroy {
    name: string;
    model: any;
    update: EventEmitter<{}>;
    constructor(_parent: ControlContainer, _validators: any[], _asyncValidators: any[], valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    viewToModelUpdate(newValue: any): void;
    path: string[];
    formDirective: any;
    validator: ValidatorFn;
    asyncValidator: AsyncValidatorFn;
    control: FormControl;
}

export declare class FormGroup extends AbstractControl {
    controls: {
        [key: string]: AbstractControl;
    };
    constructor(controls: {
        [key: string]: AbstractControl;
    }, optionals?: {
        [key: string]: boolean;
    }, validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn);
    registerControl(name: string, control: AbstractControl): AbstractControl;
    addControl(name: string, control: AbstractControl): void;
    removeControl(name: string): void;
    include(controlName: string): void;
    exclude(controlName: string): void;
    contains(controlName: string): boolean;
}

export declare class FormGroupDirective extends ControlContainer implements Form, OnChanges {
    directives: NgControl[];
    form: FormGroup;
    ngSubmit: EventEmitter<{}>;
    constructor(_validators: any[], _asyncValidators: any[]);
    ngOnChanges(changes: SimpleChanges): void;
    submitted: boolean;
    formDirective: Form;
    control: FormGroup;
    path: string[];
    addControl(dir: NgControl): void;
    getControl(dir: NgControl): FormControl;
    removeControl(dir: NgControl): void;
    addFormGroup(dir: FormGroupName): void;
    removeFormGroup(dir: FormGroupName): void;
    getFormGroup(dir: FormGroupName): FormGroup;
    updateModel(dir: NgControl, value: any): void;
    onSubmit(): boolean;
}

export declare class FormGroupName extends AbstractFormGroupDirective implements OnInit, OnDestroy {
    name: string;
    constructor(parent: ControlContainer, validators: any[], asyncValidators: any[]);
}

export declare class MaxLengthValidator implements Validator {
    constructor(maxLength: string);
    validate(c: AbstractControl): {
        [key: string]: any;
    };
}

export declare class MinLengthValidator implements Validator {
    constructor(minLength: string);
    validate(c: AbstractControl): {
        [key: string]: any;
    };
}

export declare const NG_ASYNC_VALIDATORS: OpaqueToken;

export declare const NG_VALIDATORS: OpaqueToken;

export declare const NG_VALUE_ACCESSOR: OpaqueToken;

export declare abstract class NgControl extends AbstractControlDirective {
    name: string;
    valueAccessor: ControlValueAccessor;
    validator: ValidatorFn;
    asyncValidator: AsyncValidatorFn;
    abstract viewToModelUpdate(newValue: any): void;
}

export declare class NgControlStatus {
    constructor(cd: NgControl);
    ngClassUntouched: boolean;
    ngClassTouched: boolean;
    ngClassPristine: boolean;
    ngClassDirty: boolean;
    ngClassValid: boolean;
    ngClassInvalid: boolean;
}

export declare class NgForm extends ControlContainer implements Form {
    form: FormGroup;
    ngSubmit: EventEmitter<{}>;
    constructor(validators: any[], asyncValidators: any[]);
    submitted: boolean;
    formDirective: Form;
    control: FormGroup;
    path: string[];
    controls: {
        [key: string]: AbstractControl;
    };
    addControl(dir: NgModel): void;
    getControl(dir: NgModel): FormControl;
    removeControl(dir: NgModel): void;
    addFormGroup(dir: NgModelGroup): void;
    removeFormGroup(dir: NgModelGroup): void;
    getFormGroup(dir: NgModelGroup): FormGroup;
    updateModel(dir: NgControl, value: any): void;
    onSubmit(): boolean;
}

export declare class NgModel extends NgControl implements OnChanges, OnDestroy {
    viewModel: any;
    model: any;
    name: string;
    options: {
        name?: string;
        standalone?: boolean;
    };
    update: EventEmitter<{}>;
    constructor(_parent: ControlContainer, _validators: any[], _asyncValidators: any[], valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    control: FormControl;
    path: string[];
    formDirective: any;
    validator: ValidatorFn;
    asyncValidator: AsyncValidatorFn;
    viewToModelUpdate(newValue: any): void;
}

export declare class NgModelGroup extends AbstractFormGroupDirective implements OnInit, OnDestroy {
    name: string;
    constructor(parent: ControlContainer, validators: any[], asyncValidators: any[]);
}

export declare class NgSelectOption implements OnDestroy {
    id: string;
    constructor(_element: ElementRef, _renderer: Renderer, _select: SelectControlValueAccessor);
    ngValue: any;
    value: any;
    ngOnDestroy(): void;
}

export declare class PatternValidator implements Validator {
    constructor(pattern: string);
    validate(c: AbstractControl): {
        [key: string]: any;
    };
}

export declare function provideForms(): any[];

export declare const REACTIVE_FORM_DIRECTIVES: Type[];

export declare class RequiredValidator {
}

export declare class SelectControlValueAccessor implements ControlValueAccessor {
    value: any;
    onChange: (_: any) => void;
    onTouched: () => void;
    constructor(_renderer: Renderer, _elementRef: ElementRef);
    writeValue(value: any): void;
    registerOnChange(fn: (value: any) => any): void;
    registerOnTouched(fn: () => any): void;
}

export interface Validator {
    validate(c: AbstractControl): {
        [key: string]: any;
    };
}

export declare class Validators {
    static required(control: AbstractControl): {
        [key: string]: boolean;
    };
    static minLength(minLength: number): ValidatorFn;
    static maxLength(maxLength: number): ValidatorFn;
    static pattern(pattern: string): ValidatorFn;
    static nullValidator(c: AbstractControl): {
        [key: string]: boolean;
    };
    static compose(validators: ValidatorFn[]): ValidatorFn;
    static composeAsync(validators: AsyncValidatorFn[]): AsyncValidatorFn;
}

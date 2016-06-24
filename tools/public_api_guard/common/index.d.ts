export declare abstract class AbstractControl {
    asyncValidator: AsyncValidatorFn;
    dirty: boolean;
    errors: {
        [key: string]: any;
    };
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
    find(path: Array<string | number> | string): AbstractControl;
    getError(errorCode: string, path?: string[]): any;
    hasError(errorCode: string, path?: string[]): boolean;
    markAsDirty({onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    markAsPending({onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    markAsTouched(): void;
    setErrors(errors: {
        [key: string]: any;
    }, {emitEvent}?: {
        emitEvent?: boolean;
    }): void;
    setParent(parent: ControlGroup | ControlArray): void;
    updateValueAndValidity({onlySelf, emitEvent}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
}

export declare abstract class AbstractControlDirective {
    control: AbstractControl;
    dirty: boolean;
    errors: {
        [key: string]: any;
    };
    path: string[];
    pristine: boolean;
    touched: boolean;
    untouched: boolean;
    valid: boolean;
    value: any;
}

export declare const APP_BASE_HREF: OpaqueToken;

export declare class AsyncPipe implements OnDestroy {
    constructor(_ref: ChangeDetectorRef);
    ngOnDestroy(): void;
    transform(obj: Observable<any> | Promise<any> | EventEmitter<any>): any;
}

export declare class CheckboxControlValueAccessor implements ControlValueAccessor {
    onChange: (_: any) => void;
    onTouched: () => void;
    constructor(_renderer: Renderer, _elementRef: ElementRef);
    registerOnChange(fn: (_: any) => {}): void;
    registerOnTouched(fn: () => {}): void;
    writeValue(value: any): void;
}

export declare const COMMON_DIRECTIVES: Type[][];

export declare const COMMON_PIPES: (typeof AsyncPipe | typeof SlicePipe | typeof ReplacePipe | typeof I18nPluralPipe | typeof I18nSelectPipe)[];

export declare class Control extends AbstractControl {
    constructor(value?: any, validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn);
    registerOnChange(fn: Function): void;
    updateValue(value: any, {onlySelf, emitEvent, emitModelToViewChange}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        emitModelToViewChange?: boolean;
    }): void;
}

export declare class ControlArray extends AbstractControl {
    controls: AbstractControl[];
    length: number;
    constructor(controls: AbstractControl[], validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn);
    at(index: number): AbstractControl;
    insert(index: number, control: AbstractControl): void;
    push(control: AbstractControl): void;
    removeAt(index: number): void;
}

export declare class ControlContainer extends AbstractControlDirective {
    formDirective: Form;
    name: string;
    path: string[];
}

export declare class ControlGroup extends AbstractControl {
    controls: {
        [key: string]: AbstractControl;
    };
    constructor(controls: {
        [key: string]: AbstractControl;
    }, optionals?: {
        [key: string]: boolean;
    }, validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn);
    addControl(name: string, control: AbstractControl): void;
    contains(controlName: string): boolean;
    exclude(controlName: string): void;
    include(controlName: string): void;
    registerControl(name: string, control: AbstractControl): void;
    removeControl(name: string): void;
}

export interface ControlValueAccessor {
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    writeValue(obj: any): void;
}

export declare const CORE_DIRECTIVES: Type[];

export declare class CurrencyPipe implements PipeTransform {
    transform(value: any, currencyCode?: string, symbolDisplay?: boolean, digits?: string): string;
}

export declare class DatePipe implements PipeTransform {
    transform(value: any, pattern?: string): string;
}

export declare class DecimalPipe implements PipeTransform {
    transform(value: any, digits?: string): string;
}

export declare class DefaultValueAccessor implements ControlValueAccessor {
    onChange: (_: any) => void;
    onTouched: () => void;
    constructor(_renderer: Renderer, _elementRef: ElementRef);
    registerOnChange(fn: (_: any) => void): void;
    registerOnTouched(fn: () => void): void;
    writeValue(value: any): void;
}

export interface Form {
    addControl(dir: NgControl): void;
    addControlGroup(dir: NgControlGroup): void;
    getControl(dir: NgControl): Control;
    getControlGroup(dir: NgControlGroup): ControlGroup;
    removeControl(dir: NgControl): void;
    removeControlGroup(dir: NgControlGroup): void;
    updateModel(dir: NgControl, value: any): void;
}

export declare const FORM_DIRECTIVES: Type[];

export declare const FORM_PROVIDERS: Type[];

export declare class FormBuilder {
    array(controlsConfig: any[], validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn): ControlArray;
    control(value: Object, validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn): Control;
    group(controlsConfig: {
        [key: string]: any;
    }, extra?: {
        [key: string]: any;
    }): ControlGroup;
}

export declare class HashLocationStrategy extends LocationStrategy {
    constructor(_platformLocation: PlatformLocation, _baseHref?: string);
    back(): void;
    forward(): void;
    getBaseHref(): string;
    onPopState(fn: UrlChangeListener): void;
    path(): string;
    prepareExternalUrl(internal: string): string;
    pushState(state: any, title: string, path: string, queryParams: string): void;
    replaceState(state: any, title: string, path: string, queryParams: string): void;
}

export declare class I18nPluralPipe implements PipeTransform {
    constructor(_localization: NgLocalization);
    transform(value: number, pluralMap: {
        [count: string]: string;
    }): string;
}

export declare class I18nSelectPipe implements PipeTransform {
    transform(value: string, mapping: {
        [key: string]: string;
    }): string;
}

export declare class JsonPipe implements PipeTransform {
    transform(value: any): string;
}

export declare class Location {
    constructor(platformStrategy: LocationStrategy);
    back(): void;
    forward(): void;
    go(path: string, query?: string): void;
    isCurrentPathEqualTo(path: string, query?: string): boolean;
    normalize(url: string): string;
    path(): string;
    prepareExternalUrl(url: string): string;
    replaceState(path: string, query?: string): void;
    subscribe(onNext: (value: any) => void, onThrow?: (exception: any) => void, onReturn?: () => void): Object;
    static joinWithSlash(start: string, end: string): string;
    static normalizeQueryParams(params: string): string;
    static stripTrailingSlash(url: string): string;
}

export declare abstract class LocationStrategy {
    abstract back(): void;
    abstract forward(): void;
    abstract getBaseHref(): string;
    abstract onPopState(fn: UrlChangeListener): void;
    abstract path(): string;
    abstract prepareExternalUrl(internal: string): string;
    abstract pushState(state: any, title: string, url: string, queryParams: string): void;
    abstract replaceState(state: any, title: string, url: string, queryParams: string): void;
}

export declare class LowerCasePipe implements PipeTransform {
    transform(value: string): string;
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

export declare class NgClass implements DoCheck, OnDestroy {
    initialClasses: string;
    rawClass: string | string[] | Set<string> | {
        [key: string]: any;
    };
    constructor(_iterableDiffers: IterableDiffers, _keyValueDiffers: KeyValueDiffers, _ngEl: ElementRef, _renderer: Renderer);
    ngDoCheck(): void;
    ngOnDestroy(): void;
}

export declare abstract class NgControl extends AbstractControlDirective {
    asyncValidator: AsyncValidatorFn;
    name: string;
    validator: ValidatorFn;
    valueAccessor: ControlValueAccessor;
    abstract viewToModelUpdate(newValue: any): void;
}

export declare class NgControlGroup extends ControlContainer implements OnInit, OnDestroy {
    asyncValidator: AsyncValidatorFn;
    control: ControlGroup;
    formDirective: Form;
    path: string[];
    validator: ValidatorFn;
    constructor(parent: ControlContainer, _validators: any[], _asyncValidators: any[]);
    ngOnDestroy(): void;
    ngOnInit(): void;
}

export declare class NgControlName extends NgControl implements OnChanges, OnDestroy {
    asyncValidator: AsyncValidatorFn;
    control: Control;
    formDirective: any;
    model: any;
    path: string[];
    validator: ValidatorFn;
    viewModel: any;
    constructor(_parent: ControlContainer, _validators: any[], _asyncValidators: any[], valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    viewToModelUpdate(newValue: any): void;
}

export declare class NgControlStatus {
    ngClassDirty: boolean;
    ngClassInvalid: boolean;
    ngClassPristine: boolean;
    ngClassTouched: boolean;
    ngClassUntouched: boolean;
    ngClassValid: boolean;
    constructor(cd: NgControl);
}

export declare class NgFor implements DoCheck {
    ngForOf: any;
    ngForTemplate: TemplateRef<NgForRow>;
    ngForTrackBy: TrackByFn;
    constructor(_viewContainer: ViewContainerRef, _templateRef: TemplateRef<NgForRow>, _iterableDiffers: IterableDiffers, _cdr: ChangeDetectorRef);
    ngDoCheck(): void;
}

export declare class NgForm extends ControlContainer implements Form {
    control: ControlGroup;
    controls: {
        [key: string]: AbstractControl;
    };
    form: ControlGroup;
    formDirective: Form;
    ngSubmit: EventEmitter<{}>;
    path: string[];
    submitted: boolean;
    constructor(validators: any[], asyncValidators: any[]);
    addControl(dir: NgControl): void;
    addControlGroup(dir: NgControlGroup): void;
    getControl(dir: NgControl): Control;
    getControlGroup(dir: NgControlGroup): ControlGroup;
    onSubmit(): boolean;
    removeControl(dir: NgControl): void;
    removeControlGroup(dir: NgControlGroup): void;
    updateModel(dir: NgControl, value: any): void;
}

export declare class NgFormControl extends NgControl implements OnChanges {
    asyncValidator: AsyncValidatorFn;
    control: Control;
    form: Control;
    model: any;
    path: string[];
    update: EventEmitter<{}>;
    validator: ValidatorFn;
    viewModel: any;
    constructor(_validators: any[], _asyncValidators: any[], valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    viewToModelUpdate(newValue: any): void;
}

export declare class NgFormModel extends ControlContainer implements Form, OnChanges {
    control: ControlGroup;
    directives: NgControl[];
    form: ControlGroup;
    formDirective: Form;
    ngSubmit: EventEmitter<{}>;
    path: string[];
    submitted: boolean;
    constructor(_validators: any[], _asyncValidators: any[]);
    addControl(dir: NgControl): void;
    addControlGroup(dir: NgControlGroup): void;
    getControl(dir: NgControl): Control;
    getControlGroup(dir: NgControlGroup): ControlGroup;
    ngOnChanges(changes: SimpleChanges): void;
    onSubmit(): boolean;
    removeControl(dir: NgControl): void;
    removeControlGroup(dir: NgControlGroup): void;
    updateModel(dir: NgControl, value: any): void;
}

export declare class NgIf {
    ngIf: any;
    constructor(_viewContainer: ViewContainerRef, _templateRef: TemplateRef<Object>);
}

export declare abstract class NgLocalization {
    abstract getPluralCategory(value: any): string;
}

export declare class NgModel extends NgControl implements OnChanges {
    asyncValidator: AsyncValidatorFn;
    control: Control;
    model: any;
    path: string[];
    update: EventEmitter<{}>;
    validator: ValidatorFn;
    viewModel: any;
    constructor(_validators: any[], _asyncValidators: any[], valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    viewToModelUpdate(newValue: any): void;
}

export declare class NgPlural implements AfterContentInit {
    cases: QueryList<NgPluralCase>;
    ngPlural: number;
    constructor(_localization: NgLocalization);
    ngAfterContentInit(): void;
}

export declare class NgPluralCase {
    value: string;
    constructor(value: string, template: TemplateRef<Object>, viewContainer: ViewContainerRef);
}

export declare class NgSelectOption implements OnDestroy {
    id: string;
    ngValue: any;
    value: any;
    constructor(_element: ElementRef, _renderer: Renderer, _select: SelectControlValueAccessor);
    ngOnDestroy(): void;
}

export declare class NgStyle implements DoCheck {
    rawStyle: {
        [key: string]: string;
    };
    constructor(_differs: KeyValueDiffers, _ngEl: ElementRef, _renderer: Renderer);
    ngDoCheck(): void;
}

export declare class NgSwitch {
    ngSwitch: any;
}

export declare class NgSwitchCase {
    ngSwitchCase: any;
    ngSwitchWhen: any;
    constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<Object>, ngSwitch: NgSwitch);
}

export declare class NgSwitchDefault {
    constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<Object>, sswitch: NgSwitch);
}

export declare class NgTemplateOutlet {
    ngOutletContext: Object;
    ngTemplateOutlet: TemplateRef<Object>;
    constructor(_viewContainerRef: ViewContainerRef);
}

export declare class PathLocationStrategy extends LocationStrategy {
    constructor(_platformLocation: PlatformLocation, href?: string);
    back(): void;
    forward(): void;
    getBaseHref(): string;
    onPopState(fn: UrlChangeListener): void;
    path(): string;
    prepareExternalUrl(internal: string): string;
    pushState(state: any, title: string, url: string, queryParams: string): void;
    replaceState(state: any, title: string, url: string, queryParams: string): void;
}

export declare class PatternValidator implements Validator {
    constructor(pattern: string);
    validate(c: AbstractControl): {
        [key: string]: any;
    };
}

export declare class PercentPipe implements PipeTransform {
    transform(value: any, digits?: string): string;
}

export declare abstract class PlatformLocation {
    hash: string;
    pathname: string;
    search: string;
    abstract back(): void;
    abstract forward(): void;
    abstract getBaseHrefFromDOM(): string;
    abstract onHashChange(fn: UrlChangeListener): void;
    abstract onPopState(fn: UrlChangeListener): void;
    abstract pushState(state: any, title: string, url: string): void;
    abstract replaceState(state: any, title: string, url: string): void;
}

export declare class RadioButtonState {
    checked: boolean;
    value: string;
    constructor(checked: boolean, value: string);
}

export declare class ReplacePipe implements PipeTransform {
    transform(value: any, pattern: string | RegExp, replacement: Function | string): any;
}

export declare class RequiredValidator {
}

export declare class SelectControlValueAccessor implements ControlValueAccessor {
    onChange: (_: any) => void;
    onTouched: () => void;
    value: any;
    constructor(_renderer: Renderer, _elementRef: ElementRef);
    registerOnChange(fn: (value: any) => any): void;
    registerOnTouched(fn: () => any): void;
    writeValue(value: any): void;
}

export declare class SlicePipe implements PipeTransform {
    transform(value: any, start: number, end?: number): any;
}

export declare class UpperCasePipe implements PipeTransform {
    transform(value: string): string;
}

export interface UrlChangeEvent {
    type: string;
}

export interface UrlChangeListener {
    (e: UrlChangeEvent): any;
}

export interface Validator {
    validate(c: AbstractControl): {
        [key: string]: any;
    };
}

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

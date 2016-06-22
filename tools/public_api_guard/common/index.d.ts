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
    markAsTouched(): void;
    markAsDirty({onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    markAsPending({onlySelf}?: {
        onlySelf?: boolean;
    }): void;
    setParent(parent: ControlGroup | ControlArray): void;
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
    writeValue(value: any): void;
    registerOnChange(fn: (_: any) => {}): void;
    registerOnTouched(fn: () => {}): void;
}

export declare const COMMON_DIRECTIVES: Type[][];

export declare const COMMON_PIPES: (typeof AsyncPipe | typeof SlicePipe | typeof ReplacePipe | typeof I18nPluralPipe | typeof I18nSelectPipe)[];

export declare class Control extends AbstractControl {
    constructor(value?: any, validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn);
    updateValue(value: any, {onlySelf, emitEvent, emitModelToViewChange}?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        emitModelToViewChange?: boolean;
    }): void;
    registerOnChange(fn: Function): void;
}

export declare class ControlArray extends AbstractControl {
    controls: AbstractControl[];
    constructor(controls: AbstractControl[], validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn);
    at(index: number): AbstractControl;
    push(control: AbstractControl): void;
    insert(index: number, control: AbstractControl): void;
    removeAt(index: number): void;
    length: number;
}

export declare class ControlContainer extends AbstractControlDirective {
    name: string;
    formDirective: Form;
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
    registerControl(name: string, control: AbstractControl): void;
    addControl(name: string, control: AbstractControl): void;
    removeControl(name: string): void;
    include(controlName: string): void;
    exclude(controlName: string): void;
    contains(controlName: string): boolean;
}

export interface ControlValueAccessor {
    writeValue(obj: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
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
    writeValue(value: any): void;
    registerOnChange(fn: (_: any) => void): void;
    registerOnTouched(fn: () => void): void;
}

export interface Form {
    addControl(dir: NgControl): void;
    removeControl(dir: NgControl): void;
    getControl(dir: NgControl): Control;
    addControlGroup(dir: NgControlGroup): void;
    removeControlGroup(dir: NgControlGroup): void;
    getControlGroup(dir: NgControlGroup): ControlGroup;
    updateModel(dir: NgControl, value: any): void;
}

export declare const FORM_DIRECTIVES: Type[];

export declare const FORM_PROVIDERS: Type[];

export declare class FormBuilder {
    group(controlsConfig: {
        [key: string]: any;
    }, extra?: {
        [key: string]: any;
    }): ControlGroup;
    control(value: Object, validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn): Control;
    array(controlsConfig: any[], validator?: ValidatorFn, asyncValidator?: AsyncValidatorFn): ControlArray;
}

export declare class HashLocationStrategy extends LocationStrategy {
    constructor(_platformLocation: PlatformLocation, _baseHref?: string);
    onPopState(fn: UrlChangeListener): void;
    getBaseHref(): string;
    path(): string;
    prepareExternalUrl(internal: string): string;
    pushState(state: any, title: string, path: string, queryParams: string): void;
    replaceState(state: any, title: string, path: string, queryParams: string): void;
    forward(): void;
    back(): void;
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
    path(): string;
    isCurrentPathEqualTo(path: string, query?: string): boolean;
    normalize(url: string): string;
    prepareExternalUrl(url: string): string;
    go(path: string, query?: string): void;
    replaceState(path: string, query?: string): void;
    forward(): void;
    back(): void;
    subscribe(onNext: (value: any) => void, onThrow?: (exception: any) => void, onReturn?: () => void): Object;
    static normalizeQueryParams(params: string): string;
    static joinWithSlash(start: string, end: string): string;
    static stripTrailingSlash(url: string): string;
}

export declare abstract class LocationStrategy {
    abstract path(): string;
    abstract prepareExternalUrl(internal: string): string;
    abstract pushState(state: any, title: string, url: string, queryParams: string): void;
    abstract replaceState(state: any, title: string, url: string, queryParams: string): void;
    abstract forward(): void;
    abstract back(): void;
    abstract onPopState(fn: UrlChangeListener): void;
    abstract getBaseHref(): string;
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
    constructor(_iterableDiffers: IterableDiffers, _keyValueDiffers: KeyValueDiffers, _ngEl: ElementRef, _renderer: Renderer);
    initialClasses: string;
    rawClass: string | string[] | Set<string> | {
        [key: string]: any;
    };
    ngDoCheck(): void;
    ngOnDestroy(): void;
}

export declare abstract class NgControl extends AbstractControlDirective {
    name: string;
    valueAccessor: ControlValueAccessor;
    validator: ValidatorFn;
    asyncValidator: AsyncValidatorFn;
    abstract viewToModelUpdate(newValue: any): void;
}

export declare class NgControlGroup extends ControlContainer implements OnInit, OnDestroy {
    constructor(parent: ControlContainer, _validators: any[], _asyncValidators: any[]);
    ngOnInit(): void;
    ngOnDestroy(): void;
    control: ControlGroup;
    path: string[];
    formDirective: Form;
    validator: ValidatorFn;
    asyncValidator: AsyncValidatorFn;
}

export declare class NgControlName extends NgControl implements OnChanges, OnDestroy {
    model: any;
    viewModel: any;
    constructor(_parent: ControlContainer, _validators: any[], _asyncValidators: any[], valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    viewToModelUpdate(newValue: any): void;
    path: string[];
    formDirective: any;
    validator: ValidatorFn;
    asyncValidator: AsyncValidatorFn;
    control: Control;
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

export declare class NgFor implements DoCheck {
    constructor(_viewContainer: ViewContainerRef, _templateRef: TemplateRef<NgForRow>, _iterableDiffers: IterableDiffers, _cdr: ChangeDetectorRef);
    ngForOf: any;
    ngForTemplate: TemplateRef<NgForRow>;
    ngForTrackBy: TrackByFn;
    ngDoCheck(): void;
}

export declare class NgForm extends ControlContainer implements Form {
    form: ControlGroup;
    ngSubmit: EventEmitter<{}>;
    constructor(validators: any[], asyncValidators: any[]);
    submitted: boolean;
    formDirective: Form;
    control: ControlGroup;
    path: string[];
    controls: {
        [key: string]: AbstractControl;
    };
    addControl(dir: NgControl): void;
    getControl(dir: NgControl): Control;
    removeControl(dir: NgControl): void;
    addControlGroup(dir: NgControlGroup): void;
    removeControlGroup(dir: NgControlGroup): void;
    getControlGroup(dir: NgControlGroup): ControlGroup;
    updateModel(dir: NgControl, value: any): void;
    onSubmit(): boolean;
}

export declare class NgFormControl extends NgControl implements OnChanges {
    form: Control;
    update: EventEmitter<{}>;
    model: any;
    viewModel: any;
    constructor(_validators: any[], _asyncValidators: any[], valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    path: string[];
    validator: ValidatorFn;
    asyncValidator: AsyncValidatorFn;
    control: Control;
    viewToModelUpdate(newValue: any): void;
}

export declare class NgFormModel extends ControlContainer implements Form, OnChanges {
    form: ControlGroup;
    directives: NgControl[];
    ngSubmit: EventEmitter<{}>;
    constructor(_validators: any[], _asyncValidators: any[]);
    ngOnChanges(changes: SimpleChanges): void;
    submitted: boolean;
    formDirective: Form;
    control: ControlGroup;
    path: string[];
    addControl(dir: NgControl): void;
    getControl(dir: NgControl): Control;
    removeControl(dir: NgControl): void;
    addControlGroup(dir: NgControlGroup): void;
    removeControlGroup(dir: NgControlGroup): void;
    getControlGroup(dir: NgControlGroup): ControlGroup;
    updateModel(dir: NgControl, value: any): void;
    onSubmit(): boolean;
}

export declare class NgIf {
    constructor(_viewContainer: ViewContainerRef, _templateRef: TemplateRef<Object>);
    ngIf: any;
}

export declare abstract class NgLocalization {
    abstract getPluralCategory(value: any): string;
}

export declare class NgModel extends NgControl implements OnChanges {
    update: EventEmitter<{}>;
    model: any;
    viewModel: any;
    constructor(_validators: any[], _asyncValidators: any[], valueAccessors: ControlValueAccessor[]);
    ngOnChanges(changes: SimpleChanges): void;
    control: Control;
    path: string[];
    validator: ValidatorFn;
    asyncValidator: AsyncValidatorFn;
    viewToModelUpdate(newValue: any): void;
}

export declare class NgPlural implements AfterContentInit {
    cases: QueryList<NgPluralCase>;
    constructor(_localization: NgLocalization);
    ngPlural: number;
    ngAfterContentInit(): void;
}

export declare class NgPluralCase {
    value: string;
    constructor(value: string, template: TemplateRef<Object>, viewContainer: ViewContainerRef);
}

export declare class NgSelectOption implements OnDestroy {
    id: string;
    constructor(_element: ElementRef, _renderer: Renderer, _select: SelectControlValueAccessor);
    ngValue: any;
    value: any;
    ngOnDestroy(): void;
}

export declare class NgStyle implements DoCheck {
    constructor(_differs: KeyValueDiffers, _ngEl: ElementRef, _renderer: Renderer);
    rawStyle: {
        [key: string]: string;
    };
    ngDoCheck(): void;
}

export declare class NgSwitch {
    ngSwitch: any;
}

export declare class NgSwitchCase {
    constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<Object>, ngSwitch: NgSwitch);
    ngSwitchCase: any;
    ngSwitchWhen: any;
}

export declare class NgSwitchDefault {
    constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<Object>, sswitch: NgSwitch);
}

export declare class NgTemplateOutlet {
    constructor(_viewContainerRef: ViewContainerRef);
    ngOutletContext: Object;
    ngTemplateOutlet: TemplateRef<Object>;
}

export declare class PathLocationStrategy extends LocationStrategy {
    constructor(_platformLocation: PlatformLocation, href?: string);
    onPopState(fn: UrlChangeListener): void;
    getBaseHref(): string;
    prepareExternalUrl(internal: string): string;
    path(): string;
    pushState(state: any, title: string, url: string, queryParams: string): void;
    replaceState(state: any, title: string, url: string, queryParams: string): void;
    forward(): void;
    back(): void;
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
    abstract getBaseHrefFromDOM(): string;
    abstract onPopState(fn: UrlChangeListener): void;
    abstract onHashChange(fn: UrlChangeListener): void;
    pathname: string;
    search: string;
    hash: string;
    abstract replaceState(state: any, title: string, url: string): void;
    abstract pushState(state: any, title: string, url: string): void;
    abstract forward(): void;
    abstract back(): void;
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
    value: any;
    onChange: (_: any) => void;
    onTouched: () => void;
    constructor(_renderer: Renderer, _elementRef: ElementRef);
    writeValue(value: any): void;
    registerOnChange(fn: (value: any) => any): void;
    registerOnTouched(fn: () => any): void;
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

export declare abstract class _MatAutocompleteBase extends _MatAutocompleteMixinBase implements AfterContentInit, CanDisableRipple, OnDestroy {
    _classList: {
        [key: string]: boolean;
    };
    protected abstract _hiddenClass: string;
    _isOpen: boolean;
    _keyManager: ActiveDescendantKeyManager<_MatOptionBase>;
    protected abstract _visibleClass: string;
    ariaLabel: string;
    ariaLabelledby: string;
    get autoActiveFirstOption(): boolean;
    set autoActiveFirstOption(value: boolean);
    set classList(value: string | string[]);
    readonly closed: EventEmitter<void>;
    displayWith: ((value: any) => string) | null;
    id: string;
    readonly inertGroups: boolean;
    get isOpen(): boolean;
    readonly opened: EventEmitter<void>;
    readonly optionActivated: EventEmitter<MatAutocompleteActivatedEvent>;
    abstract optionGroups: QueryList<_MatOptgroupBase>;
    readonly optionSelected: EventEmitter<MatAutocompleteSelectedEvent>;
    abstract options: QueryList<_MatOptionBase>;
    panel: ElementRef;
    panelWidth: string | number;
    showPanel: boolean;
    template: TemplateRef<any>;
    constructor(_changeDetectorRef: ChangeDetectorRef, _elementRef: ElementRef<HTMLElement>, defaults: MatAutocompleteDefaultOptions, platform?: Platform);
    _emitSelectEvent(option: _MatOptionBase): void;
    _getPanelAriaLabelledby(labelId: string | null): string | null;
    _getScrollTop(): number;
    _setScrollTop(scrollTop: number): void;
    _setVisibility(): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_autoActiveFirstOption: BooleanInput;
    static ngAcceptInputType_disableRipple: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<_MatAutocompleteBase, never, never, { "ariaLabel": "aria-label"; "ariaLabelledby": "aria-labelledby"; "displayWith": "displayWith"; "autoActiveFirstOption": "autoActiveFirstOption"; "panelWidth": "panelWidth"; "classList": "class"; }, { "optionSelected": "optionSelected"; "opened": "opened"; "closed": "closed"; "optionActivated": "optionActivated"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<_MatAutocompleteBase, never>;
}

export declare abstract class _MatAutocompleteOriginBase {
    elementRef: ElementRef<HTMLElement>;
    constructor(
    elementRef: ElementRef<HTMLElement>);
    static ɵdir: i0.ɵɵDirectiveDeclaration<_MatAutocompleteOriginBase, never, never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<_MatAutocompleteOriginBase, never>;
}

export declare abstract class _MatAutocompleteTriggerBase implements ControlValueAccessor, AfterViewInit, OnChanges, OnDestroy {
    protected abstract _aboveClass: string;
    _onChange: (value: any) => void;
    _onTouched: () => void;
    get activeOption(): MatOption | null;
    autocomplete: _MatAutocompleteBase;
    autocompleteAttribute: string;
    get autocompleteDisabled(): boolean;
    set autocompleteDisabled(value: boolean);
    connectedTo: _MatAutocompleteOriginBase;
    readonly optionSelections: Observable<MatOptionSelectionChange>;
    get panelClosingActions(): Observable<MatOptionSelectionChange | null>;
    get panelOpen(): boolean;
    position: 'auto' | 'above' | 'below';
    constructor(_element: ElementRef<HTMLInputElement>, _overlay: Overlay, _viewContainerRef: ViewContainerRef, _zone: NgZone, _changeDetectorRef: ChangeDetectorRef, scrollStrategy: any, _dir: Directionality, _formField: MatFormField, _document: any, _viewportRuler: ViewportRuler, _defaults?: MatAutocompleteDefaultOptions | undefined);
    _handleFocus(): void;
    _handleInput(event: KeyboardEvent): void;
    _handleKeydown(event: KeyboardEvent): void;
    closePanel(): void;
    ngAfterViewInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    openPanel(): void;
    registerOnChange(fn: (value: any) => {}): void;
    registerOnTouched(fn: () => {}): void;
    setDisabledState(isDisabled: boolean): void;
    updatePosition(): void;
    writeValue(value: any): void;
    static ngAcceptInputType_autocompleteDisabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<_MatAutocompleteTriggerBase, never, never, { "autocomplete": "matAutocomplete"; "position": "matAutocompletePosition"; "connectedTo": "matAutocompleteConnectedTo"; "autocompleteAttribute": "autocomplete"; "autocompleteDisabled": "matAutocompleteDisabled"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<_MatAutocompleteTriggerBase, [null, null, null, null, null, null, { optional: true; }, { optional: true; host: true; }, { optional: true; }, null, { optional: true; }]>;
}

export declare function getMatAutocompleteMissingPanelError(): Error;

export declare const MAT_AUTOCOMPLETE_DEFAULT_OPTIONS: InjectionToken<MatAutocompleteDefaultOptions>;

export declare function MAT_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY(): MatAutocompleteDefaultOptions;

export declare const MAT_AUTOCOMPLETE_SCROLL_STRATEGY: InjectionToken<() => ScrollStrategy>;

export declare function MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy;

export declare const MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER: {
    provide: InjectionToken<() => ScrollStrategy>;
    deps: (typeof Overlay)[];
    useFactory: typeof MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY;
};

export declare const MAT_AUTOCOMPLETE_VALUE_ACCESSOR: any;

export declare class MatAutocomplete extends _MatAutocompleteBase {
    protected _hiddenClass: string;
    protected _visibleClass: string;
    optionGroups: QueryList<MatOptgroup>;
    options: QueryList<MatOption>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatAutocomplete, "mat-autocomplete", ["matAutocomplete"], { "disableRipple": "disableRipple"; }, {}, ["optionGroups", "options"], ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatAutocomplete, never>;
}

export interface MatAutocompleteActivatedEvent {
    option: _MatOptionBase | null;
    source: _MatAutocompleteBase;
}

export interface MatAutocompleteDefaultOptions {
    autoActiveFirstOption?: boolean;
    overlayPanelClass?: string | string[];
}

export declare class MatAutocompleteModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatAutocompleteModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatAutocompleteModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatAutocompleteModule, [typeof i1.MatAutocomplete, typeof i2.MatAutocompleteTrigger, typeof i3.MatAutocompleteOrigin], [typeof i4.OverlayModule, typeof i5.MatOptionModule, typeof i5.MatCommonModule, typeof i6.CommonModule], [typeof i1.MatAutocomplete, typeof i2.MatAutocompleteTrigger, typeof i3.MatAutocompleteOrigin, typeof i7.CdkScrollableModule, typeof i5.MatOptionModule, typeof i5.MatCommonModule]>;
}

export declare class MatAutocompleteOrigin extends _MatAutocompleteOriginBase {
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatAutocompleteOrigin, "[matAutocompleteOrigin]", ["matAutocompleteOrigin"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatAutocompleteOrigin, never>;
}

export declare class MatAutocompleteSelectedEvent {
    option: _MatOptionBase;
    source: _MatAutocompleteBase;
    constructor(
    source: _MatAutocompleteBase,
    option: _MatOptionBase);
}

export declare class MatAutocompleteTrigger extends _MatAutocompleteTriggerBase {
    protected _aboveClass: string;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatAutocompleteTrigger, "input[matAutocomplete], textarea[matAutocomplete]", ["matAutocompleteTrigger"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatAutocompleteTrigger, never>;
}

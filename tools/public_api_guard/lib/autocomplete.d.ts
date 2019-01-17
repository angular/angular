export declare const _MatAutocompleteMixinBase: CanDisableRippleCtor & typeof MatAutocompleteBase;

export declare const AUTOCOMPLETE_OPTION_HEIGHT = 48;

export declare const AUTOCOMPLETE_PANEL_HEIGHT = 256;

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

export declare class MatAutocomplete extends _MatAutocompleteMixinBase implements AfterContentInit, CanDisableRipple {
    _classList: {
        [key: string]: boolean;
    };
    _isOpen: boolean;
    _keyManager: ActiveDescendantKeyManager<MatOption>;
    autoActiveFirstOption: boolean;
    classList: string;
    readonly closed: EventEmitter<void>;
    displayWith: ((value: any) => string) | null;
    id: string;
    readonly isOpen: boolean;
    readonly opened: EventEmitter<void>;
    optionGroups: QueryList<MatOptgroup>;
    readonly optionSelected: EventEmitter<MatAutocompleteSelectedEvent>;
    options: QueryList<MatOption>;
    panel: ElementRef;
    panelWidth: string | number;
    showPanel: boolean;
    template: TemplateRef<any>;
    constructor(_changeDetectorRef: ChangeDetectorRef, _elementRef: ElementRef<HTMLElement>, defaults: MatAutocompleteDefaultOptions);
    _emitSelectEvent(option: MatOption): void;
    _getScrollTop(): number;
    _setScrollTop(scrollTop: number): void;
    _setVisibility(): void;
    ngAfterContentInit(): void;
}

export declare class MatAutocompleteBase {
}

export interface MatAutocompleteDefaultOptions {
    autoActiveFirstOption?: boolean;
}

export declare class MatAutocompleteModule {
}

export declare class MatAutocompleteOrigin {
    elementRef: ElementRef<HTMLElement>;
    constructor(
    elementRef: ElementRef<HTMLElement>);
}

export declare class MatAutocompleteSelectedEvent {
    option: MatOption;
    source: MatAutocomplete;
    constructor(
    source: MatAutocomplete,
    option: MatOption);
}

export declare class MatAutocompleteTrigger implements ControlValueAccessor, OnDestroy {
    _onChange: (value: any) => void;
    _onTouched: () => void;
    readonly activeOption: MatOption | null;
    autocomplete: MatAutocomplete;
    autocompleteAttribute: string;
    autocompleteDisabled: boolean;
    connectedTo: MatAutocompleteOrigin;
    readonly optionSelections: Observable<MatOptionSelectionChange>;
    readonly panelClosingActions: Observable<MatOptionSelectionChange | null>;
    readonly panelOpen: boolean;
    constructor(_element: ElementRef<HTMLInputElement>, _overlay: Overlay, _viewContainerRef: ViewContainerRef, _zone: NgZone, _changeDetectorRef: ChangeDetectorRef, scrollStrategy: any, _dir: Directionality, _formField: MatFormField, _document: any, _viewportRuler?: ViewportRuler | undefined);
    _handleFocus(): void;
    _handleInput(event: KeyboardEvent): void;
    _handleKeydown(event: KeyboardEvent): void;
    closePanel(): void;
    ngOnDestroy(): void;
    openPanel(): void;
    registerOnChange(fn: (value: any) => {}): void;
    registerOnTouched(fn: () => {}): void;
    setDisabledState(isDisabled: boolean): void;
    updatePosition(): void;
    writeValue(value: any): void;
}

export declare const EXPANSION_PANEL_ANIMATION_TIMING = "225ms cubic-bezier(0.4,0.0,0.2,1)";

export declare const MAT_ACCORDION: InjectionToken<MatAccordionBase>;

export declare const MAT_EXPANSION_PANEL_DEFAULT_OPTIONS: InjectionToken<MatExpansionPanelDefaultOptions>;

export declare class MatAccordion extends CdkAccordion implements MatAccordionBase, AfterContentInit {
    _headers: QueryList<MatExpansionPanelHeader>;
    displayMode: MatAccordionDisplayMode;
    hideToggle: boolean;
    _handleHeaderFocus(header: MatExpansionPanelHeader): void;
    _handleHeaderKeydown(event: KeyboardEvent): void;
    ngAfterContentInit(): void;
}

export interface MatAccordionBase extends CdkAccordion {
    _handleHeaderFocus: (header: any) => void;
    _handleHeaderKeydown: (event: KeyboardEvent) => void;
    displayMode: MatAccordionDisplayMode;
    hideToggle: boolean;
}

export declare type MatAccordionDisplayMode = 'default' | 'flat';

export declare const matExpansionAnimations: {
    readonly indicatorRotate: AnimationTriggerMetadata;
    readonly expansionHeaderHeight: AnimationTriggerMetadata;
    readonly bodyExpansion: AnimationTriggerMetadata;
};

export declare class MatExpansionModule {
}

export declare class MatExpansionPanel extends CdkAccordionItem implements AfterContentInit, OnChanges, OnDestroy {
    _animationMode?: string | undefined;
    _body: ElementRef<HTMLElement>;
    _bodyAnimationDone: Subject<AnimationEvent>;
    _headerId: string;
    readonly _inputChanges: Subject<SimpleChanges>;
    _lazyContent: MatExpansionPanelContent;
    _portal: TemplatePortal;
    accordion: MatAccordionBase;
    afterCollapse: EventEmitter<void>;
    afterExpand: EventEmitter<void>;
    hideToggle: boolean;
    constructor(accordion: MatAccordionBase, _changeDetectorRef: ChangeDetectorRef, _uniqueSelectionDispatcher: UniqueSelectionDispatcher, _viewContainerRef: ViewContainerRef, _document?: any, _animationMode?: string | undefined, defaultOptions?: MatExpansionPanelDefaultOptions);
    _containsFocus(): boolean;
    _getExpandedState(): MatExpansionPanelState;
    _hasSpacing(): boolean;
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
}

export declare class MatExpansionPanelActionRow {
}

export declare class MatExpansionPanelContent {
    _template: TemplateRef<any>;
    constructor(_template: TemplateRef<any>);
}

export interface MatExpansionPanelDefaultOptions {
    collapsedHeight: string;
    expandedHeight: string;
    hideToggle: boolean;
}

export declare class MatExpansionPanelDescription {
}

export declare class MatExpansionPanelHeader implements OnDestroy, FocusableOption {
    collapsedHeight: string;
    readonly disabled: any;
    expandedHeight: string;
    panel: MatExpansionPanel;
    constructor(panel: MatExpansionPanel, _element: ElementRef, _focusMonitor: FocusMonitor, _changeDetectorRef: ChangeDetectorRef, defaultOptions?: MatExpansionPanelDefaultOptions);
    _getExpandedState(): string;
    _getPanelId(): string;
    _isExpanded(): boolean;
    _keydown(event: KeyboardEvent): void;
    _showToggle(): boolean;
    _toggle(): void;
    focus(origin?: FocusOrigin): void;
    ngOnDestroy(): void;
}

export declare type MatExpansionPanelState = 'expanded' | 'collapsed';

export declare class MatExpansionPanelTitle {
}

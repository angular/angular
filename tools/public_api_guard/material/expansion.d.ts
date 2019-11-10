export declare const EXPANSION_PANEL_ANIMATION_TIMING = "225ms cubic-bezier(0.4,0.0,0.2,1)";

export declare const MAT_ACCORDION: InjectionToken<MatAccordionBase>;

export declare const MAT_EXPANSION_PANEL_DEFAULT_OPTIONS: InjectionToken<MatExpansionPanelDefaultOptions>;

export declare class MatAccordion extends CdkAccordion implements MatAccordionBase, AfterContentInit {
    _headers: QueryList<MatExpansionPanelHeader>;
    displayMode: MatAccordionDisplayMode;
    hideToggle: boolean;
    togglePosition: MatAccordionTogglePosition;
    _handleHeaderFocus(header: MatExpansionPanelHeader): void;
    _handleHeaderKeydown(event: KeyboardEvent): void;
    ngAfterContentInit(): void;
    static ngAcceptInputType_hideToggle: boolean | string | null | undefined;
    static ngAcceptInputType_multi: boolean | string | null | undefined;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatAccordion, "mat-accordion", ["matAccordion"], { 'multi': "multi", 'hideToggle': "hideToggle", 'displayMode': "displayMode", 'togglePosition': "togglePosition" }, {}, ["_headers"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatAccordion>;
}

export interface MatAccordionBase extends CdkAccordion {
    _handleHeaderFocus: (header: any) => void;
    _handleHeaderKeydown: (event: KeyboardEvent) => void;
    displayMode: MatAccordionDisplayMode;
    hideToggle: boolean;
    togglePosition: MatAccordionTogglePosition;
}

export declare type MatAccordionDisplayMode = 'default' | 'flat';

export declare type MatAccordionTogglePosition = 'before' | 'after';

export declare const matExpansionAnimations: {
    readonly indicatorRotate: AnimationTriggerMetadata;
    readonly expansionHeaderHeight: AnimationTriggerMetadata;
    readonly bodyExpansion: AnimationTriggerMetadata;
};

export declare class MatExpansionModule {
    static ɵinj: i0.ɵɵInjectorDef<MatExpansionModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatExpansionModule, [typeof i1.MatAccordion, typeof i2.MatExpansionPanel, typeof i2.MatExpansionPanelActionRow, typeof i3.MatExpansionPanelHeader, typeof i3.MatExpansionPanelTitle, typeof i3.MatExpansionPanelDescription, typeof i4.MatExpansionPanelContent], [typeof i5.CommonModule, typeof i6.CdkAccordionModule, typeof i7.PortalModule], [typeof i1.MatAccordion, typeof i2.MatExpansionPanel, typeof i2.MatExpansionPanelActionRow, typeof i3.MatExpansionPanelHeader, typeof i3.MatExpansionPanelTitle, typeof i3.MatExpansionPanelDescription, typeof i4.MatExpansionPanelContent]>;
}

export declare class MatExpansionPanel extends CdkAccordionItem implements AfterContentInit, OnChanges, OnDestroy {
    _animationMode: string;
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
    togglePosition: MatAccordionTogglePosition;
    constructor(accordion: MatAccordionBase, _changeDetectorRef: ChangeDetectorRef, _uniqueSelectionDispatcher: UniqueSelectionDispatcher, _viewContainerRef: ViewContainerRef, _document: any, _animationMode: string, defaultOptions?: MatExpansionPanelDefaultOptions);
    _containsFocus(): boolean;
    _getExpandedState(): MatExpansionPanelState;
    _hasSpacing(): boolean;
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_disabled: boolean | string | null | undefined;
    static ngAcceptInputType_expanded: boolean | string | null | undefined;
    static ngAcceptInputType_hideToggle: boolean | string | null | undefined;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatExpansionPanel, "mat-expansion-panel", ["matExpansionPanel"], { 'disabled': "disabled", 'expanded': "expanded", 'hideToggle': "hideToggle", 'togglePosition': "togglePosition" }, { 'opened': "opened", 'closed': "closed", 'expandedChange': "expandedChange", 'afterExpand': "afterExpand", 'afterCollapse': "afterCollapse" }, ["_lazyContent"]>;
    static ɵfac: i0.ɵɵFactoryDef<MatExpansionPanel>;
}

export declare class MatExpansionPanelActionRow {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatExpansionPanelActionRow, "mat-action-row", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatExpansionPanelActionRow>;
}

export declare class MatExpansionPanelContent {
    _template: TemplateRef<any>;
    constructor(_template: TemplateRef<any>);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatExpansionPanelContent, "ng-template[matExpansionPanelContent]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatExpansionPanelContent>;
}

export interface MatExpansionPanelDefaultOptions {
    collapsedHeight: string;
    expandedHeight: string;
    hideToggle: boolean;
}

export declare class MatExpansionPanelDescription {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatExpansionPanelDescription, "mat-panel-description", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatExpansionPanelDescription>;
}

export declare class MatExpansionPanelHeader implements OnDestroy, FocusableOption {
    _animationsDisabled: boolean;
    collapsedHeight: string;
    readonly disabled: any;
    expandedHeight: string;
    panel: MatExpansionPanel;
    constructor(panel: MatExpansionPanel, _element: ElementRef, _focusMonitor: FocusMonitor, _changeDetectorRef: ChangeDetectorRef, defaultOptions?: MatExpansionPanelDefaultOptions);
    _animationStarted(): void;
    _getExpandedState(): string;
    _getPanelId(): string;
    _getTogglePosition(): MatAccordionTogglePosition;
    _isExpanded(): boolean;
    _keydown(event: KeyboardEvent): void;
    _showToggle(): boolean;
    _toggle(): void;
    focus(origin?: FocusOrigin, options?: FocusOptions): void;
    ngOnDestroy(): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatExpansionPanelHeader, "mat-expansion-panel-header", never, { 'expandedHeight': "expandedHeight", 'collapsedHeight': "collapsedHeight" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatExpansionPanelHeader>;
}

export declare type MatExpansionPanelState = 'expanded' | 'collapsed';

export declare class MatExpansionPanelTitle {
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatExpansionPanelTitle, "mat-panel-title", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatExpansionPanelTitle>;
}

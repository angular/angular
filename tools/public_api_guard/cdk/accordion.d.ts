export declare class CdkAccordion implements OnDestroy, OnChanges {
    readonly _openCloseAllActions: Subject<boolean>;
    readonly _stateChanges: Subject<SimpleChanges>;
    readonly id: string;
    get multi(): boolean;
    set multi(multi: boolean);
    closeAll(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    openAll(): void;
    static ngAcceptInputType_multi: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkAccordion, "cdk-accordion, [cdkAccordion]", ["cdkAccordion"], { "multi": "multi"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkAccordion, never>;
}

export declare class CdkAccordionItem implements OnDestroy {
    protected _expansionDispatcher: UniqueSelectionDispatcher;
    accordion: CdkAccordion;
    readonly closed: EventEmitter<void>;
    readonly destroyed: EventEmitter<void>;
    get disabled(): boolean;
    set disabled(disabled: boolean);
    get expanded(): boolean;
    set expanded(expanded: boolean);
    readonly expandedChange: EventEmitter<boolean>;
    readonly id: string;
    readonly opened: EventEmitter<void>;
    constructor(accordion: CdkAccordion, _changeDetectorRef: ChangeDetectorRef, _expansionDispatcher: UniqueSelectionDispatcher);
    close(): void;
    ngOnDestroy(): void;
    open(): void;
    toggle(): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_expanded: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CdkAccordionItem, "cdk-accordion-item, [cdkAccordionItem]", ["cdkAccordionItem"], { "expanded": "expanded"; "disabled": "disabled"; }, { "closed": "closed"; "opened": "opened"; "destroyed": "destroyed"; "expandedChange": "expandedChange"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkAccordionItem, [{ optional: true; skipSelf: true; }, null, null]>;
}

export declare class CdkAccordionModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<CdkAccordionModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<CdkAccordionModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<CdkAccordionModule, [typeof i1.CdkAccordion, typeof i2.CdkAccordionItem], never, [typeof i1.CdkAccordion, typeof i2.CdkAccordionItem]>;
}

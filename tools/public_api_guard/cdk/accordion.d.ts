export declare class CdkAccordion implements OnDestroy, OnChanges {
    readonly _openCloseAllActions: Subject<boolean>;
    readonly _stateChanges: Subject<SimpleChanges>;
    readonly id: string;
    multi: boolean;
    closeAll(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    openAll(): void;
    static ngAcceptInputType_multi: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkAccordion, "cdk-accordion, [cdkAccordion]", ["cdkAccordion"], { 'multi': "multi" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkAccordion>;
}

export declare class CdkAccordionItem implements OnDestroy {
    protected _expansionDispatcher: UniqueSelectionDispatcher;
    accordion: CdkAccordion;
    closed: EventEmitter<void>;
    destroyed: EventEmitter<void>;
    disabled: any;
    expanded: any;
    expandedChange: EventEmitter<boolean>;
    readonly id: string;
    opened: EventEmitter<void>;
    constructor(accordion: CdkAccordion, _changeDetectorRef: ChangeDetectorRef, _expansionDispatcher: UniqueSelectionDispatcher);
    close(): void;
    ngOnDestroy(): void;
    open(): void;
    toggle(): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_expanded: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkAccordionItem, "cdk-accordion-item, [cdkAccordionItem]", ["cdkAccordionItem"], { 'expanded': "expanded", 'disabled': "disabled" }, { 'closed': "closed", 'opened': "opened", 'destroyed': "destroyed", 'expandedChange': "expandedChange" }, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkAccordionItem>;
}

export declare class CdkAccordionModule {
    static ɵinj: i0.ɵɵInjectorDef<CdkAccordionModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<CdkAccordionModule, [typeof i1.CdkAccordion, typeof i2.CdkAccordionItem], never, [typeof i1.CdkAccordion, typeof i2.CdkAccordionItem]>;
}

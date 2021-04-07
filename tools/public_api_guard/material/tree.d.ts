export declare class MatNestedTreeNode<T, K = T> extends CdkNestedTreeNode<T, K> implements AfterContentInit, DoCheck, OnDestroy, OnInit {
    protected _differs: IterableDiffers;
    protected _elementRef: ElementRef<HTMLElement>;
    protected _tree: CdkTree<T, K>;
    get disabled(): any;
    set disabled(value: any);
    node: T;
    get tabIndex(): number;
    set tabIndex(value: number);
    constructor(_elementRef: ElementRef<HTMLElement>, _tree: CdkTree<T, K>, _differs: IterableDiffers, tabIndex: string);
    ngAfterContentInit(): void;
    ngDoCheck(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatNestedTreeNode<any, any>, "mat-nested-tree-node", ["matNestedTreeNode"], { "role": "role"; "disabled": "disabled"; "tabIndex": "tabIndex"; "node": "matNestedTreeNode"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatNestedTreeNode<any, any>, [null, null, null, { attribute: "tabindex"; }]>;
}

export declare class MatTree<T, K = T> extends CdkTree<T, K> {
    _nodeOutlet: MatTreeNodeOutlet;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatTree<any, any>, "mat-tree", ["matTree"], {}, {}, never, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTree<any, any>, never>;
}

export declare class MatTreeFlatDataSource<T, F, K = F> extends DataSource<F> {
    readonly _data: BehaviorSubject<T[]>;
    readonly _expandedData: BehaviorSubject<F[]>;
    readonly _flattenedData: BehaviorSubject<F[]>;
    get data(): T[];
    set data(value: T[]);
    constructor(_treeControl: FlatTreeControl<F, K>, _treeFlattener: MatTreeFlattener<T, F, K>, initialData?: T[]);
    connect(collectionViewer: CollectionViewer): Observable<F[]>;
    disconnect(): void;
}

export declare class MatTreeFlattener<T, F, K = F> {
    getChildren: (node: T) => Observable<T[]> | T[] | undefined | null;
    getLevel: (node: F) => number;
    isExpandable: (node: F) => boolean;
    transformFunction: (node: T, level: number) => F;
    constructor(transformFunction: (node: T, level: number) => F, getLevel: (node: F) => number, isExpandable: (node: F) => boolean, getChildren: (node: T) => Observable<T[]> | T[] | undefined | null);
    _flattenChildren(children: T[], level: number, resultNodes: F[], parentMap: boolean[]): void;
    _flattenNode(node: T, level: number, resultNodes: F[], parentMap: boolean[]): F[];
    expandFlattenedNodes(nodes: F[], treeControl: TreeControl<F, K>): F[];
    flattenNodes(structuredData: T[]): F[];
}

export declare class MatTreeModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTreeModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MatTreeModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MatTreeModule, [typeof i1.MatNestedTreeNode, typeof i1.MatTreeNodeDef, typeof i2.MatTreeNodePadding, typeof i3.MatTreeNodeToggle, typeof i4.MatTree, typeof i1.MatTreeNode, typeof i5.MatTreeNodeOutlet], [typeof i6.CdkTreeModule, typeof i7.MatCommonModule], [typeof i7.MatCommonModule, typeof i1.MatNestedTreeNode, typeof i1.MatTreeNodeDef, typeof i2.MatTreeNodePadding, typeof i3.MatTreeNodeToggle, typeof i4.MatTree, typeof i1.MatTreeNode, typeof i5.MatTreeNodeOutlet]>;
}

export declare class MatTreeNestedDataSource<T> extends DataSource<T> {
    readonly _data: BehaviorSubject<T[]>;
    get data(): T[];
    set data(value: T[]);
    connect(collectionViewer: CollectionViewer): Observable<T[]>;
    disconnect(): void;
}

export declare class MatTreeNode<T, K = T> extends _MatTreeNodeMixinBase<T, K> implements CanDisable, DoCheck, HasTabIndex, OnInit, OnDestroy {
    protected _elementRef: ElementRef<HTMLElement>;
    protected _tree: CdkTree<T, K>;
    constructor(_elementRef: ElementRef<HTMLElement>, _tree: CdkTree<T, K>, tabIndex: string);
    ngDoCheck(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_tabIndex: NumberInput;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatTreeNode<any, any>, "mat-tree-node", ["matTreeNode"], { "role": "role"; "disabled": "disabled"; "tabIndex": "tabIndex"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTreeNode<any, any>, [null, null, { attribute: "tabindex"; }]>;
}

export declare class MatTreeNodeDef<T> extends CdkTreeNodeDef<T> {
    data: T;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatTreeNodeDef<any>, "[matTreeNodeDef]", never, { "when": "matTreeNodeDefWhen"; "data": "matTreeNode"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTreeNodeDef<any>, never>;
}

export declare class MatTreeNodeOutlet implements CdkTreeNodeOutlet {
    _node?: any;
    viewContainer: ViewContainerRef;
    constructor(viewContainer: ViewContainerRef, _node?: any);
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatTreeNodeOutlet, "[matTreeNodeOutlet]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTreeNodeOutlet, [null, { optional: true; }]>;
}

export declare class MatTreeNodePadding<T, K = T> extends CdkTreeNodePadding<T, K> {
    get indent(): number | string;
    set indent(indent: number | string);
    get level(): number;
    set level(value: number);
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatTreeNodePadding<any, any>, "[matTreeNodePadding]", never, { "level": "matTreeNodePadding"; "indent": "matTreeNodePaddingIndent"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTreeNodePadding<any, any>, never>;
}

export declare class MatTreeNodeToggle<T, K = T> extends CdkTreeNodeToggle<T, K> {
    get recursive(): boolean;
    set recursive(value: boolean);
    static ɵdir: i0.ɵɵDirectiveDeclaration<MatTreeNodeToggle<any, any>, "[matTreeNodeToggle]", never, { "recursive": "matTreeNodeToggleRecursive"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatTreeNodeToggle<any, any>, never>;
}

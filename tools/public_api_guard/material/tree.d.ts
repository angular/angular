export declare class MatNestedTreeNode<T> extends CdkNestedTreeNode<T> implements AfterContentInit, OnDestroy {
    protected _differs: IterableDiffers;
    protected _elementRef: ElementRef<HTMLElement>;
    protected _tree: CdkTree<T>;
    disabled: any;
    node: T;
    tabIndex: number;
    constructor(_elementRef: ElementRef<HTMLElement>, _tree: CdkTree<T>, _differs: IterableDiffers, tabIndex: string);
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_disabled: boolean | string | null | undefined;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatNestedTreeNode<any>, "mat-nested-tree-node", ["matNestedTreeNode"], { 'node': "matNestedTreeNode", 'disabled': "disabled", 'tabIndex': "tabIndex" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatNestedTreeNode<any>>;
}

export declare class MatTree<T> extends CdkTree<T> {
    _nodeOutlet: MatTreeNodeOutlet;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MatTree<any>, "mat-tree", ["matTree"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatTree<any>>;
}

export declare class MatTreeFlatDataSource<T, F> extends DataSource<F> {
    _data: BehaviorSubject<T[]>;
    _expandedData: BehaviorSubject<F[]>;
    _flattenedData: BehaviorSubject<F[]>;
    data: T[];
    constructor(_treeControl: FlatTreeControl<F>, _treeFlattener: MatTreeFlattener<T, F>, initialData?: T[]);
    connect(collectionViewer: CollectionViewer): Observable<F[]>;
    disconnect(): void;
}

export declare class MatTreeFlattener<T, F> {
    getChildren: (node: T) => Observable<T[]> | T[] | undefined | null;
    getLevel: (node: F) => number;
    isExpandable: (node: F) => boolean;
    transformFunction: (node: T, level: number) => F;
    constructor(transformFunction: (node: T, level: number) => F, getLevel: (node: F) => number, isExpandable: (node: F) => boolean, getChildren: (node: T) => Observable<T[]> | T[] | undefined | null);
    _flattenChildren(children: T[], level: number, resultNodes: F[], parentMap: boolean[]): void;
    _flattenNode(node: T, level: number, resultNodes: F[], parentMap: boolean[]): F[];
    expandFlattenedNodes(nodes: F[], treeControl: TreeControl<F>): F[];
    flattenNodes(structuredData: T[]): F[];
}

export declare class MatTreeModule {
    static ɵinj: i0.ɵɵInjectorDef<MatTreeModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatTreeModule, [typeof i1.MatNestedTreeNode, typeof i1.MatTreeNodeDef, typeof i2.MatTreeNodePadding, typeof i3.MatTreeNodeToggle, typeof i4.MatTree, typeof i1.MatTreeNode, typeof i5.MatTreeNodeOutlet], [typeof i6.CdkTreeModule, typeof i7.CommonModule, typeof i8.MatCommonModule], [typeof i1.MatNestedTreeNode, typeof i1.MatTreeNodeDef, typeof i2.MatTreeNodePadding, typeof i3.MatTreeNodeToggle, typeof i4.MatTree, typeof i1.MatTreeNode, typeof i5.MatTreeNodeOutlet]>;
}

export declare class MatTreeNestedDataSource<T> extends DataSource<T> {
    _data: BehaviorSubject<T[]>;
    data: T[];
    connect(collectionViewer: CollectionViewer): Observable<T[]>;
    disconnect(): void;
}

export declare class MatTreeNode<T> extends _MatTreeNodeMixinBase<T> implements CanDisable, HasTabIndex {
    protected _elementRef: ElementRef<HTMLElement>;
    protected _tree: CdkTree<T>;
    role: 'treeitem' | 'group';
    constructor(_elementRef: ElementRef<HTMLElement>, _tree: CdkTree<T>, tabIndex: string);
    static ngAcceptInputType_disabled: boolean | string | null | undefined;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatTreeNode<any>, "mat-tree-node", ["matTreeNode"], { 'disabled': "disabled", 'tabIndex': "tabIndex", 'role': "role" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatTreeNode<any>>;
}

export declare class MatTreeNodeDef<T> extends CdkTreeNodeDef<T> {
    data: T;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatTreeNodeDef<any>, "[matTreeNodeDef]", never, { 'when': "matTreeNodeDefWhen", 'data': "matTreeNode" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatTreeNodeDef<any>>;
}

export declare class MatTreeNodeOutlet implements CdkTreeNodeOutlet {
    _node?: any;
    viewContainer: ViewContainerRef;
    constructor(viewContainer: ViewContainerRef, _node?: any);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatTreeNodeOutlet, "[matTreeNodeOutlet]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatTreeNodeOutlet>;
}

export declare class MatTreeNodePadding<T> extends CdkTreeNodePadding<T> {
    indent: number;
    level: number;
    static ngAcceptInputType_level: number | string | null | undefined;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatTreeNodePadding<any>, "[matTreeNodePadding]", never, { 'level': "matTreeNodePadding", 'indent': "matTreeNodePaddingIndent" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatTreeNodePadding<any>>;
}

export declare class MatTreeNodeToggle<T> extends CdkTreeNodeToggle<T> {
    recursive: boolean;
    static ngAcceptInputType_recursive: boolean | string | null | undefined;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MatTreeNodeToggle<any>, "[matTreeNodeToggle]", never, { 'recursive': "matTreeNodeToggleRecursive" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<MatTreeNodeToggle<any>>;
}

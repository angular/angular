export declare const _MatNestedTreeNodeMixinBase: HasTabIndexCtor & CanDisableCtor & typeof CdkNestedTreeNode;

export declare const _MatTreeNodeMixinBase: HasTabIndexCtor & CanDisableCtor & typeof CdkTreeNode;

export declare class MatNestedTreeNode<T> extends _MatNestedTreeNodeMixinBase<T> implements AfterContentInit, CanDisable, HasTabIndex, OnDestroy {
    protected _differs: IterableDiffers;
    protected _elementRef: ElementRef<HTMLElement>;
    protected _tree: CdkTree<T>;
    node: T;
    nodeOutlet: QueryList<MatTreeNodeOutlet>;
    constructor(_elementRef: ElementRef<HTMLElement>, _tree: CdkTree<T>, _differs: IterableDiffers, tabIndex: string);
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
}

export declare class MatTree<T> extends CdkTree<T> {
    _nodeOutlet: MatTreeNodeOutlet;
}

export declare class MatTreeFlatDataSource<T, F> extends DataSource<F> {
    _data: BehaviorSubject<T[]>;
    _expandedData: BehaviorSubject<F[]>;
    _flattenedData: BehaviorSubject<F[]>;
    data: T[];
    constructor(treeControl: FlatTreeControl<F>, treeFlattener: MatTreeFlattener<T, F>, initialData?: T[]);
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
}

export declare class MatTreeNodeDef<T> extends CdkTreeNodeDef<T> {
    data: T;
}

export declare class MatTreeNodeOutlet implements CdkTreeNodeOutlet {
    viewContainer: ViewContainerRef;
    constructor(viewContainer: ViewContainerRef);
}

export declare class MatTreeNodePadding<T> extends CdkTreeNodePadding<T> {
    indent: number;
    level: number;
}

export declare class MatTreeNodeToggle<T> extends CdkTreeNodeToggle<T> {
    recursive: boolean;
}

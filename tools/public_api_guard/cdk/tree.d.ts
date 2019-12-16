export declare abstract class BaseTreeControl<T> implements TreeControl<T> {
    dataNodes: T[];
    expansionModel: SelectionModel<T>;
    getChildren: (dataNode: T) => (Observable<T[]> | T[] | undefined | null);
    getLevel: (dataNode: T) => number;
    isExpandable: (dataNode: T) => boolean;
    collapse(dataNode: T): void;
    collapseAll(): void;
    collapseDescendants(dataNode: T): void;
    expand(dataNode: T): void;
    abstract expandAll(): void;
    expandDescendants(dataNode: T): void;
    abstract getDescendants(dataNode: T): T[];
    isExpanded(dataNode: T): boolean;
    toggle(dataNode: T): void;
    toggleDescendants(dataNode: T): void;
}

export declare const CDK_TREE_NODE_OUTLET_NODE: InjectionToken<{}>;

export declare class CdkNestedTreeNode<T> extends CdkTreeNode<T> implements AfterContentInit, OnDestroy {
    protected _children: T[];
    protected _differs: IterableDiffers;
    protected _elementRef: ElementRef<HTMLElement>;
    protected _tree: CdkTree<T>;
    nodeOutlet: QueryList<CdkTreeNodeOutlet>;
    constructor(_elementRef: ElementRef<HTMLElement>, _tree: CdkTree<T>, _differs: IterableDiffers);
    protected _clear(): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    protected updateChildrenNodes(children?: T[]): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkNestedTreeNode<any>, "cdk-nested-tree-node", ["cdkNestedTreeNode"], {}, {}, ["nodeOutlet"]>;
    static ɵfac: i0.ɵɵFactoryDef<CdkNestedTreeNode<any>>;
}

export declare class CdkTree<T> implements AfterContentChecked, CollectionViewer, OnDestroy, OnInit {
    _nodeDefs: QueryList<CdkTreeNodeDef<T>>;
    _nodeOutlet: CdkTreeNodeOutlet;
    dataSource: DataSource<T> | Observable<T[]> | T[];
    trackBy: TrackByFunction<T>;
    treeControl: TreeControl<T>;
    viewChange: BehaviorSubject<{
        start: number;
        end: number;
    }>;
    constructor(_differs: IterableDiffers, _changeDetectorRef: ChangeDetectorRef);
    _getNodeDef(data: T, i: number): CdkTreeNodeDef<T>;
    insertNode(nodeData: T, index: number, viewContainer?: ViewContainerRef, parentData?: T): void;
    ngAfterContentChecked(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    renderNodeChanges(data: T[] | ReadonlyArray<T>, dataDiffer?: IterableDiffer<T>, viewContainer?: ViewContainerRef, parentData?: T): void;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<CdkTree<any>, "cdk-tree", ["cdkTree"], { 'dataSource': "dataSource", 'treeControl': "treeControl", 'trackBy': "trackBy" }, {}, ["_nodeDefs"]>;
    static ɵfac: i0.ɵɵFactoryDef<CdkTree<any>>;
}

export declare class CdkTreeModule {
    static ɵinj: i0.ɵɵInjectorDef<CdkTreeModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<CdkTreeModule, [typeof i1.CdkNestedTreeNode, typeof i2.CdkTreeNodeDef, typeof i3.CdkTreeNodePadding, typeof i4.CdkTreeNodeToggle, typeof i5.CdkTree, typeof i5.CdkTreeNode, typeof i6.CdkTreeNodeOutlet], [typeof i7.CommonModule], [typeof i1.CdkNestedTreeNode, typeof i2.CdkTreeNodeDef, typeof i3.CdkTreeNodePadding, typeof i4.CdkTreeNodeToggle, typeof i5.CdkTree, typeof i5.CdkTreeNode, typeof i6.CdkTreeNodeOutlet]>;
}

export declare class CdkTreeNode<T> implements FocusableOption, OnDestroy {
    protected _data: T;
    _dataChanges: Subject<void>;
    protected _destroyed: Subject<void>;
    protected _elementRef: ElementRef<HTMLElement>;
    protected _tree: CdkTree<T>;
    data: T;
    readonly isExpanded: boolean;
    readonly level: number;
    role: 'treeitem' | 'group';
    constructor(_elementRef: ElementRef<HTMLElement>, _tree: CdkTree<T>);
    protected _setRoleFromChildren(children: T[]): void;
    protected _setRoleFromData(): void;
    focus(): void;
    ngOnDestroy(): void;
    static mostRecentTreeNode: CdkTreeNode<any> | null;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkTreeNode<any>, "cdk-tree-node", ["cdkTreeNode"], { 'role': "role" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkTreeNode<any>>;
}

export declare class CdkTreeNodeDef<T> {
    template: TemplateRef<any>;
    when: (index: number, nodeData: T) => boolean;
    constructor(template: TemplateRef<any>);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkTreeNodeDef<any>, "[cdkTreeNodeDef]", never, { 'when': "cdkTreeNodeDefWhen" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkTreeNodeDef<any>>;
}

export declare class CdkTreeNodeOutlet {
    _node?: any;
    viewContainer: ViewContainerRef;
    constructor(viewContainer: ViewContainerRef, _node?: any);
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkTreeNodeOutlet, "[cdkTreeNodeOutlet]", never, {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkTreeNodeOutlet>;
}

export declare class CdkTreeNodeOutletContext<T> {
    $implicit: T;
    count?: number;
    index?: number;
    level: number;
    constructor(data: T);
}

export declare class CdkTreeNodePadding<T> implements OnDestroy {
    _indent: number;
    _level: number;
    indent: number | string;
    indentUnits: string;
    level: number;
    constructor(_treeNode: CdkTreeNode<T>, _tree: CdkTree<T>, _renderer: Renderer2, _element: ElementRef<HTMLElement>, _dir: Directionality);
    _paddingIndent(): string | null;
    _setPadding(forceChange?: boolean): void;
    ngOnDestroy(): void;
    static ngAcceptInputType_level: NumberInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkTreeNodePadding<any>, "[cdkTreeNodePadding]", never, { 'level': "cdkTreeNodePadding", 'indent': "cdkTreeNodePaddingIndent" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkTreeNodePadding<any>>;
}

export declare class CdkTreeNodeToggle<T> {
    protected _recursive: boolean;
    protected _tree: CdkTree<T>;
    protected _treeNode: CdkTreeNode<T>;
    recursive: boolean;
    constructor(_tree: CdkTree<T>, _treeNode: CdkTreeNode<T>);
    _toggle(event: Event): void;
    static ngAcceptInputType_recursive: BooleanInput;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkTreeNodeToggle<any>, "[cdkTreeNodeToggle]", never, { 'recursive': "cdkTreeNodeToggleRecursive" }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkTreeNodeToggle<any>>;
}

export declare class FlatTreeControl<T> extends BaseTreeControl<T> {
    getLevel: (dataNode: T) => number;
    isExpandable: (dataNode: T) => boolean;
    constructor(getLevel: (dataNode: T) => number, isExpandable: (dataNode: T) => boolean);
    expandAll(): void;
    getDescendants(dataNode: T): T[];
}

export declare function getTreeControlFunctionsMissingError(): Error;

export declare function getTreeControlMissingError(): Error;

export declare function getTreeMissingMatchingNodeDefError(): Error;

export declare function getTreeMultipleDefaultNodeDefsError(): Error;

export declare function getTreeNoValidDataSourceError(): Error;

export declare class NestedTreeControl<T> extends BaseTreeControl<T> {
    getChildren: (dataNode: T) => (Observable<T[]> | T[] | undefined | null);
    constructor(getChildren: (dataNode: T) => (Observable<T[]> | T[] | undefined | null));
    protected _getDescendants(descendants: T[], dataNode: T): void;
    expandAll(): void;
    getDescendants(dataNode: T): T[];
}

export interface TreeControl<T> {
    dataNodes: T[];
    expansionModel: SelectionModel<T>;
    readonly getChildren: (dataNode: T) => Observable<T[]> | T[] | undefined | null;
    readonly getLevel: (dataNode: T) => number;
    readonly isExpandable: (dataNode: T) => boolean;
    collapse(dataNode: T): void;
    collapseAll(): void;
    collapseDescendants(dataNode: T): void;
    expand(dataNode: T): void;
    expandAll(): void;
    expandDescendants(dataNode: T): void;
    getDescendants(dataNode: T): any[];
    isExpanded(dataNode: T): boolean;
    toggle(dataNode: T): void;
    toggleDescendants(dataNode: T): void;
}

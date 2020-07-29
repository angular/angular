export declare class _DisposeViewRepeaterStrategy<T, R, C extends _ViewRepeaterItemContext<T>> implements _ViewRepeater<T, R, C> {
    applyChanges(changes: IterableChanges<R>, viewContainerRef: ViewContainerRef, itemContextFactory: _ViewRepeaterItemContextFactory<T, R, C>, itemValueResolver: _ViewRepeaterItemValueResolver<T, R>, itemViewChanged?: _ViewRepeaterItemChanged<R, C>): void;
    detach(): void;
}

export declare class _RecycleViewRepeaterStrategy<T, R, C extends _ViewRepeaterItemContext<T>> implements _ViewRepeater<T, R, C> {
    viewCacheSize: number;
    applyChanges(changes: IterableChanges<R>, viewContainerRef: ViewContainerRef, itemContextFactory: _ViewRepeaterItemContextFactory<T, R, C>, itemValueResolver: _ViewRepeaterItemValueResolver<T, R>, itemViewChanged?: _ViewRepeaterItemChanged<R, C>): void;
    detach(): void;
}

export declare const _VIEW_REPEATER_STRATEGY: InjectionToken<_ViewRepeater<unknown, unknown, _ViewRepeaterItemContext<unknown>>>;

export interface _ViewRepeater<T, R, C extends _ViewRepeaterItemContext<T>> {
    applyChanges(changes: IterableChanges<R>, viewContainerRef: ViewContainerRef, itemContextFactory: _ViewRepeaterItemContextFactory<T, R, C>, itemValueResolver: _ViewRepeaterItemValueResolver<T, R>, itemViewChanged?: _ViewRepeaterItemChanged<R, C>): void;
    detach(): void;
}

export interface _ViewRepeaterItemChange<R, C> {
    context?: C;
    operation: _ViewRepeaterOperation;
    record: IterableChangeRecord<R>;
}

export declare type _ViewRepeaterItemChanged<R, C> = (change: _ViewRepeaterItemChange<R, C>) => void;

export interface _ViewRepeaterItemContext<T> {
    $implicit?: T;
}

export declare type _ViewRepeaterItemContextFactory<T, R, C extends _ViewRepeaterItemContext<T>> = (record: IterableChangeRecord<R>, adjustedPreviousIndex: number | null, currentIndex: number | null) => _ViewRepeaterItemInsertArgs<C>;

export interface _ViewRepeaterItemInsertArgs<C> {
    context?: C;
    index?: number;
    templateRef: TemplateRef<C>;
}

export declare type _ViewRepeaterItemValueResolver<T, R> = (record: IterableChangeRecord<R>) => T;

export declare const enum _ViewRepeaterOperation {
    REPLACED = 0,
    INSERTED = 1,
    MOVED = 2,
    REMOVED = 3
}

export declare class ArrayDataSource<T> extends DataSource<T> {
    constructor(_data: T[] | ReadonlyArray<T> | Observable<T[] | ReadonlyArray<T>>);
    connect(): Observable<T[] | ReadonlyArray<T>>;
    disconnect(): void;
}

export interface CollectionViewer {
    viewChange: Observable<ListRange>;
}

export declare abstract class DataSource<T> {
    abstract connect(collectionViewer: CollectionViewer): Observable<T[] | ReadonlyArray<T>>;
    abstract disconnect(collectionViewer: CollectionViewer): void;
}

export declare function getMultipleValuesInSingleSelectionError(): Error;

export declare function isDataSource(value: any): value is DataSource<any>;

export declare type ListRange = {
    start: number;
    end: number;
};

export interface SelectionChange<T> {
    added: T[];
    removed: T[];
    source: SelectionModel<T>;
}

export declare class SelectionModel<T> {
    changed: Subject<SelectionChange<T>>;
    get selected(): T[];
    constructor(_multiple?: boolean, initiallySelectedValues?: T[], _emitChanges?: boolean);
    clear(): void;
    deselect(...values: T[]): void;
    hasValue(): boolean;
    isEmpty(): boolean;
    isMultipleSelection(): boolean;
    isSelected(value: T): boolean;
    select(...values: T[]): void;
    sort(predicate?: (a: T, b: T) => number): void;
    toggle(value: T): void;
}

export interface TreeDataNodeFlattener<T> {
    expandFlattenedNodes(nodes: T[], expansionModel: SelectionModel<T>): T[];
    flattenNodes(structuredData: any[]): T[];
    nodeDescendents(node: T, nodes: T[], onlyExpandable: boolean): void;
}

export declare class UniqueSelectionDispatcher implements OnDestroy {
    listen(listener: UniqueSelectionDispatcherListener): () => void;
    ngOnDestroy(): void;
    notify(id: string, name: string): void;
    static ɵfac: i0.ɵɵFactoryDef<UniqueSelectionDispatcher, never>;
    static ɵprov: i0.ɵɵInjectableDef<UniqueSelectionDispatcher>;
}

export declare type UniqueSelectionDispatcherListener = (id: string, name: string) => void;

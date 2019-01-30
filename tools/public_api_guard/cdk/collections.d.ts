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
    onChange: Subject<SelectionChange<T>>;
    readonly selected: T[];
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
}

export declare type UniqueSelectionDispatcherListener = (id: string, name: string) => void;

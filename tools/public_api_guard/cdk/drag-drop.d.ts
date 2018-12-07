export declare const CDK_DRAG_CONFIG: InjectionToken<DragRefConfig>;

export declare function CDK_DRAG_CONFIG_FACTORY(): DragRefConfig;

export declare const CDK_DROP_LIST: InjectionToken<CdkDropListContainer<any>>;

export declare const CDK_DROP_LIST_CONTAINER: InjectionToken<CdkDropListContainer<any>>;

export declare class CdkDrag<T = any> implements AfterViewInit, OnDestroy {
    _dragRef: DragRef<CdkDrag<T>>;
    _handles: QueryList<CdkDragHandle>;
    _placeholderTemplate: CdkDragPlaceholder;
    _previewTemplate: CdkDragPreview;
    boundaryElementSelector: string;
    data: T;
    disabled: boolean;
    dropContainer: CdkDropList;
    dropped: EventEmitter<CdkDragDrop<any>>;
    element: ElementRef<HTMLElement>;
    ended: EventEmitter<CdkDragEnd>;
    entered: EventEmitter<CdkDragEnter<any>>;
    exited: EventEmitter<CdkDragExit<any>>;
    lockAxis: 'x' | 'y';
    moved: Observable<CdkDragMove<T>>;
    rootElementSelector: string;
    started: EventEmitter<CdkDragStart>;
    constructor(
    element: ElementRef<HTMLElement>,
    dropContainer: CdkDropList, _document: any, _ngZone: NgZone, _viewContainerRef: ViewContainerRef, _viewportRuler: ViewportRuler, _dragDropRegistry: DragDropRegistry<DragRef, DropListRef>, _config: DragRefConfig, _dir: Directionality);
    getPlaceholderElement(): HTMLElement;
    getRootElement(): HTMLElement;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    reset(): void;
}

export interface CdkDragConfig extends DragRefConfig {
}

export interface CdkDragDrop<T, O = T> {
    container: CdkDropList<T>;
    currentIndex: number;
    isPointerOverContainer: boolean;
    item: CdkDrag;
    previousContainer: CdkDropList<O>;
    previousIndex: number;
}

export interface CdkDragEnd<T = any> {
    source: CdkDrag<T>;
}

export interface CdkDragEnter<T = any, I = T> {
    container: CdkDropList<T>;
    item: CdkDrag<I>;
}

export interface CdkDragExit<T = any, I = T> {
    container: CdkDropList<T>;
    item: CdkDrag<I>;
}

export declare class CdkDragHandle {
    _parentDrag: {} | undefined;
    disabled: boolean;
    element: ElementRef<HTMLElement>;
    constructor(element: ElementRef<HTMLElement>, parentDrag?: any);
}

export interface CdkDragMove<T = any> {
    delta: {
        x: -1 | 0 | 1;
        y: -1 | 0 | 1;
    };
    event: MouseEvent | TouchEvent;
    pointerPosition: {
        x: number;
        y: number;
    };
    source: CdkDrag<T>;
}

export declare class CdkDragPlaceholder<T = any> {
    data: T;
    templateRef: TemplateRef<T>;
    constructor(templateRef: TemplateRef<T>);
}

export declare class CdkDragPreview<T = any> {
    data: T;
    templateRef: TemplateRef<T>;
    constructor(templateRef: TemplateRef<T>);
}

export interface CdkDragSortEvent<T = any, I = T> {
    container: CdkDropList<T>;
    currentIndex: number;
    item: CdkDrag<I>;
    previousIndex: number;
}

export interface CdkDragStart<T = any> {
    source: CdkDrag<T>;
}

export declare class CdkDropList<T = any> implements CdkDropListContainer, OnDestroy {
    _draggables: QueryList<CdkDrag>;
    _dropListRef: DropListRef<CdkDropList<T>>;
    connectedTo: (CdkDropList | string)[] | CdkDropList | string;
    data: T;
    disabled: boolean;
    dropped: EventEmitter<CdkDragDrop<T, any>>;
    element: ElementRef<HTMLElement>;
    enterPredicate: (drag: CdkDrag, drop: CdkDropList) => boolean;
    entered: EventEmitter<CdkDragEnter<T>>;
    exited: EventEmitter<CdkDragExit<T>>;
    id: string;
    lockAxis: 'x' | 'y';
    orientation: 'horizontal' | 'vertical';
    sorted: EventEmitter<CdkDragSortEvent<T>>;
    constructor(element: ElementRef<HTMLElement>, dragDropRegistry: DragDropRegistry<DragRef, DropListRef>, _changeDetectorRef: ChangeDetectorRef, dir?: Directionality, _group?: CdkDropListGroup<CdkDropList<any>> | undefined, _document?: any);
    _getSiblingContainerFromPosition(item: CdkDrag, x: number, y: number): CdkDropListContainer | null;
    _isOverContainer(x: number, y: number): boolean;
    _sortItem(item: CdkDrag, pointerX: number, pointerY: number, pointerDelta: {
        x: number;
        y: number;
    }): void;
    drop(item: CdkDrag, currentIndex: number, previousContainer: Partial<CdkDropListContainer>, isPointerOverContainer: boolean): void;
    enter(item: CdkDrag, pointerX: number, pointerY: number): void;
    exit(item: CdkDrag): void;
    getItemIndex(item: CdkDrag): number;
    ngOnDestroy(): void;
    start(): void;
}

export interface CdkDropListContainer<T = any> {
    _draggables: QueryList<CdkDrag>;
    data: T;
    disabled: boolean;
    element: ElementRef<HTMLElement>;
    id: string;
    lockAxis: 'x' | 'y';
    orientation: 'horizontal' | 'vertical';
    _getSiblingContainerFromPosition(item: CdkDrag, x: number, y: number): CdkDropListContainer | null;
    _isOverContainer(x: number, y: number): boolean;
    _sortItem(item: CdkDrag, pointerX: number, pointerY: number, delta: {
        x: number;
        y: number;
    }): void;
    drop(item: CdkDrag, currentIndex: number, previousContainer: Partial<CdkDropListContainer>, isPointerOverContainer: boolean): void;
    enter(item: CdkDrag, pointerX: number, pointerY: number): void;
    exit(item: CdkDrag): void;
    getItemIndex(item: CdkDrag): number;
    start(): void;
}

export declare class CdkDropListGroup<T> implements OnDestroy {
    readonly _items: Set<T>;
    ngOnDestroy(): void;
}

export interface CdkDropListInternal extends CdkDropList {
}

export declare function copyArrayItem<T = any>(currentArray: T[], targetArray: T[], currentIndex: number, targetIndex: number): void;

export declare class DragDropModule {
}

export declare class DragDropRegistry<I, C extends {
    id: string;
}> implements OnDestroy {
    readonly pointerMove: Subject<TouchEvent | MouseEvent>;
    readonly pointerUp: Subject<TouchEvent | MouseEvent>;
    constructor(_ngZone: NgZone, _document: any);
    getDropContainer(id: string): C | undefined;
    isDragging(drag: I): boolean;
    ngOnDestroy(): void;
    registerDragItem(drag: I): void;
    registerDropContainer(drop: C): void;
    removeDragItem(drag: I): void;
    removeDropContainer(drop: C): void;
    startDragging(drag: I, event: TouchEvent | MouseEvent): void;
    stopDragging(drag: I): void;
}

export declare function moveItemInArray<T = any>(array: T[], fromIndex: number, toIndex: number): void;

export declare function transferArrayItem<T = any>(currentArray: T[], targetArray: T[], currentIndex: number, targetIndex: number): void;

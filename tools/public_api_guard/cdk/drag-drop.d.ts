export declare const CDK_DRAG_CONFIG: InjectionToken<DragRefConfig>;

export declare function CDK_DRAG_CONFIG_FACTORY(): DragRefConfig;

export declare const CDK_DROP_LIST: InjectionToken<CdkDropListContainer<any>>;

export declare const CDK_DROP_LIST_CONTAINER: InjectionToken<CdkDropListContainer<any>>;

export declare class CdkDrag<T = any> implements AfterViewInit, OnChanges, OnDestroy {
    _dragRef: DragRef<CdkDrag<T>>;
    _handles: QueryList<CdkDragHandle>;
    _placeholderTemplate: CdkDragPlaceholder;
    _previewTemplate: CdkDragPreview;
    boundaryElementSelector: string;
    constrainPosition?: (point: Point) => Point;
    data: T;
    disabled: boolean;
    dragStartDelay: number;
    dropContainer: CdkDropList;
    dropped: EventEmitter<CdkDragDrop<any>>;
    element: ElementRef<HTMLElement>;
    ended: EventEmitter<CdkDragEnd>;
    entered: EventEmitter<CdkDragEnter<any>>;
    exited: EventEmitter<CdkDragExit<any>>;
    lockAxis: 'x' | 'y';
    moved: Observable<CdkDragMove<T>>;
    released: EventEmitter<CdkDragRelease>;
    rootElementSelector: string;
    started: EventEmitter<CdkDragStart>;
    constructor(
    element: ElementRef<HTMLElement>,
    dropContainer: CdkDropList, _document: any, _ngZone: NgZone, _viewContainerRef: ViewContainerRef, viewportRuler: ViewportRuler, dragDropRegistry: DragDropRegistry<DragRef, DropListRef>, config: DragRefConfig, _dir: Directionality,
    dragDrop?: DragDrop, _changeDetectorRef?: ChangeDetectorRef | undefined);
    getPlaceholderElement(): HTMLElement;
    getRootElement(): HTMLElement;
    ngAfterViewInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
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

export declare class CdkDragHandle implements OnDestroy {
    _parentDrag: {} | undefined;
    _stateChanges: Subject<CdkDragHandle>;
    disabled: boolean;
    element: ElementRef<HTMLElement>;
    constructor(element: ElementRef<HTMLElement>, parentDrag?: any);
    ngOnDestroy(): void;
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

export interface CdkDragRelease<T = any> {
    source: CdkDrag<T>;
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

export declare class CdkDropList<T = any> implements CdkDropListContainer, AfterContentInit, OnDestroy {
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
    sortingDisabled: boolean;
    constructor(
    element: ElementRef<HTMLElement>, dragDropRegistry: DragDropRegistry<DragRef, DropListRef>, _changeDetectorRef: ChangeDetectorRef, _dir?: Directionality | undefined, _group?: CdkDropListGroup<CdkDropList<any>> | undefined, _document?: any,
    dragDrop?: DragDrop);
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
    ngAfterContentInit(): void;
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
    disabled: boolean;
    ngOnDestroy(): void;
}

export declare function copyArrayItem<T = any>(currentArray: T[], targetArray: T[], currentIndex: number, targetIndex: number): void;

export declare class DragDrop {
    constructor(_document: any, _ngZone: NgZone, _viewportRuler: ViewportRuler, _dragDropRegistry: DragDropRegistry<DragRef, DropListRef>);
    createDrag<T = any>(element: ElementRef<HTMLElement> | HTMLElement, config?: DragRefConfig): DragRef<T>;
    createDropList<T = any>(element: ElementRef<HTMLElement> | HTMLElement): DropListRef<T>;
}

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

export declare class DragRef<T = any> {
    beforeStarted: Subject<void>;
    constrainPosition?: (point: Point) => Point;
    data: T;
    disabled: boolean;
    dragStartDelay: number;
    dropped: Subject<{
        previousIndex: number;
        currentIndex: number;
        item: DragRef<any>;
        container: DropListRef;
        previousContainer: DropListRef;
        isPointerOverContainer: boolean;
    }>;
    ended: Subject<{
        source: DragRef<any>;
    }>;
    entered: Subject<{
        container: DropListRef;
        item: DragRef<any>;
    }>;
    exited: Subject<{
        container: DropListRef;
        item: DragRef<any>;
    }>;
    lockAxis: 'x' | 'y';
    moved: Observable<{
        source: DragRef;
        pointerPosition: {
            x: number;
            y: number;
        };
        event: MouseEvent | TouchEvent;
        delta: {
            x: -1 | 0 | 1;
            y: -1 | 0 | 1;
        };
    }>;
    released: Subject<{
        source: DragRef<any>;
    }>;
    started: Subject<{
        source: DragRef<any>;
    }>;
    constructor(element: ElementRef<HTMLElement> | HTMLElement, _config: DragRefConfig, _document: Document, _ngZone: NgZone, _viewportRuler: ViewportRuler, _dragDropRegistry: DragDropRegistry<DragRef, DropListRef>);
    _withDropContainer(container: DropListRef): void;
    disableHandle(handle: HTMLElement): void;
    dispose(): void;
    enableHandle(handle: HTMLElement): void;
    getPlaceholderElement(): HTMLElement;
    getRootElement(): HTMLElement;
    isDragging(): boolean;
    reset(): void;
    withBoundaryElement(boundaryElement: ElementRef<HTMLElement> | HTMLElement | null): this;
    withDirection(direction: Direction): this;
    withHandles(handles: (HTMLElement | ElementRef<HTMLElement>)[]): this;
    withPlaceholderTemplate(template: DragHelperTemplate | null): this;
    withPreviewTemplate(template: DragHelperTemplate | null): this;
    withRootElement(rootElement: ElementRef<HTMLElement> | HTMLElement): this;
}

export interface DragRefConfig {
    dragStartThreshold: number;
    pointerDirectionChangeThreshold: number;
}

export declare class DropListRef<T = any> {
    beforeStarted: Subject<void>;
    data: T;
    disabled: boolean;
    dropped: Subject<{
        item: DragRef;
        currentIndex: number;
        previousIndex: number;
        container: DropListRef<any>;
        previousContainer: DropListRef<any>;
        isPointerOverContainer: boolean;
    }>;
    readonly element: HTMLElement;
    enterPredicate: (drag: DragRef, drop: DropListRef) => boolean;
    entered: Subject<{
        item: DragRef;
        container: DropListRef<any>;
    }>;
    exited: Subject<{
        item: DragRef;
        container: DropListRef<any>;
    }>;
    id: string;
    lockAxis: 'x' | 'y';
    sorted: Subject<{
        previousIndex: number;
        currentIndex: number;
        container: DropListRef<any>;
        item: DragRef;
    }>;
    sortingDisabled: boolean;
    constructor(element: ElementRef<HTMLElement> | HTMLElement, _dragDropRegistry: DragDropRegistry<DragRef, DropListRef>, _document: any);
    _canReceive(item: DragRef, x: number, y: number): boolean;
    _getSiblingContainerFromPosition(item: DragRef, x: number, y: number): DropListRef | undefined;
    _isOverContainer(x: number, y: number): boolean;
    _sortItem(item: DragRef, pointerX: number, pointerY: number, pointerDelta: {
        x: number;
        y: number;
    }): void;
    _startReceiving(sibling: DropListRef): void;
    _stopReceiving(sibling: DropListRef): void;
    connectedTo(connectedTo: DropListRef[]): this;
    dispose(): void;
    drop(item: DragRef, currentIndex: number, previousContainer: DropListRef, isPointerOverContainer: boolean): void;
    enter(item: DragRef, pointerX: number, pointerY: number): void;
    exit(item: DragRef): void;
    getItemIndex(item: DragRef): number;
    isDragging(): boolean;
    isReceiving(): boolean;
    start(): void;
    withDirection(direction: Direction): this;
    withItems(items: DragRef[]): this;
    withOrientation(orientation: 'vertical' | 'horizontal'): this;
}

export declare function moveItemInArray<T = any>(array: T[], fromIndex: number, toIndex: number): void;

export declare function transferArrayItem<T = any>(currentArray: T[], targetArray: T[], currentIndex: number, targetIndex: number): void;

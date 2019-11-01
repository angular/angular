export declare class GoogleMap implements OnChanges, OnInit, OnDestroy {
    _googleMap: UpdatedGoogleMap;
    boundsChanged: EventEmitter<void>;
    center: google.maps.LatLngLiteral | google.maps.LatLng;
    centerChanged: EventEmitter<void>;
    readonly controls: Array<google.maps.MVCArray<Node>>;
    readonly data: google.maps.Data;
    headingChanged: EventEmitter<void>;
    height: string;
    idle: EventEmitter<void>;
    mapClick: EventEmitter<google.maps.MouseEvent | google.maps.IconMouseEvent>;
    mapDblclick: EventEmitter<google.maps.MouseEvent>;
    mapDrag: EventEmitter<void>;
    mapDragend: EventEmitter<void>;
    mapDragstart: EventEmitter<void>;
    mapMousemove: EventEmitter<google.maps.MouseEvent>;
    mapMouseout: EventEmitter<google.maps.MouseEvent>;
    mapMouseover: EventEmitter<google.maps.MouseEvent>;
    mapRightclick: EventEmitter<google.maps.MouseEvent>;
    readonly mapTypes: google.maps.MapTypeRegistry;
    maptypeidChanged: EventEmitter<void>;
    options: google.maps.MapOptions;
    readonly overlayMapTypes: google.maps.MVCArray<google.maps.MapType>;
    projectionChanged: EventEmitter<void>;
    tilesloaded: EventEmitter<void>;
    tiltChanged: EventEmitter<void>;
    width: string;
    zoom: number;
    zoomChanged: EventEmitter<void>;
    constructor(_elementRef: ElementRef);
    fitBounds(bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral, padding?: number | google.maps.Padding): void;
    getBounds(): google.maps.LatLngBounds | null;
    getCenter(): google.maps.LatLng;
    getClickableIcons(): boolean;
    getHeading(): number;
    getMapTypeId(): google.maps.MapTypeId | string;
    getProjection(): google.maps.Projection | null;
    getStreetView(): google.maps.StreetViewPanorama;
    getTilt(): number;
    getZoom(): number;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    panBy(x: number, y: number): void;
    panTo(latLng: google.maps.LatLng | google.maps.LatLngLiteral): void;
    panToBounds(latLngBounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral, padding?: number | google.maps.Padding): void;
}

export declare class GoogleMapsModule {
}

export declare class MapInfoWindow implements OnInit, OnDestroy {
    closeclick: EventEmitter<void>;
    contentChanged: EventEmitter<void>;
    domready: EventEmitter<void>;
    options: google.maps.InfoWindowOptions;
    position: google.maps.LatLngLiteral | google.maps.LatLng;
    positionChanged: EventEmitter<void>;
    zindexChanged: EventEmitter<void>;
    constructor(googleMap: GoogleMap, _elementRef: ElementRef<HTMLElement>);
    close(): void;
    getContent(): string | Node;
    getPosition(): google.maps.LatLng | null;
    getZIndex(): number;
    ngOnDestroy(): void;
    ngOnInit(): void;
    open(anchor?: MapMarker): void;
}

export declare class MapMarker implements OnInit, OnDestroy {
    _marker?: google.maps.Marker;
    animationChanged: EventEmitter<void>;
    clickable: boolean;
    clickableChanged: EventEmitter<void>;
    cursorChanged: EventEmitter<void>;
    draggableChanged: EventEmitter<void>;
    flatChanged: EventEmitter<void>;
    iconChanged: EventEmitter<void>;
    label: string | google.maps.MarkerLabel;
    mapClick: EventEmitter<google.maps.MouseEvent>;
    mapDblclick: EventEmitter<google.maps.MouseEvent>;
    mapDrag: EventEmitter<google.maps.MouseEvent>;
    mapDragend: EventEmitter<google.maps.MouseEvent>;
    mapDragstart: EventEmitter<google.maps.MouseEvent>;
    mapMousedown: EventEmitter<google.maps.MouseEvent>;
    mapMouseout: EventEmitter<google.maps.MouseEvent>;
    mapMouseover: EventEmitter<google.maps.MouseEvent>;
    mapMouseup: EventEmitter<google.maps.MouseEvent>;
    mapRightclick: EventEmitter<google.maps.MouseEvent>;
    options: google.maps.MarkerOptions;
    position: google.maps.LatLngLiteral | google.maps.LatLng;
    positionChanged: EventEmitter<void>;
    shapeChanged: EventEmitter<void>;
    title: string;
    titleChanged: EventEmitter<void>;
    visibleChanged: EventEmitter<void>;
    zindexChanged: EventEmitter<void>;
    constructor(googleMap: GoogleMap);
    getAnimation(): google.maps.Animation | null;
    getClickable(): boolean;
    getCursor(): string | null;
    getDraggable(): boolean;
    getIcon(): string | google.maps.Icon | google.maps.Symbol | null;
    getLabel(): google.maps.MarkerLabel | null;
    getOpacity(): number | null;
    getPosition(): google.maps.LatLng | null;
    getShape(): google.maps.MarkerShape | null;
    getTitle(): string | null;
    getVisible(): boolean;
    getZIndex(): number | null;
    ngOnDestroy(): void;
    ngOnInit(): void;
}

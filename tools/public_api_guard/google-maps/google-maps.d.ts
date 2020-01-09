export declare class GoogleMap implements OnChanges, OnInit, OnDestroy {
    _googleMap: UpdatedGoogleMap;
    boundsChanged: Observable<void>;
    center: google.maps.LatLngLiteral | google.maps.LatLng;
    centerChanged: Observable<void>;
    readonly controls: Array<google.maps.MVCArray<Node>>;
    readonly data: google.maps.Data;
    headingChanged: Observable<void>;
    height: string;
    idle: Observable<void>;
    mapClick: Observable<google.maps.MouseEvent | google.maps.IconMouseEvent>;
    mapDblclick: Observable<google.maps.MouseEvent>;
    mapDrag: Observable<void>;
    mapDragend: Observable<void>;
    mapDragstart: Observable<void>;
    mapMousemove: Observable<google.maps.MouseEvent>;
    mapMouseout: Observable<google.maps.MouseEvent>;
    mapMouseover: Observable<google.maps.MouseEvent>;
    mapRightclick: Observable<google.maps.MouseEvent>;
    readonly mapTypes: google.maps.MapTypeRegistry;
    maptypeidChanged: Observable<void>;
    options: google.maps.MapOptions;
    readonly overlayMapTypes: google.maps.MVCArray<google.maps.MapType>;
    projectionChanged: Observable<void>;
    tilesloaded: Observable<void>;
    tiltChanged: Observable<void>;
    width: string;
    zoom: number;
    zoomChanged: Observable<void>;
    constructor(_elementRef: ElementRef,
    platformId?: Object);
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
    static ɵcmp: i0.ɵɵComponentDefWithMeta<GoogleMap, "google-map", never, { "height": "height"; "width": "width"; "center": "center"; "zoom": "zoom"; "options": "options"; }, { "boundsChanged": "boundsChanged"; "centerChanged": "centerChanged"; "mapClick": "mapClick"; "mapDblclick": "mapDblclick"; "mapDrag": "mapDrag"; "mapDragend": "mapDragend"; "mapDragstart": "mapDragstart"; "headingChanged": "headingChanged"; "idle": "idle"; "maptypeidChanged": "maptypeidChanged"; "mapMousemove": "mapMousemove"; "mapMouseout": "mapMouseout"; "mapMouseover": "mapMouseover"; "projectionChanged": "projectionChanged"; "mapRightclick": "mapRightclick"; "tilesloaded": "tilesloaded"; "tiltChanged": "tiltChanged"; "zoomChanged": "zoomChanged"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<GoogleMap>;
}

export declare class GoogleMapsModule {
    static ɵinj: i0.ɵɵInjectorDef<GoogleMapsModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<GoogleMapsModule, [typeof i1.GoogleMap, typeof i2.MapInfoWindow, typeof i3.MapMarker, typeof i4.MapPolyline], never, [typeof i1.GoogleMap, typeof i2.MapInfoWindow, typeof i3.MapMarker, typeof i4.MapPolyline]>;
}

export declare class MapInfoWindow implements OnInit, OnDestroy {
    closeclick: Observable<void>;
    contentChanged: Observable<void>;
    domready: Observable<void>;
    options: google.maps.InfoWindowOptions;
    position: google.maps.LatLngLiteral | google.maps.LatLng;
    positionChanged: Observable<void>;
    zindexChanged: Observable<void>;
    constructor(_googleMap: GoogleMap, _elementRef: ElementRef<HTMLElement>);
    close(): void;
    getContent(): string | Node;
    getPosition(): google.maps.LatLng | null;
    getZIndex(): number;
    ngOnDestroy(): void;
    ngOnInit(): void;
    open(anchor?: MapMarker): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MapInfoWindow, "map-info-window", never, { "options": "options"; "position": "position"; }, { "closeclick": "closeclick"; "contentChanged": "contentChanged"; "domready": "domready"; "positionChanged": "positionChanged"; "zindexChanged": "zindexChanged"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MapInfoWindow>;
}

export declare class MapMarker implements OnInit, OnDestroy {
    _marker?: google.maps.Marker;
    animationChanged: Observable<void>;
    clickable: boolean;
    clickableChanged: Observable<void>;
    cursorChanged: Observable<void>;
    draggableChanged: Observable<void>;
    flatChanged: Observable<void>;
    iconChanged: Observable<void>;
    label: string | google.maps.MarkerLabel;
    mapClick: Observable<google.maps.MouseEvent>;
    mapDblclick: Observable<google.maps.MouseEvent>;
    mapDrag: Observable<google.maps.MouseEvent>;
    mapDragend: Observable<google.maps.MouseEvent>;
    mapDragstart: Observable<google.maps.MouseEvent>;
    mapMousedown: Observable<google.maps.MouseEvent>;
    mapMouseout: Observable<google.maps.MouseEvent>;
    mapMouseover: Observable<google.maps.MouseEvent>;
    mapMouseup: Observable<google.maps.MouseEvent>;
    mapRightclick: Observable<google.maps.MouseEvent>;
    options: google.maps.MarkerOptions;
    position: google.maps.LatLngLiteral | google.maps.LatLng;
    positionChanged: Observable<void>;
    shapeChanged: Observable<void>;
    title: string;
    titleChanged: Observable<void>;
    visibleChanged: Observable<void>;
    zindexChanged: Observable<void>;
    constructor(_googleMap: GoogleMap);
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
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MapMarker, "map-marker", never, { "options": "options"; "title": "title"; "position": "position"; "label": "label"; "clickable": "clickable"; }, { "animationChanged": "animationChanged"; "mapClick": "mapClick"; "clickableChanged": "clickableChanged"; "cursorChanged": "cursorChanged"; "mapDblclick": "mapDblclick"; "mapDrag": "mapDrag"; "mapDragend": "mapDragend"; "draggableChanged": "draggableChanged"; "mapDragstart": "mapDragstart"; "flatChanged": "flatChanged"; "iconChanged": "iconChanged"; "mapMousedown": "mapMousedown"; "mapMouseout": "mapMouseout"; "mapMouseover": "mapMouseover"; "mapMouseup": "mapMouseup"; "positionChanged": "positionChanged"; "mapRightclick": "mapRightclick"; "shapeChanged": "shapeChanged"; "titleChanged": "titleChanged"; "visibleChanged": "visibleChanged"; "zindexChanged": "zindexChanged"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MapMarker>;
}

export declare class MapPolyline implements OnInit, OnDestroy {
    _polyline: google.maps.Polyline;
    options: google.maps.PolylineOptions;
    path: google.maps.MVCArray<google.maps.LatLng> | google.maps.LatLng[] | google.maps.LatLngLiteral[];
    polylineClick: Observable<google.maps.PolyMouseEvent>;
    polylineDblclick: Observable<google.maps.PolyMouseEvent>;
    polylineDrag: Observable<google.maps.MouseEvent>;
    polylineDragend: Observable<google.maps.MouseEvent>;
    polylineDragstart: Observable<google.maps.MouseEvent>;
    polylineMousedown: Observable<google.maps.PolyMouseEvent>;
    polylineMousemove: Observable<google.maps.PolyMouseEvent>;
    polylineMouseout: Observable<google.maps.PolyMouseEvent>;
    polylineMouseover: Observable<google.maps.PolyMouseEvent>;
    polylineMouseup: Observable<google.maps.PolyMouseEvent>;
    polylineRightclick: Observable<google.maps.PolyMouseEvent>;
    constructor(_map: GoogleMap);
    getDraggable(): boolean;
    getEditable(): boolean;
    getPath(): google.maps.MVCArray<google.maps.LatLng>;
    getVisible(): boolean;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MapPolyline, "map-polyline", never, { "options": "options"; "path": "path"; }, { "polylineClick": "polylineClick"; "polylineDblclick": "polylineDblclick"; "polylineDrag": "polylineDrag"; "polylineDragend": "polylineDragend"; "polylineDragstart": "polylineDragstart"; "polylineMousedown": "polylineMousedown"; "polylineMousemove": "polylineMousemove"; "polylineMouseout": "polylineMouseout"; "polylineMouseover": "polylineMouseover"; "polylineMouseup": "polylineMouseup"; "polylineRightclick": "polylineRightclick"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MapPolyline>;
}

export declare class GoogleMap implements OnChanges, OnInit, OnDestroy {
    _googleMap: UpdatedGoogleMap;
    _isBrowser: boolean;
    boundsChanged: Observable<void>;
    set center(center: google.maps.LatLngLiteral | google.maps.LatLng);
    centerChanged: Observable<void>;
    get controls(): Array<google.maps.MVCArray<Node>>;
    get data(): google.maps.Data;
    headingChanged: Observable<void>;
    height: string | number;
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
    get mapTypes(): google.maps.MapTypeRegistry;
    maptypeidChanged: Observable<void>;
    set options(options: google.maps.MapOptions);
    get overlayMapTypes(): google.maps.MVCArray<google.maps.MapType>;
    projectionChanged: Observable<void>;
    tilesloaded: Observable<void>;
    tiltChanged: Observable<void>;
    width: string | number;
    set zoom(zoom: number);
    zoomChanged: Observable<void>;
    constructor(_elementRef: ElementRef, _ngZone: NgZone,
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
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<GoogleMapsModule, [typeof i1.GoogleMap, typeof i2.MapCircle, typeof i3.MapInfoWindow, typeof i4.MapMarker, typeof i5.MapPolygon, typeof i6.MapPolyline, typeof i7.MapRectangle], never, [typeof i1.GoogleMap, typeof i2.MapCircle, typeof i3.MapInfoWindow, typeof i4.MapMarker, typeof i5.MapPolygon, typeof i6.MapPolyline, typeof i7.MapRectangle]>;
}

export declare class MapCircle implements OnInit, OnDestroy {
    set center(center: google.maps.LatLng | google.maps.LatLngLiteral);
    centerChanged: Observable<void>;
    circle: google.maps.Circle;
    circleClick: Observable<google.maps.MouseEvent>;
    circleDblclick: Observable<google.maps.MouseEvent>;
    circleDrag: Observable<google.maps.MouseEvent>;
    circleDragend: Observable<google.maps.MouseEvent>;
    circleDragstart: Observable<google.maps.MouseEvent>;
    circleMousedown: Observable<google.maps.MouseEvent>;
    circleMousemove: Observable<google.maps.MouseEvent>;
    circleMouseout: Observable<google.maps.MouseEvent>;
    circleMouseover: Observable<google.maps.MouseEvent>;
    circleMouseup: Observable<google.maps.MouseEvent>;
    circleRightclick: Observable<google.maps.MouseEvent>;
    set options(options: google.maps.CircleOptions);
    set radius(radius: number);
    radiusChanged: Observable<void>;
    constructor(_map: GoogleMap, _ngZone: NgZone);
    getBounds(): google.maps.LatLngBounds;
    getCenter(): google.maps.LatLng;
    getDraggable(): boolean;
    getEditable(): boolean;
    getRadius(): number;
    getVisible(): boolean;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MapCircle, "map-circle", never, { "options": "options"; "center": "center"; "radius": "radius"; }, { "centerChanged": "centerChanged"; "circleClick": "circleClick"; "circleDblclick": "circleDblclick"; "circleDrag": "circleDrag"; "circleDragend": "circleDragend"; "circleDragstart": "circleDragstart"; "circleMousedown": "circleMousedown"; "circleMousemove": "circleMousemove"; "circleMouseout": "circleMouseout"; "circleMouseover": "circleMouseover"; "circleMouseup": "circleMouseup"; "radiusChanged": "radiusChanged"; "circleRightclick": "circleRightclick"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MapCircle>;
}

export declare class MapInfoWindow implements OnInit, OnDestroy {
    closeclick: Observable<void>;
    contentChanged: Observable<void>;
    domready: Observable<void>;
    set options(options: google.maps.InfoWindowOptions);
    set position(position: google.maps.LatLngLiteral | google.maps.LatLng);
    positionChanged: Observable<void>;
    zindexChanged: Observable<void>;
    constructor(_googleMap: GoogleMap, _elementRef: ElementRef<HTMLElement>, _ngZone: NgZone);
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
    set clickable(clickable: boolean);
    clickableChanged: Observable<void>;
    cursorChanged: Observable<void>;
    draggableChanged: Observable<void>;
    flatChanged: Observable<void>;
    iconChanged: Observable<void>;
    set label(label: string | google.maps.MarkerLabel);
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
    set options(options: google.maps.MarkerOptions);
    set position(position: google.maps.LatLngLiteral | google.maps.LatLng);
    positionChanged: Observable<void>;
    shapeChanged: Observable<void>;
    set title(title: string);
    titleChanged: Observable<void>;
    visibleChanged: Observable<void>;
    zindexChanged: Observable<void>;
    constructor(_googleMap: GoogleMap, _ngZone: NgZone);
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

export declare class MapPolygon implements OnInit, OnDestroy {
    _polygon: google.maps.Polygon;
    set options(options: google.maps.PolygonOptions);
    set paths(paths: google.maps.MVCArray<google.maps.MVCArray<google.maps.LatLng>> | google.maps.MVCArray<google.maps.LatLng> | google.maps.LatLng[] | google.maps.LatLngLiteral[]);
    polygonClick: Observable<google.maps.PolyMouseEvent>;
    polygonDblclick: Observable<google.maps.PolyMouseEvent>;
    polygonDrag: Observable<google.maps.MouseEvent>;
    polygonDragend: Observable<google.maps.MouseEvent>;
    polygonDragstart: Observable<google.maps.MouseEvent>;
    polygonMousedown: Observable<google.maps.PolyMouseEvent>;
    polygonMousemove: Observable<google.maps.PolyMouseEvent>;
    polygonMouseout: Observable<google.maps.PolyMouseEvent>;
    polygonMouseover: Observable<google.maps.PolyMouseEvent>;
    polygonMouseup: Observable<google.maps.PolyMouseEvent>;
    polygonRightclick: Observable<google.maps.PolyMouseEvent>;
    constructor(_map: GoogleMap, _ngZone: NgZone);
    getDraggable(): boolean;
    getEditable(): boolean;
    getPath(): google.maps.MVCArray<google.maps.LatLng>;
    getPaths(): google.maps.MVCArray<google.maps.MVCArray<google.maps.LatLng>>;
    getVisible(): boolean;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MapPolygon, "map-polygon", never, { "options": "options"; "paths": "paths"; }, { "polygonClick": "polygonClick"; "polygonDblclick": "polygonDblclick"; "polygonDrag": "polygonDrag"; "polygonDragend": "polygonDragend"; "polygonDragstart": "polygonDragstart"; "polygonMousedown": "polygonMousedown"; "polygonMousemove": "polygonMousemove"; "polygonMouseout": "polygonMouseout"; "polygonMouseover": "polygonMouseover"; "polygonMouseup": "polygonMouseup"; "polygonRightclick": "polygonRightclick"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MapPolygon>;
}

export declare class MapPolyline implements OnInit, OnDestroy {
    _polyline?: google.maps.Polyline;
    set options(options: google.maps.PolylineOptions);
    set path(path: google.maps.MVCArray<google.maps.LatLng> | google.maps.LatLng[] | google.maps.LatLngLiteral[]);
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
    constructor(_map: GoogleMap, _ngZone: NgZone);
    getDraggable(): boolean;
    getEditable(): boolean;
    getPath(): google.maps.MVCArray<google.maps.LatLng>;
    getVisible(): boolean;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MapPolyline, "map-polyline", never, { "options": "options"; "path": "path"; }, { "polylineClick": "polylineClick"; "polylineDblclick": "polylineDblclick"; "polylineDrag": "polylineDrag"; "polylineDragend": "polylineDragend"; "polylineDragstart": "polylineDragstart"; "polylineMousedown": "polylineMousedown"; "polylineMousemove": "polylineMousemove"; "polylineMouseout": "polylineMouseout"; "polylineMouseover": "polylineMouseover"; "polylineMouseup": "polylineMouseup"; "polylineRightclick": "polylineRightclick"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MapPolyline>;
}

export declare class MapRectangle implements OnInit, OnDestroy {
    _rectangle: google.maps.Rectangle;
    set bounds(bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral);
    boundsChanged: Observable<void>;
    set options(options: google.maps.RectangleOptions);
    rectangleClick: Observable<google.maps.MouseEvent>;
    rectangleDblclick: Observable<google.maps.MouseEvent>;
    rectangleDrag: Observable<google.maps.MouseEvent>;
    rectangleDragend: Observable<google.maps.MouseEvent>;
    rectangleDragstart: Observable<google.maps.MouseEvent>;
    rectangleMousedown: Observable<google.maps.MouseEvent>;
    rectangleMousemove: Observable<google.maps.MouseEvent>;
    rectangleMouseout: Observable<google.maps.MouseEvent>;
    rectangleMouseover: Observable<google.maps.MouseEvent>;
    rectangleMouseup: Observable<google.maps.MouseEvent>;
    rectangleRightclick: Observable<google.maps.MouseEvent>;
    constructor(_map: GoogleMap, _ngZone: NgZone);
    getBounds(): google.maps.LatLngBounds;
    getDraggable(): boolean;
    getEditable(): boolean;
    getVisible(): boolean;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MapRectangle, "map-rectangle", never, { "options": "options"; "bounds": "bounds"; }, { "boundsChanged": "boundsChanged"; "rectangleClick": "rectangleClick"; "rectangleDblclick": "rectangleDblclick"; "rectangleDrag": "rectangleDrag"; "rectangleDragend": "rectangleDragend"; "rectangleDragstart": "rectangleDragstart"; "rectangleMousedown": "rectangleMousedown"; "rectangleMousemove": "rectangleMousemove"; "rectangleMouseout": "rectangleMouseout"; "rectangleMouseover": "rectangleMouseover"; "rectangleMouseup": "rectangleMouseup"; "rectangleRightclick": "rectangleRightclick"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<MapRectangle>;
}

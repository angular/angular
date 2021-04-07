export declare class GoogleMap implements OnChanges, OnInit, OnDestroy {
    _isBrowser: boolean;
    boundsChanged: Observable<void>;
    set center(center: google.maps.LatLngLiteral | google.maps.LatLng);
    centerChanged: Observable<void>;
    get controls(): google.maps.MVCArray<Node>[];
    get data(): google.maps.Data;
    googleMap?: google.maps.Map;
    headingChanged: Observable<void>;
    height: string | number | null;
    idle: Observable<void>;
    mapClick: Observable<google.maps.MapMouseEvent | google.maps.IconMouseEvent>;
    mapDblclick: Observable<google.maps.MapMouseEvent>;
    mapDrag: Observable<void>;
    mapDragend: Observable<void>;
    mapDragstart: Observable<void>;
    mapMousemove: Observable<google.maps.MapMouseEvent>;
    mapMouseout: Observable<google.maps.MapMouseEvent>;
    mapMouseover: Observable<google.maps.MapMouseEvent>;
    mapRightclick: Observable<google.maps.MapMouseEvent>;
    mapTypeId: google.maps.MapTypeId | undefined;
    get mapTypes(): google.maps.MapTypeRegistry;
    maptypeidChanged: Observable<void>;
    set options(options: google.maps.MapOptions);
    get overlayMapTypes(): google.maps.MVCArray<google.maps.MapType>;
    projectionChanged: Observable<void>;
    tilesloaded: Observable<void>;
    tiltChanged: Observable<void>;
    width: string | number | null;
    set zoom(zoom: number);
    zoomChanged: Observable<void>;
    constructor(_elementRef: ElementRef, _ngZone: NgZone, platformId: Object);
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
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    panBy(x: number, y: number): void;
    panTo(latLng: google.maps.LatLng | google.maps.LatLngLiteral): void;
    panToBounds(latLngBounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral, padding?: number | google.maps.Padding): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<GoogleMap, "google-map", ["googleMap"], { "height": "height"; "width": "width"; "mapTypeId": "mapTypeId"; "center": "center"; "zoom": "zoom"; "options": "options"; }, { "boundsChanged": "boundsChanged"; "centerChanged": "centerChanged"; "mapClick": "mapClick"; "mapDblclick": "mapDblclick"; "mapDrag": "mapDrag"; "mapDragend": "mapDragend"; "mapDragstart": "mapDragstart"; "headingChanged": "headingChanged"; "idle": "idle"; "maptypeidChanged": "maptypeidChanged"; "mapMousemove": "mapMousemove"; "mapMouseout": "mapMouseout"; "mapMouseover": "mapMouseover"; "projectionChanged": "projectionChanged"; "mapRightclick": "mapRightclick"; "tilesloaded": "tilesloaded"; "tiltChanged": "tiltChanged"; "zoomChanged": "zoomChanged"; }, never, ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<GoogleMap, never>;
}

export declare class GoogleMapsModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<GoogleMapsModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<GoogleMapsModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<GoogleMapsModule, [typeof i1.GoogleMap, typeof i2.MapBaseLayer, typeof i3.MapBicyclingLayer, typeof i4.MapCircle, typeof i5.MapDirectionsRenderer, typeof i6.MapGroundOverlay, typeof i7.MapInfoWindow, typeof i8.MapKmlLayer, typeof i9.MapMarker, typeof i10.MapMarkerClusterer, typeof i11.MapPolygon, typeof i12.MapPolyline, typeof i13.MapRectangle, typeof i14.MapTrafficLayer, typeof i15.MapTransitLayer, typeof i16.MapHeatmapLayer], never, [typeof i1.GoogleMap, typeof i2.MapBaseLayer, typeof i3.MapBicyclingLayer, typeof i4.MapCircle, typeof i5.MapDirectionsRenderer, typeof i6.MapGroundOverlay, typeof i7.MapInfoWindow, typeof i8.MapKmlLayer, typeof i9.MapMarker, typeof i10.MapMarkerClusterer, typeof i11.MapPolygon, typeof i12.MapPolyline, typeof i13.MapRectangle, typeof i14.MapTrafficLayer, typeof i15.MapTransitLayer, typeof i16.MapHeatmapLayer]>;
}

export declare type HeatmapData = google.maps.MVCArray<google.maps.LatLng | google.maps.visualization.WeightedLocation | google.maps.LatLngLiteral> | (google.maps.LatLng | google.maps.visualization.WeightedLocation | google.maps.LatLngLiteral)[];

export interface MapAnchorPoint {
    getAnchor(): google.maps.MVCObject;
}

export declare class MapBaseLayer implements OnInit, OnDestroy {
    protected readonly _map: GoogleMap;
    protected readonly _ngZone: NgZone;
    constructor(_map: GoogleMap, _ngZone: NgZone);
    protected _initializeObject(): void;
    protected _setMap(): void;
    protected _unsetMap(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MapBaseLayer, "map-base-layer", ["mapBaseLayer"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapBaseLayer, never>;
}

export declare class MapBicyclingLayer extends MapBaseLayer {
    bicyclingLayer?: google.maps.BicyclingLayer;
    protected _initializeObject(): void;
    protected _setMap(): void;
    protected _unsetMap(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MapBicyclingLayer, "map-bicycling-layer", ["mapBicyclingLayer"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapBicyclingLayer, never>;
}

export declare class MapCircle implements OnInit, OnDestroy {
    set center(center: google.maps.LatLng | google.maps.LatLngLiteral);
    centerChanged: Observable<void>;
    circle?: google.maps.Circle;
    circleClick: Observable<google.maps.MapMouseEvent>;
    circleDblclick: Observable<google.maps.MapMouseEvent>;
    circleDrag: Observable<google.maps.MapMouseEvent>;
    circleDragend: Observable<google.maps.MapMouseEvent>;
    circleDragstart: Observable<google.maps.MapMouseEvent>;
    circleMousedown: Observable<google.maps.MapMouseEvent>;
    circleMousemove: Observable<google.maps.MapMouseEvent>;
    circleMouseout: Observable<google.maps.MapMouseEvent>;
    circleMouseover: Observable<google.maps.MapMouseEvent>;
    circleMouseup: Observable<google.maps.MapMouseEvent>;
    circleRightclick: Observable<google.maps.MapMouseEvent>;
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
    static ɵdir: i0.ɵɵDirectiveDeclaration<MapCircle, "map-circle", ["mapCircle"], { "options": "options"; "center": "center"; "radius": "radius"; }, { "centerChanged": "centerChanged"; "circleClick": "circleClick"; "circleDblclick": "circleDblclick"; "circleDrag": "circleDrag"; "circleDragend": "circleDragend"; "circleDragstart": "circleDragstart"; "circleMousedown": "circleMousedown"; "circleMousemove": "circleMousemove"; "circleMouseout": "circleMouseout"; "circleMouseover": "circleMouseover"; "circleMouseup": "circleMouseup"; "radiusChanged": "radiusChanged"; "circleRightclick": "circleRightclick"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapCircle, never>;
}

export declare class MapDirectionsRenderer implements OnInit, OnChanges, OnDestroy {
    set directions(directions: google.maps.DirectionsResult);
    directionsChanged: Observable<void>;
    directionsRenderer?: google.maps.DirectionsRenderer;
    set options(options: google.maps.DirectionsRendererOptions);
    constructor(_googleMap: GoogleMap, _ngZone: NgZone);
    getDirections(): google.maps.DirectionsResult;
    getPanel(): Node;
    getRouteIndex(): number;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MapDirectionsRenderer, "map-directions-renderer", ["mapDirectionsRenderer"], { "directions": "directions"; "options": "options"; }, { "directionsChanged": "directionsChanged"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapDirectionsRenderer, never>;
}

export interface MapDirectionsResponse {
    result?: google.maps.DirectionsResult;
    status: google.maps.DirectionsStatus;
}

export declare class MapDirectionsService {
    constructor(_ngZone: NgZone);
    route(request: google.maps.DirectionsRequest): Observable<MapDirectionsResponse>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapDirectionsService, never>;
    static ɵprov: i0.ɵɵInjectableDef<MapDirectionsService>;
}

export declare class MapGeocoder {
    constructor(_ngZone: NgZone);
    geocode(request: google.maps.GeocoderRequest): Observable<MapGeocoderResponse>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapGeocoder, never>;
    static ɵprov: i0.ɵɵInjectableDef<MapGeocoder>;
}

export interface MapGeocoderResponse {
    results: google.maps.GeocoderResult[];
    status: google.maps.GeocoderStatus;
}

export declare class MapGroundOverlay implements OnInit, OnDestroy {
    get bounds(): google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
    set bounds(bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral);
    clickable: boolean;
    groundOverlay?: google.maps.GroundOverlay;
    mapClick: Observable<google.maps.MapMouseEvent>;
    mapDblclick: Observable<google.maps.MapMouseEvent>;
    set opacity(opacity: number);
    set url(url: string);
    constructor(_map: GoogleMap, _ngZone: NgZone);
    getBounds(): google.maps.LatLngBounds;
    getOpacity(): number;
    getUrl(): string;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MapGroundOverlay, "map-ground-overlay", ["mapGroundOverlay"], { "url": "url"; "bounds": "bounds"; "clickable": "clickable"; "opacity": "opacity"; }, { "mapClick": "mapClick"; "mapDblclick": "mapDblclick"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapGroundOverlay, never>;
}

export declare class MapHeatmapLayer implements OnInit, OnChanges, OnDestroy {
    set data(data: HeatmapData);
    heatmap?: google.maps.visualization.HeatmapLayer;
    set options(options: Partial<google.maps.visualization.HeatmapLayerOptions>);
    constructor(_googleMap: GoogleMap, _ngZone: NgZone);
    getData(): HeatmapData;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MapHeatmapLayer, "map-heatmap-layer", ["mapHeatmapLayer"], { "data": "data"; "options": "options"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapHeatmapLayer, never>;
}

export declare class MapInfoWindow implements OnInit, OnDestroy {
    closeclick: Observable<void>;
    contentChanged: Observable<void>;
    domready: Observable<void>;
    infoWindow?: google.maps.InfoWindow;
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
    open(anchor?: MapAnchorPoint): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MapInfoWindow, "map-info-window", ["mapInfoWindow"], { "options": "options"; "position": "position"; }, { "closeclick": "closeclick"; "contentChanged": "contentChanged"; "domready": "domready"; "positionChanged": "positionChanged"; "zindexChanged": "zindexChanged"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapInfoWindow, never>;
}

export declare class MapKmlLayer implements OnInit, OnDestroy {
    defaultviewportChanged: Observable<void>;
    kmlClick: Observable<google.maps.KmlMouseEvent>;
    kmlLayer?: google.maps.KmlLayer;
    set options(options: google.maps.KmlLayerOptions);
    statusChanged: Observable<void>;
    set url(url: string);
    constructor(_map: GoogleMap, _ngZone: NgZone);
    getDefaultViewport(): google.maps.LatLngBounds;
    getMetadata(): google.maps.KmlLayerMetadata;
    getStatus(): google.maps.KmlLayerStatus;
    getUrl(): string;
    getZIndex(): number;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MapKmlLayer, "map-kml-layer", ["mapKmlLayer"], { "options": "options"; "url": "url"; }, { "kmlClick": "kmlClick"; "defaultviewportChanged": "defaultviewportChanged"; "statusChanged": "statusChanged"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapKmlLayer, never>;
}

export declare class MapMarker implements OnInit, OnChanges, OnDestroy, MapAnchorPoint {
    animationChanged: Observable<void>;
    set clickable(clickable: boolean);
    clickableChanged: Observable<void>;
    cursorChanged: Observable<void>;
    draggableChanged: Observable<void>;
    flatChanged: Observable<void>;
    set icon(icon: string | google.maps.Icon | google.maps.Symbol);
    iconChanged: Observable<void>;
    set label(label: string | google.maps.MarkerLabel);
    mapClick: Observable<google.maps.MapMouseEvent>;
    mapDblclick: Observable<google.maps.MapMouseEvent>;
    mapDrag: Observable<google.maps.MapMouseEvent>;
    mapDragend: Observable<google.maps.MapMouseEvent>;
    mapDragstart: Observable<google.maps.MapMouseEvent>;
    mapMousedown: Observable<google.maps.MapMouseEvent>;
    mapMouseout: Observable<google.maps.MapMouseEvent>;
    mapMouseover: Observable<google.maps.MapMouseEvent>;
    mapMouseup: Observable<google.maps.MapMouseEvent>;
    mapRightclick: Observable<google.maps.MapMouseEvent>;
    marker?: google.maps.Marker;
    set options(options: google.maps.MarkerOptions);
    set position(position: google.maps.LatLngLiteral | google.maps.LatLng);
    positionChanged: Observable<void>;
    shapeChanged: Observable<void>;
    set title(title: string);
    titleChanged: Observable<void>;
    visibleChanged: Observable<void>;
    zindexChanged: Observable<void>;
    constructor(_googleMap: GoogleMap, _ngZone: NgZone);
    getAnchor(): google.maps.MVCObject;
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
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MapMarker, "map-marker", ["mapMarker"], { "title": "title"; "position": "position"; "label": "label"; "clickable": "clickable"; "options": "options"; "icon": "icon"; }, { "animationChanged": "animationChanged"; "mapClick": "mapClick"; "clickableChanged": "clickableChanged"; "cursorChanged": "cursorChanged"; "mapDblclick": "mapDblclick"; "mapDrag": "mapDrag"; "mapDragend": "mapDragend"; "draggableChanged": "draggableChanged"; "mapDragstart": "mapDragstart"; "flatChanged": "flatChanged"; "iconChanged": "iconChanged"; "mapMousedown": "mapMousedown"; "mapMouseout": "mapMouseout"; "mapMouseover": "mapMouseover"; "mapMouseup": "mapMouseup"; "positionChanged": "positionChanged"; "mapRightclick": "mapRightclick"; "shapeChanged": "shapeChanged"; "titleChanged": "titleChanged"; "visibleChanged": "visibleChanged"; "zindexChanged": "zindexChanged"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapMarker, never>;
}

export declare class MapMarkerClusterer implements OnInit, AfterContentInit, OnChanges, OnDestroy {
    _markers: QueryList<MapMarker>;
    ariaLabelFn: AriaLabelFn;
    set averageCenter(averageCenter: boolean);
    batchSize?: number;
    set batchSizeIE(batchSizeIE: number);
    set calculator(calculator: Calculator);
    set clusterClass(clusterClass: string);
    clusterClick: Observable<Cluster>;
    clusteringbegin: Observable<void>;
    clusteringend: Observable<void>;
    set enableRetinaIcons(enableRetinaIcons: boolean);
    set gridSize(gridSize: number);
    set ignoreHidden(ignoreHidden: boolean);
    set imageExtension(imageExtension: string);
    set imagePath(imagePath: string);
    set imageSizes(imageSizes: number[]);
    markerClusterer?: MarkerClusterer;
    set maxZoom(maxZoom: number);
    set minimumClusterSize(minimumClusterSize: number);
    set options(options: MarkerClustererOptions);
    set styles(styles: ClusterIconStyle[]);
    set title(title: string);
    set zIndex(zIndex: number);
    set zoomOnClick(zoomOnClick: boolean);
    constructor(_googleMap: GoogleMap, _ngZone: NgZone);
    fitMapToMarkers(padding: number | google.maps.Padding): void;
    getAverageCenter(): boolean;
    getBatchSizeIE(): number;
    getCalculator(): Calculator;
    getClusterClass(): string;
    getClusters(): Cluster[];
    getEnableRetinaIcons(): boolean;
    getGridSize(): number;
    getIgnoreHidden(): boolean;
    getImageExtension(): string;
    getImagePath(): string;
    getImageSizes(): number[];
    getMaxZoom(): number;
    getMinimumClusterSize(): number;
    getStyles(): ClusterIconStyle[];
    getTitle(): string;
    getTotalClusters(): number;
    getTotalMarkers(): number;
    getZIndex(): number;
    getZoomOnClick(): boolean;
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵcmp: i0.ɵɵComponentDeclaration<MapMarkerClusterer, "map-marker-clusterer", ["mapMarkerClusterer"], { "ariaLabelFn": "ariaLabelFn"; "averageCenter": "averageCenter"; "batchSize": "batchSize"; "batchSizeIE": "batchSizeIE"; "calculator": "calculator"; "clusterClass": "clusterClass"; "enableRetinaIcons": "enableRetinaIcons"; "gridSize": "gridSize"; "ignoreHidden": "ignoreHidden"; "imageExtension": "imageExtension"; "imagePath": "imagePath"; "imageSizes": "imageSizes"; "maxZoom": "maxZoom"; "minimumClusterSize": "minimumClusterSize"; "styles": "styles"; "title": "title"; "zIndex": "zIndex"; "zoomOnClick": "zoomOnClick"; "options": "options"; }, { "clusteringbegin": "clusteringbegin"; "clusteringend": "clusteringend"; "clusterClick": "clusterClick"; }, ["_markers"], ["*"]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapMarkerClusterer, never>;
}

export declare class MapPolygon implements OnInit, OnDestroy {
    set options(options: google.maps.PolygonOptions);
    set paths(paths: google.maps.MVCArray<google.maps.MVCArray<google.maps.LatLng>> | google.maps.MVCArray<google.maps.LatLng> | google.maps.LatLng[] | google.maps.LatLngLiteral[]);
    polygon?: google.maps.Polygon;
    polygonClick: Observable<google.maps.PolyMouseEvent>;
    polygonDblclick: Observable<google.maps.PolyMouseEvent>;
    polygonDrag: Observable<google.maps.MapMouseEvent>;
    polygonDragend: Observable<google.maps.MapMouseEvent>;
    polygonDragstart: Observable<google.maps.MapMouseEvent>;
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
    static ɵdir: i0.ɵɵDirectiveDeclaration<MapPolygon, "map-polygon", ["mapPolygon"], { "options": "options"; "paths": "paths"; }, { "polygonClick": "polygonClick"; "polygonDblclick": "polygonDblclick"; "polygonDrag": "polygonDrag"; "polygonDragend": "polygonDragend"; "polygonDragstart": "polygonDragstart"; "polygonMousedown": "polygonMousedown"; "polygonMousemove": "polygonMousemove"; "polygonMouseout": "polygonMouseout"; "polygonMouseover": "polygonMouseover"; "polygonMouseup": "polygonMouseup"; "polygonRightclick": "polygonRightclick"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapPolygon, never>;
}

export declare class MapPolyline implements OnInit, OnDestroy {
    set options(options: google.maps.PolylineOptions);
    set path(path: google.maps.MVCArray<google.maps.LatLng> | google.maps.LatLng[] | google.maps.LatLngLiteral[]);
    polyline?: google.maps.Polyline;
    polylineClick: Observable<google.maps.PolyMouseEvent>;
    polylineDblclick: Observable<google.maps.PolyMouseEvent>;
    polylineDrag: Observable<google.maps.MapMouseEvent>;
    polylineDragend: Observable<google.maps.MapMouseEvent>;
    polylineDragstart: Observable<google.maps.MapMouseEvent>;
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
    static ɵdir: i0.ɵɵDirectiveDeclaration<MapPolyline, "map-polyline", ["mapPolyline"], { "options": "options"; "path": "path"; }, { "polylineClick": "polylineClick"; "polylineDblclick": "polylineDblclick"; "polylineDrag": "polylineDrag"; "polylineDragend": "polylineDragend"; "polylineDragstart": "polylineDragstart"; "polylineMousedown": "polylineMousedown"; "polylineMousemove": "polylineMousemove"; "polylineMouseout": "polylineMouseout"; "polylineMouseover": "polylineMouseover"; "polylineMouseup": "polylineMouseup"; "polylineRightclick": "polylineRightclick"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapPolyline, never>;
}

export declare class MapRectangle implements OnInit, OnDestroy {
    set bounds(bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral);
    boundsChanged: Observable<void>;
    set options(options: google.maps.RectangleOptions);
    rectangle?: google.maps.Rectangle;
    rectangleClick: Observable<google.maps.MapMouseEvent>;
    rectangleDblclick: Observable<google.maps.MapMouseEvent>;
    rectangleDrag: Observable<google.maps.MapMouseEvent>;
    rectangleDragend: Observable<google.maps.MapMouseEvent>;
    rectangleDragstart: Observable<google.maps.MapMouseEvent>;
    rectangleMousedown: Observable<google.maps.MapMouseEvent>;
    rectangleMousemove: Observable<google.maps.MapMouseEvent>;
    rectangleMouseout: Observable<google.maps.MapMouseEvent>;
    rectangleMouseover: Observable<google.maps.MapMouseEvent>;
    rectangleMouseup: Observable<google.maps.MapMouseEvent>;
    rectangleRightclick: Observable<google.maps.MapMouseEvent>;
    constructor(_map: GoogleMap, _ngZone: NgZone);
    getBounds(): google.maps.LatLngBounds;
    getDraggable(): boolean;
    getEditable(): boolean;
    getVisible(): boolean;
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MapRectangle, "map-rectangle", ["mapRectangle"], { "options": "options"; "bounds": "bounds"; }, { "boundsChanged": "boundsChanged"; "rectangleClick": "rectangleClick"; "rectangleDblclick": "rectangleDblclick"; "rectangleDrag": "rectangleDrag"; "rectangleDragend": "rectangleDragend"; "rectangleDragstart": "rectangleDragstart"; "rectangleMousedown": "rectangleMousedown"; "rectangleMousemove": "rectangleMousemove"; "rectangleMouseout": "rectangleMouseout"; "rectangleMouseover": "rectangleMouseover"; "rectangleMouseup": "rectangleMouseup"; "rectangleRightclick": "rectangleRightclick"; }, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapRectangle, never>;
}

export declare class MapTrafficLayer implements OnInit, OnDestroy {
    set autoRefresh(autoRefresh: boolean);
    trafficLayer?: google.maps.TrafficLayer;
    constructor(_map: GoogleMap, _ngZone: NgZone);
    ngOnDestroy(): void;
    ngOnInit(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MapTrafficLayer, "map-traffic-layer", ["mapTrafficLayer"], { "autoRefresh": "autoRefresh"; }, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapTrafficLayer, never>;
}

export declare class MapTransitLayer extends MapBaseLayer {
    transitLayer?: google.maps.TransitLayer;
    protected _initializeObject(): void;
    protected _setMap(): void;
    protected _unsetMap(): void;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MapTransitLayer, "map-transit-layer", ["mapTransitLayer"], {}, {}, never>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MapTransitLayer, never>;
}

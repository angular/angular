/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

 /// <reference types="googlemaps" />

/**
 * Class for clustering markers on a Google Map.
 *
 * See
 * googlemaps.github.io/v3-utility-library/classes/_google_markerclustererplus.markerclusterer.html
 */
declare class MarkerClusterer {
  constructor(
      map: google.maps.Map, markers?: google.maps.Marker[], options?: MarkerClustererOptions);
  ariaLabelFn: AriaLabelFn;
  static BATCH_SIZE: number;
  static BATCH_SIZE_IE: number;
  static IMAGE_EXTENSION: string;
  static IMAGE_PATH: string;
  static IMAGE_SIZES: number[];
  addListener(eventName: string, handler: Function): google.maps.MapsEventListener;
  addMarker(marker: MarkerClusterer, nodraw: boolean): void;
  addMarkers(markers: google.maps.Marker[], nodraw?: boolean): void;
  bindTo(key: string, target: google.maps.MVCObject, targetKey: string, noNotify: boolean): void;
  changed(key: string): void;
  clearMarkers(): void;
  fitMapToMarkers(padding: number | google.maps.Padding): void;
  get(key: string): any;
  getAverageCenter(): boolean;
  getBatchSizeIE(): number;
  getCalculator(): Calculator;
  getClusterClass(): string;
  getClusters(): Cluster[];
  getEnableRetinalIcons(): boolean;
  getGridSize(): number;
  getIgnoreHidden(): boolean;
  getImageExtension(): string;
  getImagePath(): string;
  getImageSizes(): number[];
  getMap(): google.maps.Map | google.maps.StreetViewPanorama;
  getMarkers(): google.maps.Marker[];
  getMaxZoom(): number;
  getMinimumClusterSize(): number;
  getPanes(): google.maps.MapPanes;
  getProjection(): google.maps.MapCanvasProjection;
  getStyles(): ClusterIconStyle[];
  getTitle(): string;
  getTotalClusters(): number;
  getTotalMarkers(): number;
  getZIndex(): number;
  getZoomOnClick(): boolean;
  notify(key: string): void;
  removeMarker(marker: google.maps.Marker, nodraw: boolean): boolean;
  removeMarkers(markers: google.maps.Marker[], nodraw?: boolean): boolean;
  repaint(): void;
  set(key: string, value: any): void;
  setAverageCenter(averageCenter: boolean): void;
  setBatchSizeIE(batchSizeIE: number): void;
  setCalculator(calculator: Calculator): void;
  setClusterClass(clusterClass: string): void;
  setEnableRetinalIcons(enableRetinalIcons: boolean): void;
  setGridSize(gridSize: number): void;
  setIgnoreHidden(ignoreHidden: boolean): void;
  setImageExtension(imageExtension: string): void;
  setImagePath(imagePath: string): void;
  setImageSizes(imageSizes: number[]): void;
  setMap(map: google.maps.Map | null): void;
  setMaxZoom(maxZoom: number): void;
  setMinimumClusterSize(minimumClusterSize: number): void;
  setStyles(styles: ClusterIconStyle[]): void;
  setTitle(title: string): void;
  setValues(values: any): void;
  setZIndex(zIndex: number): void;
  setZoomOnClick(zoomOnClick: boolean): void;
  unbind(key: string): void;
  unbindAll(): void;
  static CALCULATOR(markers: google.maps.Marker[], numStyles: number): ClusterIconInfo;
  static withDefaultStyle(overrides: ClusterIconStyle): ClusterIconStyle;
}

/**
 * Cluster class from the @google/markerclustererplus library.
 *
 * See googlemaps.github.io/v3-utility-library/classes/_google_markerclustererplus.cluster.html
 */
declare class Cluster {
  constructor(markerClusterer: MarkerClusterer);
  getCenter(): google.maps.LatLng;
  getMarkers(): google.maps.Marker[];
  getSize(): number;
  updateIcon(): void;
}

/**
 * Options for constructing a MarkerClusterer from the @google/markerclustererplus library.
 *
 * See
 * googlemaps.github.io/v3-utility-library/classes/
 * _google_markerclustererplus.markerclustereroptions.html
 */
declare interface MarkerClustererOptions {
  ariaLabelFn?: AriaLabelFn;
  averageCenter?: boolean;
  batchSize?: number;
  batchSizeIE?: number;
  calculator?: Calculator;
  clusterClass?: string;
  enableRetinalIcons?: boolean;
  gridSize?: number;
  ignoreHidden?: boolean;
  imageExtension?: string;
  imagePath?: string;
  imageSizes?: number[];
  maxZoom?: number;
  minimumClusterSize?: number;
  styles?: ClusterIconStyle[];
  title?: string;
  zIndex?: number;
  zoomOnClick?: boolean;
}

/**
 * Style interface for a marker cluster icon.
 *
 * See
 * googlemaps.github.io/v3-utility-library/interfaces/
 * _google_markerclustererplus.clustericonstyle.html
 */
declare interface ClusterIconStyle {
  anchorIcon?: [number, number];
  anchorText?: [number, number];
  backgroundPosition?: string;
  className?: string;
  fontFamily?: string;
  fontStyle?: string;
  fontWeight?: string;
  height: number;
  textColor?: string;
  textDecoration?: string;
  textLineHeight?: number;
  textSize?: number;
  url?: string;
  width: number;
}

/**
 * Info interface for a marker cluster icon.
 *
 * See
 * googlemaps.github.io/v3-utility-library/interfaces/
 * _google_markerclustererplus.clustericoninfo.html
 */
declare interface ClusterIconInfo {
  index: number;
  text: string;
  title: string;
}

/**
 * Function type alias for determining the aria label on a Google Maps marker cluster.
 *
 * See googlemaps.github.io/v3-utility-library/modules/_google_markerclustererplus.html#arialabelfn
 */
declare type AriaLabelFn = (text: string) => string;

/**
 * Function type alias for calculating how a marker cluster is displayed.
 *
 * See googlemaps.github.io/v3-utility-library/modules/_google_markerclustererplus.html#calculator
 */
declare type Calculator =
    (markers: google.maps.Marker[], clusterIconStylesCount: number) => ClusterIconInfo;

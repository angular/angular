/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="googlemaps" />

import {
  Input,
  OnDestroy,
  OnInit,
  Output,
  NgZone,
  Directive,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {Observable} from 'rxjs';

import {GoogleMap} from '../google-map/google-map';
import {MapEventManager} from '../map-event-manager';
import {MapAnchorPoint} from '../map-anchor-point';

/**
 * Default options for the Google Maps marker component. Displays a marker
 * at the Googleplex.
 */
export const DEFAULT_MARKER_OPTIONS = {
  position: {lat: 37.421995, lng: -122.084092},
};

/**
 * Angular component that renders a Google Maps marker via the Google Maps JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/marker
 */
@Directive({
  selector: 'map-marker',
  exportAs: 'mapMarker',
})
export class MapMarker implements OnInit, OnChanges, OnDestroy, MapAnchorPoint {
  private _eventManager = new MapEventManager(this._ngZone);

  /**
   * Title of the marker.
   * See: developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions.title
   */
  @Input()
  set title(title: string) {
    this._title = title;
  }
  private _title: string;

  /**
   * Title of the marker. See:
   * developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions.position
   */
  @Input()
  set position(position: google.maps.LatLngLiteral|google.maps.LatLng) {
    this._position = position;
  }
  private _position: google.maps.LatLngLiteral|google.maps.LatLng;

  /**
   * Label for the marker.
   * See: developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions.label
   */
  @Input()
  set label(label: string|google.maps.MarkerLabel) {
    this._label = label;
  }
  private _label: string|google.maps.MarkerLabel;

  /**
   * Whether the marker is clickable. See:
   * developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions.clickable
   */
  @Input()
  set clickable(clickable: boolean) {
    this._clickable = clickable;
  }
  private _clickable: boolean;

  /**
   * Options used to configure the marker.
   * See: developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions
   */
  @Input()
  set options(options: google.maps.MarkerOptions) {
    this._options = options;
  }
  private _options: google.maps.MarkerOptions;

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.animation_changed
   */
  @Output()
  animationChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('animation_changed');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.click
   */
  @Output()
  mapClick: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('click');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.clickable_changed
   */
  @Output()
  clickableChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('clickable_changed');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.cursor_changed
   */
  @Output()
  cursorChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('cursor_changed');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.dblclick
   */
  @Output()
  mapDblclick: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('dblclick');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.drag
   */
  @Output()
  mapDrag: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('drag');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.dragend
   */
  @Output()
  mapDragend: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('dragend');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.draggable_changed
   */
  @Output()
  draggableChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('draggable_changed');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.dragstart
   */
  @Output()
  mapDragstart: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('dragstart');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.flat_changed
   */
  @Output() flatChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('flat_changed');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.icon_changed
   */
  @Output() iconChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('icon_changed');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.mousedown
   */
  @Output()
  mapMousedown: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('mousedown');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.mouseout
   */
  @Output()
  mapMouseout: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('mouseout');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.mouseover
   */
  @Output()
  mapMouseover: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('mouseover');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.mouseup
   */
  @Output()
  mapMouseup: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('mouseup');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.position_changed
   */
  @Output()
  positionChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('position_changed');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.rightclick
   */
  @Output()
  mapRightclick: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('rightclick');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.shape_changed
   */
  @Output() shapeChanged:
  Observable<void> = this._eventManager.getLazyEmitter<void>('shape_changed');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.title_changed
   */
  @Output()
  titleChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('title_changed');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.visible_changed
   */
  @Output()
  visibleChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('visible_changed');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.zindex_changed
   */
  @Output()
  zindexChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('zindex_changed');

  /**
   * The underlying google.maps.Marker object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/marker#Marker
   */
  marker?: google.maps.Marker;

  constructor(
    private readonly _googleMap: GoogleMap,
    private _ngZone: NgZone) {}

  ngOnInit() {
    if (this._googleMap._isBrowser) {
      // Create the object outside the zone so its events don't trigger change detection.
      // We'll bring it back in inside the `MapEventManager` only for the events that the
      // user has subscribed to.
      this._ngZone.runOutsideAngular(() => {
        this.marker = new google.maps.Marker(this._combineOptions());
      });
      this._assertInitialized();
      this.marker.setMap(this._googleMap.googleMap!);
      this._eventManager.setTarget(this.marker);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const {marker, _title, _position, _label, _clickable} = this;

    if (marker) {
      if (changes['options']) {
        marker.setOptions(this._combineOptions());
      }

      if (changes['title'] && _title !== undefined) {
        marker.setTitle(_title);
      }

      if (changes['position'] && _position) {
        marker.setPosition(_position);
      }

      if (changes['label'] && _label !== undefined) {
        marker.setLabel(_label);
      }

      if (changes['clickable'] && _clickable !== undefined) {
        marker.setClickable(_clickable);
      }
    }
  }

  ngOnDestroy() {
    this._eventManager.destroy();
    if (this.marker) {
      this.marker.setMap(null);
    }
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getAnimation
   */
  getAnimation(): google.maps.Animation|null {
    this._assertInitialized();
    return this.marker.getAnimation() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getClickable
   */
  getClickable(): boolean {
    this._assertInitialized();
    return this.marker.getClickable();
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getCursor
   */
  getCursor(): string|null {
    this._assertInitialized();
    return this.marker.getCursor() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getDraggable
   */
  getDraggable(): boolean {
    this._assertInitialized();
    return !!this.marker.getDraggable();
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getIcon
   */
  getIcon(): string|google.maps.Icon|google.maps.Symbol|null {
    this._assertInitialized();
    return this.marker.getIcon() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getLabel
   */
  getLabel(): google.maps.MarkerLabel|null {
    this._assertInitialized();
    return this.marker.getLabel() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getOpacity
   */
  getOpacity(): number|null {
    this._assertInitialized();
    return this.marker.getOpacity() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getPosition
   */
  getPosition(): google.maps.LatLng|null {
    this._assertInitialized();
    return this.marker.getPosition() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getShape
   */
  getShape(): google.maps.MarkerShape|null {
    this._assertInitialized();
    return this.marker.getShape() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getTitle
   */
  getTitle(): string|null {
    this._assertInitialized();
    return this.marker.getTitle() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getVisible
   */
  getVisible(): boolean {
    this._assertInitialized();
    return this.marker.getVisible();
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getZIndex
   */
  getZIndex(): number|null {
    this._assertInitialized();
    return this.marker.getZIndex() || null;
  }

  /** Gets the anchor point that can be used to attach other Google Maps objects. */
  getAnchor(): google.maps.MVCObject {
    this._assertInitialized();
    return this.marker;
  }

  /** Creates a combined options object using the passed-in options and the individual inputs. */
  private _combineOptions(): google.maps.MarkerOptions {
    const options = this._options || DEFAULT_MARKER_OPTIONS;
    return {
      ...options,
      title: this._title || options.title,
      position: this._position || options.position,
      label: this._label || options.label,
      clickable: this._clickable !== undefined ? this._clickable : options.clickable,
      map: this._googleMap.googleMap,
    };
  }

  private _assertInitialized(): asserts this is {marker: google.maps.Marker} {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this._googleMap.googleMap) {
        throw Error(
            'Cannot access Google Map information before the API has been initialized. ' +
            'Please wait for the API to load before trying to interact with it.');
      }
      if (!this.marker) {
        throw Error(
            'Cannot interact with a Google Map Marker before it has been ' +
            'initialized. Please wait for the Marker to load before trying to interact with it.');
      }
    }
  }
}

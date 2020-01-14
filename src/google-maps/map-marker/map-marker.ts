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
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';

import {GoogleMap} from '../google-map/google-map';
import {MapEventManager} from '../map-event-manager';

/**
 * Default options for the Google Maps marker component. Displays a marker
 * at the Googleplex.
 */
export const DEFAULT_MARKER_OPTIONS = {
  position: {lat: 37.421995, lng: -122.084092},
};

/**
 * Angular component that renders a Google Maps marker via the Google Maps JavaScript API.
 * @see developers.google.com/maps/documentation/javascript/reference/marker
 */
@Component({
  selector: 'map-marker',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MapMarker implements OnInit, OnDestroy {
  private _eventManager = new MapEventManager();
  private readonly _options =
      new BehaviorSubject<google.maps.MarkerOptions>(DEFAULT_MARKER_OPTIONS);
  private readonly _title = new BehaviorSubject<string|undefined>(undefined);
  private readonly _position =
      new BehaviorSubject<google.maps.LatLngLiteral|google.maps.LatLng|undefined>(undefined);
  private readonly _label =
      new BehaviorSubject<string|google.maps.MarkerLabel|undefined>(undefined);
  private readonly _clickable = new BehaviorSubject<boolean|undefined>(undefined);
  private readonly _destroy = new Subject<void>();

  @Input()
  set options(options: google.maps.MarkerOptions) {
    this._options.next(options || DEFAULT_MARKER_OPTIONS);
  }

  @Input()
  set title(title: string) {
    this._title.next(title);
  }

  @Input()
  set position(position: google.maps.LatLngLiteral|google.maps.LatLng) {
    this._position.next(position);
  }

  @Input()
  set label(label: string|google.maps.MarkerLabel) {
    this._label.next(label);
  }

  @Input()
  set clickable(clickable: boolean) {
    this._clickable.next(clickable);
  }

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

  _marker?: google.maps.Marker;

  constructor(private readonly _googleMap: GoogleMap) {}

  ngOnInit() {
    if (this._googleMap._isBrowser) {
      const combinedOptionsChanges = this._combineOptions();

      combinedOptionsChanges.pipe(take(1)).subscribe(options => {
        this._marker = new google.maps.Marker(options);
        this._marker.setMap(this._googleMap._googleMap);
        this._eventManager.setTarget(this._marker);
      });

      this._watchForOptionsChanges();
      this._watchForTitleChanges();
      this._watchForPositionChanges();
      this._watchForLabelChanges();
      this._watchForClickableChanges();
    }
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
    this._eventManager.destroy();
    if (this._marker) {
      this._marker.setMap(null);
    }
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getAnimation
   */
  getAnimation(): google.maps.Animation|null {
    return this._marker!.getAnimation() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getClickable
   */
  getClickable(): boolean {
    return this._marker!.getClickable();
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getCursor
   */
  getCursor(): string|null {
    return this._marker!.getCursor() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getDraggable
   */
  getDraggable(): boolean {
    return !!this._marker!.getDraggable();
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getIcon
   */
  getIcon(): string|google.maps.Icon|google.maps.Symbol|null {
    return this._marker!.getIcon() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getLabel
   */
  getLabel(): google.maps.MarkerLabel|null {
    return this._marker!.getLabel() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getOpacity
   */
  getOpacity(): number|null {
    return this._marker!.getOpacity() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getPosition
   */
  getPosition(): google.maps.LatLng|null {
    return this._marker!.getPosition() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getShape
   */
  getShape(): google.maps.MarkerShape|null {
    return this._marker!.getShape() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getTitle
   */
  getTitle(): string|null {
    return this._marker!.getTitle() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getVisible
   */
  getVisible(): boolean {
    return this._marker!.getVisible();
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getZIndex
   */
  getZIndex(): number|null {
    return this._marker!.getZIndex() || null;
  }

  private _combineOptions(): Observable<google.maps.MarkerOptions> {
    return combineLatest([this._options, this._title, this._position, this._label, this._clickable])
        .pipe(map(([options, title, position, label, clickable]) => {
          const combinedOptions: google.maps.MarkerOptions = {
            ...options,
            title: title || options.title,
            position: position || options.position,
            label: label || options.label,
            clickable: clickable !== undefined ? clickable : options.clickable,
            map: this._googleMap._googleMap || null,
          };
          return combinedOptions;
        }));
  }

  private _watchForOptionsChanges() {
    this._options.pipe(takeUntil(this._destroy)).subscribe(options => {
      if (this._marker) {
        this._marker.setOptions(options);
      }
    });
  }

  private _watchForTitleChanges() {
    this._title.pipe(takeUntil(this._destroy)).subscribe(title => {
      if (this._marker && title !== undefined) {
        this._marker.setTitle(title);
      }
    });
  }

  private _watchForPositionChanges() {
    this._position.pipe(takeUntil(this._destroy)).subscribe(position => {
      if (this._marker && position) {
        this._marker.setPosition(position);
      }
    });
  }

  private _watchForLabelChanges() {
    this._label.pipe(takeUntil(this._destroy)).subscribe(label => {
      if (this._marker && label !== undefined) {
        this._marker.setLabel(label);
      }
    });
  }

  private _watchForClickableChanges() {
    this._clickable.pipe(takeUntil(this._destroy)).subscribe(clickable => {
      if (this._marker && clickable !== undefined) {
        this._marker.setClickable(clickable);
      }
    });
  }
}

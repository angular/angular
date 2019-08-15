import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';

interface GoogleMapsWindow extends Window {
  google?: typeof google;
}

/** default options set to the Googleplex */
export const DEFAULT_OPTIONS: google.maps.MapOptions = {
  center: {lat: 37.421995, lng: -122.084092},
  zoom: 17,
};

/** Arbitrary default height for the map element */
export const DEFAULT_HEIGHT = '500px';
/** Arbitrary default width for the map element */
export const DEFAULT_WIDTH = '500px';

/**
 * Angular component that renders a Google Map via the Google Maps JavaScript
 * API.
 * @see https://developers.google.com/maps/documentation/javascript/reference/
 */
@Component({
  selector: 'google-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div class="map-container"></div>',
})
export class GoogleMap implements OnChanges, OnInit, OnDestroy {
  @Input() height = DEFAULT_HEIGHT;

  @Input() width = DEFAULT_WIDTH;

  @Input()
  set center(center: google.maps.LatLngLiteral) {
    this._center.next(center);
  }
  @Input()
  set zoom(zoom: number) {
    this._zoom.next(zoom);
  }
  @Input()
  set options(options: google.maps.MapOptions) {
    this._options.next(options || DEFAULT_OPTIONS);
  }

  // TODO(mbehrlich): Add event handlers, properties, and methods.

  private _mapEl?: HTMLElement;

  private readonly _options = new BehaviorSubject<google.maps.MapOptions>(DEFAULT_OPTIONS);
  private readonly _center = new BehaviorSubject<google.maps.LatLngLiteral|undefined>(undefined);
  private readonly _zoom = new BehaviorSubject<number|undefined>(undefined);

  private readonly _destroy = new Subject<void>();

  constructor(private readonly _elementRef: ElementRef) {
    const googleMapsWindow: GoogleMapsWindow = window;
    if (!googleMapsWindow.google) {
      throw Error(
          'Namespace google not found, cannot construct embedded google ' +
          'map. Please install the Google Maps JavaScript API: ' +
          'https://developers.google.com/maps/documentation/javascript/' +
          'tutorial#Loading_the_Maps_API');
    }
  }

  ngOnChanges() {
    this._setSize();
  }

  ngOnInit() {
    this._mapEl = this._elementRef.nativeElement.querySelector('.map-container')!;
    this._setSize();

    const combinedOptionsChanges = this._combineOptions();

    const googleMapChanges = this._initializeMap(combinedOptionsChanges);
    googleMapChanges.subscribe();

    this._watchForOptionsChanges(googleMapChanges, combinedOptionsChanges);
  }

  private _setSize() {
    if (this._mapEl) {
      this._mapEl.style.height = this.height || DEFAULT_HEIGHT;
      this._mapEl.style.width = this.width || DEFAULT_WIDTH;
    }
  }

  /** Combines the center and zoom and the other map options into a single object */
  private _combineOptions(): Observable<google.maps.MapOptions> {
    return combineLatest(this._options, this._center, this._zoom)
        .pipe(map(([options, center, zoom]) => {
          const combinedOptions: google.maps.MapOptions = {
            ...options,
            center: center || options.center,
            zoom: zoom !== undefined ? zoom : options.zoom,
          };
          return combinedOptions;
        }));
  }

  private _initializeMap(optionsChanges: Observable<google.maps.MapOptions>):
      Observable<google.maps.Map> {
    return optionsChanges.pipe(take(1), map(options => new google.maps.Map(this._mapEl!, options)));
  }

  private _watchForOptionsChanges(
      googleMapChanges: Observable<google.maps.Map>,
      optionsChanges: Observable<google.maps.MapOptions>) {
    combineLatest(googleMapChanges, optionsChanges)
        .pipe(takeUntil(this._destroy))
        .subscribe(([googleMap, options]) => {
          googleMap.setOptions(options);
        });
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}

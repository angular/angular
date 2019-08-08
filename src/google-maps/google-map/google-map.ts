import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
} from '@angular/core';
import {ReplaySubject} from 'rxjs';

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
export class GoogleMap implements OnInit {
  // Arbitrarily chosen default size
  @Input() height = '500px';
  @Input() width = '500px';

  // TODO(mbehrlich): add options, handlers, properties, and methods.

  private readonly _map$ = new ReplaySubject<google.maps.Map>(1);

  constructor(private readonly _elementRef: ElementRef) {}

  ngOnInit() {
    // default options set to the Googleplex
    const options: google.maps.MapOptions = {
      center: {lat: 37.421995, lng: -122.084092},
      zoom: 17,
    };

    const mapEl = this._elementRef.nativeElement.querySelector('.map-container');
    mapEl.style.height = this.height;
    mapEl.style.width = this.width;
    const map = new google.maps.Map(mapEl, options);
    this._map$.next(map);
  }
}

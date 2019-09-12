/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UpdatedGoogleMap} from '../google-map/index';

/** Window interface for testing */
export interface TestingWindow extends Window {
  google?: {
    maps: {
      Map?: jasmine.Spy;
      Marker?: jasmine.Spy;
    };
  };
}

/** Creates a jasmine.SpyObj for a google.maps.Map. */
export function createMapSpy(options: google.maps.MapOptions): jasmine.SpyObj<UpdatedGoogleMap> {
  const mapSpy = jasmine.createSpyObj('google.maps.Map', [
    'setOptions', 'setMap', 'addListener', 'fitBounds', 'panBy', 'panTo', 'panToBounds',
    'getBounds', 'getCenter', 'getClickableIcons', 'getHeading', 'getMapTypeId', 'getProjection',
    'getStreetView', 'getTilt', 'getZoom'
  ]);
  mapSpy.addListener.and.returnValue({remove: () => {}});
  return mapSpy;
}

/** Creates a jasmine.Spy to watch for the constructor of a google.maps.Map. */
export function createMapConstructorSpy(
    mapSpy: jasmine.SpyObj<UpdatedGoogleMap>, apiLoaded = true): jasmine.Spy {
  const mapConstructorSpy =
      jasmine.createSpy('Map constructor', (_el: Element, _options: google.maps.MapOptions) => {
        return mapSpy;
      });
  const testingWindow: TestingWindow = window;
  if (apiLoaded) {
    testingWindow.google = {
      maps: {
        'Map': mapConstructorSpy,
      }
    };
  }
  return mapConstructorSpy;
}

/** Creates a jasmine.SpyObj for a google.maps.Marker */
export function createMarkerSpy(options: google.maps.MarkerOptions):
    jasmine.SpyObj<google.maps.Marker> {
  const markerSpy = jasmine.createSpyObj('google.maps.Marker', [
    'setOptions', 'setMap', 'addListener', 'getAnimation', 'getClickable', 'getCursor',
    'getDraggable', 'getIcon', 'getLabel', 'getOpacity', 'getPosition', 'getShape', 'getTitle',
    'getVisible', 'getZIndex'
  ]);
  markerSpy.addListener.and.returnValue({remove: () => {}});
  return markerSpy;
}

/** Creates a jasmine.Spy to watch for the constructor of a google.maps.Marker */
export function createMarkerConstructorSpy(markerSpy: jasmine.SpyObj<google.maps.Marker>):
    jasmine.Spy {
  const markerConstructorSpy =
      jasmine.createSpy('Marker constructor', (_options: google.maps.MarkerOptions) => {
        return markerSpy;
      });
  const testingWindow: TestingWindow = window;
  testingWindow.google = {
    maps: {
      'Marker': markerConstructorSpy,
    },
  };
  return markerConstructorSpy;
}

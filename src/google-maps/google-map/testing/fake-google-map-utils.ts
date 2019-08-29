import {UpdatedGoogleMap} from '../index';

/** Window interface for testing */
export interface TestingWindow extends Window {
  google?: {
    maps: {
      Map: jasmine.Spy;
    };
  };
}

/** Creates a jasmine.SpyObj for a google.maps.Map. */
export function createMapSpy(options: google.maps.MapOptions): jasmine.SpyObj<UpdatedGoogleMap> {
  const mapSpy = jasmine.createSpyObj('google.maps.Map', [
    'setOptions', 'addListener', 'fitBounds', 'panBy', 'panTo', 'panToBounds', 'getBounds',
    'getCenter', 'getClickableIcons', 'getHeading', 'getMapTypeId', 'getProjection',
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

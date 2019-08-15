/** Window interface for testing */
export interface TestingWindow extends Window {
  google?: {
    maps: {
      Map: jasmine.Spy;
    };
  };
}

/** Creates a jasmine.SpyObj for a google.maps.Map. */
export function createMapSpy(options: google.maps.MapOptions): jasmine.SpyObj<google.maps.Map> {
  return jasmine.createSpyObj('google.maps.Map', ['setOptions']);
}

/** Creates a jasmine.Spy to watch for the constructor of a google.maps.Map. */
export function createMapConstructorSpy(
    mapSpy: jasmine.SpyObj<google.maps.Map>, apiLoaded = true): jasmine.Spy {
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

declare global {
  interface Window {
    google?: {
      maps: {
        Map: jasmine.Spy;
      };
    };
  }
}

/** Creates a jasmine.SpyObj for a google.maps.Map. */
export function createMapSpy(options: google.maps.MapOptions): jasmine.SpyObj<google.maps.Map> {
  return jasmine.createSpyObj('Map', ['getDiv']);
}

/** Creates a jasmine.Spy to watch for the constructor of a google.maps.Map. */
export function createMapConstructorSpy(mapSpy: jasmine.SpyObj<google.maps.Map>): jasmine.Spy {
  const mapConstructorSpy =
      jasmine.createSpy('Map constructor', (_el: Element, _options: google.maps.MapOptions) => {
        return mapSpy;
      });
  window.google = {
    maps: {
      'Map': mapConstructorSpy,
    }
  };
  return mapConstructorSpy;
}

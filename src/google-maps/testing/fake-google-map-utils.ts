/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// The global `window` variable is typed as an intersection of `Window` and `globalThis`.
// We re-declare `window` here and omit `globalThis` as it is typed with the actual Google
// Maps types which we intend to override with jasmine spies for testing. Keeping `globalThis`
// would mean that `window` is not assignable to our testing window.
declare var window: Window;

/** Window interface for testing */
export interface TestingWindow extends Window {
  google?: {
    maps: {
      Map?: jasmine.Spy;
      Marker?: jasmine.Spy;
      InfoWindow?: jasmine.Spy;
      Polyline?: jasmine.Spy;
      Polygon?: jasmine.Spy;
      Rectangle?: jasmine.Spy;
      Circle?: jasmine.Spy;
      GroundOverlay?: jasmine.Spy;
      KmlLayer?: jasmine.Spy;
      TrafficLayer?: jasmine.Spy;
      TransitLayer?: jasmine.Spy;
      BicyclingLayer?: jasmine.Spy;
    };
  };
  MarkerClusterer?: jasmine.Spy;
}

/** Creates a jasmine.SpyObj for a google.maps.Map. */
export function createMapSpy(options: google.maps.MapOptions): jasmine.SpyObj<google.maps.Map> {
  const mapSpy = jasmine.createSpyObj('google.maps.Map', [
    'setOptions', 'setCenter', 'setZoom', 'setMap', 'addListener', 'fitBounds', 'panBy', 'panTo',
    'panToBounds', 'getBounds', 'getCenter', 'getClickableIcons', 'getHeading', 'getMapTypeId',
    'getProjection', 'getStreetView', 'getTilt', 'getZoom', 'setMapTypeId'
  ]);
  mapSpy.addListener.and.returnValue({remove: () => {}});
  return mapSpy;
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
  if (testingWindow.google && testingWindow.google.maps) {
    testingWindow.google.maps['Marker'] = markerConstructorSpy;
  } else {
    testingWindow.google = {
      maps: {
        'Marker': markerConstructorSpy,
      },
    };
  }
  return markerConstructorSpy;
}

/** Creates a jasmine.SpyObj for a google.maps.InfoWindow */
export function createInfoWindowSpy(options: google.maps.InfoWindowOptions):
    jasmine.SpyObj<google.maps.InfoWindow> {
  let anchor: any;
  const infoWindowSpy = jasmine.createSpyObj(
      'google.maps.InfoWindow',
      ['addListener', 'close', 'getContent', 'getPosition', 'getZIndex', 'open', 'get']);
  infoWindowSpy.addListener.and.returnValue({remove: () => {}});
  infoWindowSpy.open.and.callFake((_map: any, target: any) => anchor = target);
  infoWindowSpy.close.and.callFake(() => anchor = null);
  infoWindowSpy.get.and.callFake((key: string) => key === 'anchor' ? anchor : null);
  return infoWindowSpy;
}

/** Creates a jasmine.Spy to watch for the constructor of a google.maps.InfoWindow */
export function createInfoWindowConstructorSpy(
    infoWindowSpy: jasmine.SpyObj<google.maps.InfoWindow>): jasmine.Spy {
  const infoWindowConstructorSpy =
      jasmine.createSpy('InfoWindow constructor', (_options: google.maps.InfoWindowOptions) => {
        return infoWindowSpy;
      });
  const testingWindow: TestingWindow = window;
  if (testingWindow.google && testingWindow.google.maps) {
    testingWindow.google.maps['InfoWindow'] = infoWindowConstructorSpy;
  } else {
    testingWindow.google = {
      maps: {
        'InfoWindow': infoWindowConstructorSpy,
      },
    };
  }
  return infoWindowConstructorSpy;
}

/** Creates a jasmine.SpyObj for a google.maps.Polyline */
export function createPolylineSpy(options: google.maps.PolylineOptions):
    jasmine.SpyObj<google.maps.Polyline> {
  const polylineSpy = jasmine.createSpyObj('google.maps.Polyline', [
    'addListener', 'getDraggable', 'getEditable', 'getPath', 'getVisible', 'setMap', 'setOptions',
    'setPath'
  ]);
  polylineSpy.addListener.and.returnValue({remove: () => {}});
  return polylineSpy;
}

/** Creates a jasmine.Spy to watch for the constructor of a google.maps.Polyline */
export function createPolylineConstructorSpy(polylineSpy: jasmine.SpyObj<google.maps.Polyline>):
    jasmine.Spy {
  const polylineConstructorSpy =
      jasmine.createSpy('Polyline constructor', (_options: google.maps.PolylineOptions) => {
        return polylineSpy;
      });
  const testingWindow: TestingWindow = window;
  if (testingWindow.google && testingWindow.google.maps) {
    testingWindow.google.maps['Polyline'] = polylineConstructorSpy;
  } else {
    testingWindow.google = {
      maps: {
        'Polyline': polylineConstructorSpy,
      },
    };
  }
  return polylineConstructorSpy;
}

/** Creates a jasmine.SpyObj for a google.maps.Polygon */
export function createPolygonSpy(options: google.maps.PolygonOptions):
    jasmine.SpyObj<google.maps.Polygon> {
  const polygonSpy = jasmine.createSpyObj('google.maps.Polygon', [
    'addListener', 'getDraggable', 'getEditable', 'getPath', 'getPaths', 'getVisible', 'setMap',
    'setOptions', 'setPath'
  ]);
  polygonSpy.addListener.and.returnValue({remove: () => {}});
  return polygonSpy;
}

/** Creates a jasmine.Spy to watch for the constructor of a google.maps.Polygon */
export function createPolygonConstructorSpy(polygonSpy: jasmine.SpyObj<google.maps.Polygon>):
    jasmine.Spy {
  const polygonConstructorSpy =
      jasmine.createSpy('Polygon constructor', (_options: google.maps.PolygonOptions) => {
        return polygonSpy;
      });
  const testingWindow: TestingWindow = window;
  if (testingWindow.google && testingWindow.google.maps) {
    testingWindow.google.maps['Polygon'] = polygonConstructorSpy;
  } else {
    testingWindow.google = {
      maps: {
        'Polygon': polygonConstructorSpy,
      },
    };
  }
  return polygonConstructorSpy;
}

/** Creates a jasmine.SpyObj for a google.maps.Rectangle */
export function createRectangleSpy(options: google.maps.RectangleOptions):
    jasmine.SpyObj<google.maps.Rectangle> {
  const rectangleSpy = jasmine.createSpyObj('google.maps.Rectangle', [
    'addListener', 'getBounds', 'getDraggable', 'getEditable', 'getVisible', 'setMap', 'setOptions',
    'setBounds'
  ]);
  rectangleSpy.addListener.and.returnValue({remove: () => {}});
  return rectangleSpy;
}

/** Creates a jasmine.Spy to watch for the constructor of a google.maps.Rectangle */
export function createRectangleConstructorSpy(rectangleSpy: jasmine.SpyObj<google.maps.Rectangle>):
    jasmine.Spy {
  const rectangleConstructorSpy =
      jasmine.createSpy('Rectangle constructor', (_options: google.maps.RectangleOptions) => {
        return rectangleSpy;
      });
  const testingWindow: TestingWindow = window;
  if (testingWindow.google && testingWindow.google.maps) {
    testingWindow.google.maps['Rectangle'] = rectangleConstructorSpy;
  } else {
    testingWindow.google = {
      maps: {
        'Rectangle': rectangleConstructorSpy,
      },
    };
  }
  return rectangleConstructorSpy;
}

/** Creates a jasmine.SpyObj for a google.maps.Circle */
export function createCircleSpy(options: google.maps.CircleOptions):
    jasmine.SpyObj<google.maps.Circle> {
  const circleSpy = jasmine.createSpyObj('google.maps.Circle', [
    'addListener', 'getCenter', 'getRadius', 'getDraggable', 'getEditable', 'getVisible', 'setMap',
    'setOptions', 'setCenter', 'setRadius'
  ]);
  circleSpy.addListener.and.returnValue({remove: () => {}});
  return circleSpy;
}

/** Creates a jasmine.Spy to watch for the constructor of a google.maps.Circle */
export function createCircleConstructorSpy(circleSpy: jasmine.SpyObj<google.maps.Circle>):
    jasmine.Spy {
  const circleConstructorSpy =
      jasmine.createSpy('Circle constructor', (_options: google.maps.CircleOptions) => {
        return circleSpy;
      });
  const testingWindow: TestingWindow = window;
  if (testingWindow.google && testingWindow.google.maps) {
    testingWindow.google.maps['Circle'] = circleConstructorSpy;
  } else {
    testingWindow.google = {
      maps: {
        'Circle': circleConstructorSpy,
      },
    };
  }
  return circleConstructorSpy;
}

/** Creates a jasmine.SpyObj for a google.maps.GroundOverlay */
export function createGroundOverlaySpy(
    url: string, bounds: google.maps.LatLngBoundsLiteral,
    options?: google.maps.GroundOverlayOptions): jasmine.SpyObj<google.maps.GroundOverlay> {
  const values: {[key: string]: any} = {url};
  const groundOverlaySpy = jasmine.createSpyObj('google.maps.GroundOverlay', [
    'addListener',
    'getBounds',
    'getOpacity',
    'getUrl',
    'setMap',
    'setOpacity',
    'set',
  ]);
  groundOverlaySpy.addListener.and.returnValue({remove: () => {}});
  groundOverlaySpy.set.and.callFake((key: string, value: any) => values[key] = value);
  return groundOverlaySpy;
}

/** Creates a jasmine.Spy to watch for the constructor of a google.maps.GroundOverlay */
export function createGroundOverlayConstructorSpy(
    groundOverlaySpy: jasmine.SpyObj<google.maps.GroundOverlay>): jasmine.Spy {
  const groundOverlayConstructorSpy = jasmine.createSpy(
      'GroundOverlay constructor',
      (_url: string, _bounds: google.maps.LatLngBoundsLiteral,
       _options: google.maps.GroundOverlayOptions) => {
        return groundOverlaySpy;
      });
  const testingWindow: TestingWindow = window;
  if (testingWindow.google && testingWindow.google.maps) {
    testingWindow.google.maps['GroundOverlay'] = groundOverlayConstructorSpy;
  } else {
    testingWindow.google = {
      maps: {
        'GroundOverlay': groundOverlayConstructorSpy,
      },
    };
  }
  return groundOverlayConstructorSpy;
}

/** Creates a jasmine.SpyObj for a google.maps.KmlLayer */
export function createKmlLayerSpy(options?: google.maps.KmlLayerOptions):
    jasmine.SpyObj<google.maps.KmlLayer> {
  const kmlLayerSpy = jasmine.createSpyObj('google.maps.KmlLayer', [
    'addListener',
    'getDefaultViewport',
    'getMetadata',
    'getStatus',
    'getUrl',
    'getZIndex',
    'setOptions',
    'setUrl',
    'setMap',
  ]);
  kmlLayerSpy.addListener.and.returnValue({remove: () => {}});
  return kmlLayerSpy;
}

/** Creates a jasmine.Spy to watch for the constructor of a google.maps.KmlLayer */
export function createKmlLayerConstructorSpy(kmlLayerSpy: jasmine.SpyObj<google.maps.KmlLayer>):
    jasmine.Spy {
  const kmlLayerConstructorSpy =
      jasmine.createSpy('KmlLayer constructor', (_options: google.maps.KmlLayerOptions) => {
        return kmlLayerSpy;
      });
  const testingWindow: TestingWindow = window;
  if (testingWindow.google && testingWindow.google.maps) {
    testingWindow.google.maps['KmlLayer'] = kmlLayerConstructorSpy;
  } else {
    testingWindow.google = {
      maps: {
        'KmlLayer': kmlLayerConstructorSpy,
      },
    };
  }
  return kmlLayerConstructorSpy;
}

/** Creates a jasmine.SpyObj for a google.maps.TrafficLayer */
export function createTrafficLayerSpy(options?: google.maps.TrafficLayerOptions):
    jasmine.SpyObj<google.maps.TrafficLayer> {
  const trafficLayerSpy = jasmine.createSpyObj('google.maps.TrafficLayer', [
    'setOptions',
    'setMap',
  ]);
  return trafficLayerSpy;
}

/** Creates a jasmine.Spy to watch for the constructor of a google.maps.TrafficLayer */
export function createTrafficLayerConstructorSpy(
    trafficLayerSpy: jasmine.SpyObj<google.maps.TrafficLayer>): jasmine.Spy {
  const trafficLayerConstructorSpy =
      jasmine.createSpy('TrafficLayer constructor', (_options: google.maps.TrafficLayerOptions) => {
        return trafficLayerSpy;
      });
  const testingWindow: TestingWindow = window;
  if (testingWindow.google && testingWindow.google.maps) {
    testingWindow.google.maps['TrafficLayer'] = trafficLayerConstructorSpy;
  } else {
    testingWindow.google = {
      maps: {
        'TrafficLayer': trafficLayerConstructorSpy,
      },
    };
  }
  return trafficLayerConstructorSpy;
}

/** Creates a jasmine.SpyObj for a google.maps.TransitLayer */
export function createTransitLayerSpy(): jasmine.SpyObj<google.maps.TransitLayer> {
  const transitLayerSpy = jasmine.createSpyObj('google.maps.TransitLayer', [
    'setMap',
  ]);
  return transitLayerSpy;
}

/** Creates a jasmine.Spy to watch for the constructor of a google.maps.TransitLayer */
export function createTransitLayerConstructorSpy(
    transitLayerSpy: jasmine.SpyObj<google.maps.TransitLayer>): jasmine.Spy {
  const transitLayerConstructorSpy = jasmine.createSpy('TransitLayer constructor', () => {
    return transitLayerSpy;
  });
  const testingWindow: TestingWindow = window;
  if (testingWindow.google && testingWindow.google.maps) {
    testingWindow.google.maps['TransitLayer'] = transitLayerConstructorSpy;
  } else {
    testingWindow.google = {
      maps: {
        'TransitLayer': transitLayerConstructorSpy,
      },
    };
  }
  return transitLayerConstructorSpy;
}

/** Creates a jasmine.SpyObj for a google.maps.BicyclingLayer */
export function createBicyclingLayerSpy(): jasmine.SpyObj<google.maps.BicyclingLayer> {
  const bicylingLayerSpy = jasmine.createSpyObj('google.maps.BicyclingLayer', [
    'setMap',
  ]);
  return bicylingLayerSpy;
}

/** Creates a jasmine.Spy to watch for the constructor of a google.maps.BicyclingLayer */
export function createBicyclingLayerConstructorSpy(
    bicylingLayerSpy: jasmine.SpyObj<google.maps.BicyclingLayer>): jasmine.Spy {
  const bicylingLayerConstructorSpy = jasmine.createSpy('BicyclingLayer constructor', () => {
    return bicylingLayerSpy;
  });
  const testingWindow: TestingWindow = window;
  if (testingWindow.google && testingWindow.google.maps) {
    testingWindow.google.maps['BicyclingLayer'] = bicylingLayerConstructorSpy;
  } else {
    testingWindow.google = {
      maps: {
        'BicyclingLayer': bicylingLayerConstructorSpy,
      },
    };
  }
  return bicylingLayerConstructorSpy;
}

/** Creates a jasmine.SpyObj for a MarkerClusterer */
export function createMarkerClustererSpy(): jasmine.SpyObj<MarkerClusterer> {
  const markerClustererSpy = jasmine.createSpyObj('MarkerClusterer', ['addListener',
    'addMarkers', 'fitMapToMarkers', 'getAverageCenter', 'getBatchSizeIE',
    'getCalculator', 'getClusterClass', 'getClusters', 'getEnableRetinalIcons',
    'getGridSize', 'getIgnoreHidden', 'getImageExtension', 'getImagePath',
    'getImageSizes', 'getMaxZoom', 'getMinimumClusterSize', 'getStyles',
    'getTitle', 'getTotalClusters', 'getTotalMarkers', 'getZIndex', 'getZoomOnClick',
    'removeMarkers', 'repaint', 'setAverageCenter', 'setBatchSizeIE',
    'setCalculator', 'setClusterClass', 'setEnableRetinalIcons', 'setGridSize',
    'setIgnoreHidden', 'setImageExtension', 'setImagePath', 'setImageSizes', 'setMap',
    'setMaxZoom', 'setMinimumClusterSize', 'setStyles', 'setTitle', 'setZIndex',
    'setZoomOnClick',
  ]);
  markerClustererSpy.addListener.and.returnValue({ remove: () => { } });
  return markerClustererSpy;
}

/** Creates a jasmine.Spy to watch for the constructor of a MarkerClusterer */
export function createMarkerClustererConstructorSpy(
  markerClustererSpy: jasmine.SpyObj<MarkerClusterer>): jasmine.Spy {
  const markerClustererConstructorSpy = jasmine.createSpy('MarkerClusterer constructor',
      () => {
    return markerClustererSpy;
  });
  const testingWindow: TestingWindow = window;
  testingWindow['MarkerClusterer'] = markerClustererConstructorSpy;
  return markerClustererConstructorSpy;
}

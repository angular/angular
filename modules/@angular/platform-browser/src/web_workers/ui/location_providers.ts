import {MessageBasedPlatformLocation} from './platform_location';
import {BrowserPlatformLocation} from '../../browser/location/browser_platform_location';
import {APP_INITIALIZER, Injector, NgZone} from '@angular/core';

/**
 * A list of {@link Provider}s. To use the router in a Worker enabled application you must
 * include these providers when setting up the render thread.
 */
export const WORKER_RENDER_LOCATION_PROVIDERS = [
  MessageBasedPlatformLocation,
  BrowserPlatformLocation,
  {provide: APP_INITIALIZER, useFactory: initUiLocation, multi: true, deps: [Injector]}
];

function initUiLocation(injector: Injector): () => void {
  return () => {
    let zone = injector.get(NgZone);

    zone.runGuarded(() => injector.get(MessageBasedPlatformLocation).start());
  };
}

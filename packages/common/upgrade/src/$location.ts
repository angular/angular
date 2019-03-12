/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UpgradeModule} from '@angular/upgrade/static';

import {LocationUpgradeService} from './location_upgrade_service';
import {stripPrefix} from './utils';

export class LocationProvider {
  private initalizing = true;
  constructor(private $rootScope: any, private location: LocationUpgradeService) {
    location.onUrlChange((oldUrl, oldState, newUrl, newState) => {
      const defaultPrevented =
          this.$rootScope.$broadcast('$locationChangeStart', newUrl, oldUrl, newState, oldState)
              .defaultPrevented;

      // If default was prevented, set back to old state
      if (defaultPrevented) {
        this.$$parse(oldUrl);
        location.state(oldState);
        // TODO(jasonaden): Test what happens with setBrowserUrlWithFallback
        location.updateLocation();
      } else {
        this.initalizing = false;
        $rootScope.$broadcast('$locationChangeSuccess', newUrl, oldUrl, newState, oldState);
      }
    });

    $rootScope.$watch(() => {
      const oldUrl = this.location.getLastUrl();
      const oldState = this.location.getLastState();
      const newUrl = this.location.absUrl();
      const newState = this.location.state();

      const urlOrStateChanged = oldUrl !== newUrl || oldState !== newState;

      // Fire location changes one time to start. This must be done on the next tick in order
      // for listeners to be registered before the event fires. Mimicing behavior from
      // $locationWatch:
      // https://github.com/angular/angular.js/blob/master/src/ng/location.js#L983
      if (this.initalizing || urlOrStateChanged) {
        this.initalizing = false;
        $rootScope.$evalAsync(() => {
          const defaultPrevented =
              this.$rootScope.$broadcast('$locationChangeStart', newUrl, oldUrl, newState, oldState)
                  .defaultPrevented;

          // if the location was changed by a `$locationChangeStart` handler then stop
          // processing this location change
          if (this.location.absUrl() !== newUrl) return;

          if (defaultPrevented) {
            this.$$parse(oldUrl);
            this.location.state(oldState);
          } else {
            // This block doesn't run when initalizing because it's going to perform the update to
            // the URL which shouldn't be needed when initalizing.
            if (urlOrStateChanged) {
              location.updateLocation();
            }
            $rootScope.$broadcast('$locationChangeSuccess', newUrl, oldUrl, newState, oldState);
          }
        });
      }
    });
  }

  // TODO(jasonaden): Confirm the difference between these two methods in AngularJS source. Check
  // why fallback in "update browser" section passes oldUrl to $$parse (they both remove server
  // portion of the URL).
  $$parse(url: string) {
    // Remove protocol & hostname if URL starts with it
    const serverUrl = this.location.getServerBase();
    if (url.startsWith(serverUrl)) {
      url = stripPrefix(url, serverUrl);
    } else {
      throw new Error(`Invalid url "${url}", missing path prefix "${serverUrl}".`);
    }

    this.url(url);
  }

  $$parseLinkUrl(url: string, relHref?: string): boolean {
    // When relHref is passed, it should be a hash and is handled separately
    if (relHref && relHref[0] === '#') {
      this.hash(relHref.slice(1));
      return true;
    }

    // Remove protocol & hostname if URL starts with it
    const serverUrl = this.location.getServerBase();

    // If the link is targeting a different hostname/port than the current app, do nothing
    if (!this.location.normalize(url).startsWith(this.location.normalize(serverUrl))) {
      return false;
    }
    // Strip serverUrl
    url = this.location.stripServerPrefix(url);
    // Strip prefix if URL starts with it
    url = this.location.stripBaseHref(url);
    // Set the URL
    this.url(url);
    return true;
  }

  get $$state() { return this.state(); }

  absUrl(): string { return this.location.absUrl(); }

  url(): string;
  url(url: string): this;
  url(url?: string): string|this {
    if (typeof url === 'undefined') {
      return this.location.url();
    } else {
      this.location.url(url);
      return this;
    }
  }

  protocol(): string { return this.location.protocol(); }

  host(): string { return this.location.host(); }

  port(): number|null { return this.location.port(); }

  path(): string;
  path(path: string|number|null): this;
  path(path?: string|number|null) {
    if (typeof path === 'undefined') {
      return this.location.path();
    } else {
      this.location.path(path);
      return this;
    }
  }

  search(): {[key: string]: unknown};
  search(search: string|number|{[key: string]: unknown}): this;
  search(
      search: string|number|{[key: string]: unknown},
      paramValue: null|undefined|string|number|boolean|string[]): this;
  search(
      search?: string|number|{[key: string]: unknown},
      paramValue?: null|undefined|string|number|boolean|string[]): {[key: string]: unknown}|this {
    switch (arguments.length) {
      case 0:
        return this.location.search();
      case 1:
        this.location.search(search !);
        break;
      default:
        this.location.search(search !, paramValue);
    }
    return this;
  }

  hash(): string;
  hash(hash: string|number|null): this;
  hash(hash?: string|number|null): string|this {
    if (typeof hash === 'undefined') {
      return this.location.hash();
    } else {
      this.location.hash(hash);
      return this;
    }
  }

  replace(): this {
    this.location.replace();
    return this;
  }

  state(): unknown;
  state(state: unknown): this;
  state(state?: unknown): unknown|this {
    if (typeof state === 'undefined' && !arguments.length) {
      return this.location.state();
    } else {
      this.location.state.apply(this.location, arguments);
      return this;
    }
  }
}

export class LocationUpgradeProvider {
  private _hashPrefix: string = '!';
  private _html5Mode: boolean = true;
  constructor(private ngUpgrade: UpgradeModule, private locationUpgrade: LocationUpgradeService) {}

  $get() {
    const $rootScope: any = this.ngUpgrade.$injector.get('$rootScope');
    return new LocationProvider($rootScope, this.locationUpgrade);
  }
  // TODO(jasonaden): How to handle changing these values?
  hashPrefix(prefix?: string) {
    if (typeof prefix === 'string') {
      this._hashPrefix = prefix;
      return this;
    } else {
      return this._hashPrefix;
    }
  }
  html5Mode(enabled?: boolean) {
    if (typeof enabled === 'boolean') {
      this._html5Mode = enabled;
      return this;
    } else {
      return this._html5Mode;
    }
  }
}

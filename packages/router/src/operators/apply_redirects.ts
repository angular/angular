/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EnvironmentInjector} from '@angular/core';
import {MonoTypeOperatorFunction} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {applyRedirects as applyRedirectsFn} from '../apply_redirects';
import {Routes} from '../models';
import {NavigationTransition} from '../navigation_transition';
import {RouterConfigLoader} from '../router_config_loader';
import {UrlSerializer} from '../url_tree';

export function applyRedirects(
    environmentInjector: EnvironmentInjector, configLoader: RouterConfigLoader,
    urlSerializer: UrlSerializer, config: Routes): MonoTypeOperatorFunction<NavigationTransition> {
  return switchMap(
      t =>
          applyRedirectsFn(environmentInjector, configLoader, urlSerializer, t.extractedUrl, config)
              .pipe(map(urlAfterRedirects => ({...t, urlAfterRedirects}))));
}

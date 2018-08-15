/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';
import {MonoTypeOperatorFunction, Observable} from 'rxjs';
import {flatMap, map} from 'rxjs/operators';

import {applyRedirects as applyRedirectsFn} from '../apply_redirects';
import {Routes} from '../config';
import {NavigationTransition} from '../router';
import {RouterConfigLoader} from '../router_config_loader';
import {UrlSerializer} from '../url_tree';

export function applyRedirects(
    moduleInjector: Injector, configLoader: RouterConfigLoader, urlSerializer: UrlSerializer,
    config: Routes): MonoTypeOperatorFunction<NavigationTransition> {
  return function(source: Observable<NavigationTransition>) {
    return source.pipe(flatMap(
        t => applyRedirectsFn(moduleInjector, configLoader, urlSerializer, t.extractedUrl, config)
                 .pipe(map(url => ({...t, urlAfterRedirects: url})))));
  };
}

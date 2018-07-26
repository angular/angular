/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';
import {Observable, OperatorFunction} from 'rxjs';
import {flatMap} from 'rxjs/operators';

import {applyRedirects as applyRedirectsFn} from '../apply_redirects';
import {Routes} from '../config';
import {RouterConfigLoader} from '../router_config_loader';
import {UrlSerializer, UrlTree} from '../url_tree';


/**
 * Returns the `UrlTree` with the redirection applied.
 *
 * Lazy modules are loaded along the way.
 */
export function applyRedirects(
    moduleInjector: Injector, configLoader: RouterConfigLoader, urlSerializer: UrlSerializer,
    config: Routes): OperatorFunction<UrlTree, UrlTree> {
  return function(source: Observable<UrlTree>) {
    return source.pipe(flatMap(
        urlTree => applyRedirectsFn(moduleInjector, configLoader, urlSerializer, urlTree, config)));
  };
}

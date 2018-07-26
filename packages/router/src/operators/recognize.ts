/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';
import {Observable, OperatorFunction} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

import {Route} from '../config';
import {recognize as recognizeFn} from '../recognize';
import {RouterStateSnapshot} from '../router_state';
import {UrlTree} from '../url_tree';

export function recognize(
    rootComponentType: Type<any>| null, config: Route[], serializer: (url: UrlTree) => string,
    paramsInheritanceStrategy: 'emptyOnly' |
        'always'): OperatorFunction<UrlTree, RouterStateSnapshot> {
  return function(source: Observable<UrlTree>) {
    return source.pipe(mergeMap(
        (appliedUrl: UrlTree) => recognizeFn(
            rootComponentType, config, appliedUrl, serializer(appliedUrl),
            paramsInheritanceStrategy)));
  };
}
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, Type} from '@angular/core';
import {Observable, OperatorFunction} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

import {Route} from '../config';
import {PreActivation} from '../pre_activation';
import {recognize as recognizeFn} from '../recognize';
import {ChildrenOutletContexts} from '../router_outlet_context';
import {RouterStateSnapshot} from '../router_state';
import {UrlTree} from '../url_tree';

export function resolveData(
    preActivation: PreActivation,
    paramsInheritanceStrategy: 'emptyOnly' | 'always'): OperatorFunction<UrlTree, boolean> {
  return function(source: Observable<UrlTree>) {
    return source.pipe(mergeMap((appliedUrl): Observable<boolean> => {
      return preActivation.resolveData(paramsInheritanceStrategy);
    }));
  };
}
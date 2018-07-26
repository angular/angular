/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';
import {Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {Event} from '../events';
import {PreActivation} from '../pre_activation';
import {ChildrenOutletContexts} from '../router_outlet_context';
import {RouterStateSnapshot} from '../router_state';

export function setupPreactivation(
    rootContexts: ChildrenOutletContexts, currentSnapshot: RouterStateSnapshot,
    moduleInjector: Injector,
    forwardEvent?: (evt: Event) => void): OperatorFunction<RouterStateSnapshot, PreActivation> {
  return function(source: Observable<RouterStateSnapshot>) {
    return source.pipe(map(snapshot => {
      const preActivation =
          new PreActivation(snapshot, currentSnapshot, moduleInjector, forwardEvent);
      preActivation.initialize(rootContexts);
      return preActivation;
    }));
  };
}

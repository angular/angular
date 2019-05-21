/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual} from '../../util/assert';
import {ComponentDef, DirectiveDef} from '../interfaces/definition';
import {LView, TVIEW, TView} from '../interfaces/view';
import {getCurrentDirectiveDef, getLView} from '../state';
import {NO_CHANGE} from '../tokens';

/**
 * Allocates the necessary amount of slots for host vars.
 *
 * @param count Amount of vars to be allocated
 *
 * @codeGenApi
 */
export function ɵɵallocHostVars(count: number): void {
  const lView = getLView();
  const tView = lView[TVIEW];
  if (!tView.firstTemplatePass) return;
  queueHostBindingForCheck(tView, getCurrentDirectiveDef() !, count);
  prefillHostVars(tView, lView, count);
}

/**
 * Stores host binding fn and number of host vars so it will be queued for binding refresh during
 * CD.
 */
function queueHostBindingForCheck(
    tView: TView, def: DirectiveDef<any>| ComponentDef<any>, hostVars: number): void {
  ngDevMode &&
      assertEqual(tView.firstTemplatePass, true, 'Should only be called in first template pass.');
  const expando = tView.expandoInstructions !;
  const length = expando.length;
  // Check whether a given `hostBindings` function already exists in expandoInstructions,
  // which can happen in case directive definition was extended from base definition (as a part of
  // the `InheritDefinitionFeature` logic). If we found the same `hostBindings` function in the
  // list, we just increase the number of host vars associated with that function, but do not add it
  // into the list again.
  if (length >= 2 && expando[length - 2] === def.hostBindings) {
    expando[length - 1] = (expando[length - 1] as number) + hostVars;
  } else {
    expando.push(def.hostBindings !, hostVars);
  }
}

/**
 * On the first template pass, we need to reserve space for host binding values
 * after directives are matched (so all directives are saved, then bindings).
 * Because we are updating the blueprint, we only need to do this once.
 */
function prefillHostVars(tView: TView, lView: LView, totalHostVars: number): void {
  ngDevMode &&
      assertEqual(tView.firstTemplatePass, true, 'Should only be called in first template pass.');
  for (let i = 0; i < totalHostVars; i++) {
    lView.push(NO_CHANGE);
    tView.blueprint.push(NO_CHANGE);
    tView.data.push(null);
  }
}

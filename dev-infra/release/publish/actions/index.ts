/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReleaseActionConstructor} from '../actions';

import {CutLongTermSupportPatchAction} from './cut-lts-patch';
import {CutNewPatchAction} from './cut-new-patch';
import {CutNextPrereleaseAction} from './cut-next-prerelease';
import {CutReleaseCandidateAction} from './cut-release-candidate';
import {CutStableAction} from './cut-stable';
import {MoveNextIntoFeatureFreezeAction} from './move-next-into-feature-freeze';

/**
 * List of release actions supported by the release staging tool. These are sorted
 * by priority. Actions which are selectable are sorted based on this declaration order.
 */
export const actions: ReleaseActionConstructor[] = [
  CutStableAction,
  CutReleaseCandidateAction,
  CutNewPatchAction,
  CutNextPrereleaseAction,
  MoveNextIntoFeatureFreezeAction,
  CutLongTermSupportPatchAction,
];

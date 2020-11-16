/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ListChoiceOptions, prompt} from 'inquirer';
import * as semver from 'semver';

import {ActiveReleaseTrains} from '../../versioning/active-release-trains';
import {semverInc} from '../../versioning/inc-semver';
import {fetchLongTermSupportBranchesFromNpm} from '../../versioning/long-term-support';
import {ReleaseAction} from '../actions';

/** Interface describing an LTS version branch. */
interface LtsBranch {
  /** Name of the branch. */
  name: string;
  /** Most recent version for the given LTS branch. */
  version: semver.SemVer;
  /** NPM dist tag for the LTS version. */
  npmDistTag: string;
}

/**
 * Release action that cuts a new patch release for an active release-train in the long-term
 * support phase. The patch segment is incremented. The changelog is generated for the new
 * patch version, but also needs to be cherry-picked into the next development branch.
 */
export class CutLongTermSupportPatchAction extends ReleaseAction {
  /** Promise resolving an object describing long-term support branches. */
  ltsBranches = fetchLongTermSupportBranchesFromNpm(this.config);

  async getDescription() {
    const {active} = await this.ltsBranches;
    return `Cut a new release for an active LTS branch (${active.length} active).`;
  }

  async perform() {
    const ltsBranch = await this._promptForTargetLtsBranch();
    const newVersion = semverInc(ltsBranch.version, 'patch');
    const {id} = await this.checkoutBranchAndStageVersion(newVersion, ltsBranch.name);

    await this.waitForPullRequestToBeMerged(id);
    await this.buildAndPublish(newVersion, ltsBranch.name, ltsBranch.npmDistTag);
    await this.cherryPickChangelogIntoNextBranch(newVersion, ltsBranch.name);
  }

  /** Prompts the user to select an LTS branch for which a patch should but cut. */
  private async _promptForTargetLtsBranch(): Promise<LtsBranch> {
    const {active, inactive} = await this.ltsBranches;
    const activeBranchChoices = active.map(branch => this._getChoiceForLtsBranch(branch));

    // If there are inactive LTS branches, we allow them to be selected. In some situations,
    // patch releases are still cut for inactive LTS branches. e.g. when the LTS duration
    // has been increased due to exceptional events ()
    if (inactive.length !== 0) {
      activeBranchChoices.push({name: 'Inactive LTS versions (not recommended)', value: null});
    }

    const {activeLtsBranch, inactiveLtsBranch} =
        await prompt<{activeLtsBranch: LtsBranch | null, inactiveLtsBranch: LtsBranch}>([
          {
            name: 'activeLtsBranch',
            type: 'list',
            message: 'Please select a version for which you want to cut an LTS patch',
            choices: activeBranchChoices,
          },
          {
            name: 'inactiveLtsBranch',
            type: 'list',
            when: o => o.activeLtsBranch === null,
            message: 'Please select an inactive LTS version for which you want to cut an LTS patch',
            choices: inactive.map(branch => this._getChoiceForLtsBranch(branch)),
          }
        ]);
    return activeLtsBranch ?? inactiveLtsBranch;
  }

  /** Gets an inquirer choice for the given LTS branch. */
  private _getChoiceForLtsBranch(branch: LtsBranch): ListChoiceOptions {
    return {name: `v${branch.version.major} (from ${branch.name})`, value: branch};
  }

  static async isActive(active: ActiveReleaseTrains) {
    // LTS patch versions can be only cut if there are release trains in LTS phase.
    // This action is always selectable as we support publishing of old LTS branches,
    // and have prompt for selecting an LTS branch when the action performs.
    return true;
  }
}

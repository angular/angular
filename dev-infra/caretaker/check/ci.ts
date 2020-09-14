/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fetch from 'node-fetch';
import {fetchActiveReleaseTrains, ReleaseTrain} from '../../release/versioning/index';

import {bold, debug, info} from '../../utils/console';
import {BaseModule} from './base';


/** The result of checking a branch on CI. */
type CiBranchStatus = 'success'|'failed'|'not found';

/** A list of results for checking CI branches. */
type CiData = {
  active: boolean,
  name: string,
  label: string,
  status: CiBranchStatus,
}[];

export class CiModule extends BaseModule<CiData> {
  async retrieveData() {
    const gitRepoWithApi = {api: this.git.github, ...this.git.remoteConfig};
    const releaseTrains = await fetchActiveReleaseTrains(gitRepoWithApi);

    const ciResultPromises = Object.entries(releaseTrains).map(async ([trainName, train]: [
                                                                 string, ReleaseTrain|null
                                                               ]) => {
      if (train === null) {
        return {
          active: false,
          name: trainName,
          label: '',
          status: 'not found' as const,
        };
      }

      return {
        active: true,
        name: train.branchName,
        label: `${trainName} (${train.branchName})`,
        status: await this.getBranchStatusFromCi(train.branchName),
      };
    });

    return await Promise.all(ciResultPromises);
  }

  async printToTerminal() {
    const data = await this.data;
    const minLabelLength = Math.max(...data.map(result => result.label.length));
    info.group(bold(`CI`));
    data.forEach(result => {
      if (result.active === false) {
        debug(`No active release train for ${result.name}`);
        return;
      }
      const label = result.label.padEnd(minLabelLength);
      if (result.status === 'not found') {
        info(`${result.name} was not found on CircleCI`);
      } else if (result.status === 'success') {
        info(`${label} ✅`);
      } else {
        info(`${label} ❌`);
      }
    });
    info.groupEnd();
    info();
  }

  /** Get the CI status of a given branch from CircleCI. */
  private async getBranchStatusFromCi(branch: string): Promise<CiBranchStatus> {
    const {owner, name} = this.git.remoteConfig;
    const url = `https://circleci.com/gh/${owner}/${name}/tree/${branch}.svg?style=shield`;
    const result = await fetch(url).then(result => result.text());

    if (result && !result.includes('no builds')) {
      return result.includes('passing') ? 'success' : 'failed';
    }
    return 'not found';
  }
}

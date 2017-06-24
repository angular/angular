// Imports
import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs';
import {HIDDEN_DIR_PREFIX} from '../common/constants';
import {GithubPullRequests} from '../common/github-pull-requests';
import {assertNotMissingOrEmpty} from '../common/utils';

// Classes
export class BuildCleaner {
  // Constructor
  constructor(protected buildsDir: string, protected repoSlug: string, protected githubToken: string) {
    assertNotMissingOrEmpty('buildsDir', buildsDir);
    assertNotMissingOrEmpty('repoSlug', repoSlug);
    assertNotMissingOrEmpty('githubToken', githubToken);
  }

  // Methods - Public
  public cleanUp(): Promise<void> {
    return Promise.all([
      this.getExistingBuildNumbers(),
      this.getOpenPrNumbers(),
    ]).then(([existingBuilds, openPrs]) => this.removeUnnecessaryBuilds(existingBuilds, openPrs));
  }

  // Methods - Protected
  protected getExistingBuildNumbers(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(this.buildsDir, (err, files) => {
        if (err) {
          return reject(err);
        }

        const buildNumbers = files.
          map(name => name.replace(HIDDEN_DIR_PREFIX, '')).   // Remove the "hidden dir" prefix
          map(Number).                                        // Convert string to number
          filter(Boolean);                                    // Ignore NaN (or 0), because they are not builds

        resolve(buildNumbers);
      });
    });
  }

  protected getOpenPrNumbers(): Promise<number[]> {
    const githubPullRequests = new GithubPullRequests(this.githubToken, this.repoSlug);

    return githubPullRequests.
      fetchAll('open').
      then(prs => prs.map(pr => pr.number));
  }

  protected removeDir(dir: string) {
    try {
      if (shell.test('-d', dir)) {
        // Undocumented signature (see https://github.com/shelljs/shelljs/pull/663).
        (shell as any).chmod('-R', 'a+w', dir);
        shell.rm('-rf', dir);
      }
    } catch (err) {
      console.error(`ERROR: Unable to remove '${dir}' due to:`, err);
    }
  }

  protected removeUnnecessaryBuilds(existingBuildNumbers: number[], openPrNumbers: number[]) {
    const toRemove = existingBuildNumbers.filter(num => !openPrNumbers.includes(num));

    console.log(`Existing builds: ${existingBuildNumbers.length}`);
    console.log(`Open pull requests: ${openPrNumbers.length}`);
    console.log(`Removing ${toRemove.length} build(s): ${toRemove.join(', ')}`);

    // Try removing public dirs.
    toRemove.
      map(num => path.join(this.buildsDir, String(num))).
      forEach(dir => this.removeDir(dir));

    // Try removing hidden dirs.
    toRemove.
      map(num => path.join(this.buildsDir, HIDDEN_DIR_PREFIX + String(num))).
      forEach(dir => this.removeDir(dir));
  }
}

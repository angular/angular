import {promises as fs, stat} from 'fs';
import {join} from 'path';
import {Subject} from 'rxjs';
import * as semver from 'semver';
import {params, types as graphqlTypes} from 'typed-graphqlify';

import {green, info} from '../../../utils/console';
import {GitClient} from '../../../utils/git';
import {ReleaseConfig} from '../../config';
import {getCommitMessageForRelease} from '../commit-message';
import {changelogPath, packageJsonPath} from '../constants';
import {getLocalChangelogFilePath, ReleaseNotes} from '../release-notes/release-notes';

import {Task, TaskResult} from './base-task';

interface Artifacts {
  prNumber: number;
}
export class ReleaseVersionAndNotesUpdateTask extends Task<Artifacts, [semver.SemVer, string]> {
  private git = GitClient.getInstance();
  private projectDir = this.git.getBaseDir();

  private pkgJsonPath = join(this.projectDir, packageJsonPath);
  private changelogPath = join(this.projectDir, changelogPath);

  constructor(private config: ReleaseConfig) {
    super();
  }

  /** @internal */
  protected async _stage(newVersion: semver.SemVer, branch: string): Promise<Artifacts> {
    const stagingBranch = `staging_${branch}`;
    this.git.checkout(branch, false);
    await this.updateProjectVersion(newVersion);
    await this.addChangelogEntry(newVersion);
    await this.createReleaseCommit(newVersion, branch);
    await this.pushHeadToRemoteBranch(stagingBranch);
    const {prNumber} = await this.createPr(branch, stagingBranch, newVersion);

    await (await waitForPullRequestApproval({prNumber, ...this.git.remoteParams})).toPromise();

    return {
      prNumber,
    }
  }

  /** @internal */
  protected async _execute({prNumber}: Artifacts) {
    return TaskResult.Failure;
  }


  protected async createPr(branch: string, stagingBranch: string, newVersion: semver.SemVer) {
    let prNumber = 0;
    let url = 0;
    try {
      const {owner, repo} = this.git.remoteParams;
      const repoSlug = `${owner}/${repo}`;
      const {data} = await this.git.github.pulls.create({
        ...this.git.remoteParams,
        head: stagingBranch,
        base: branch,
        title: `Bump version to "v${newVersion}" with changelog.`,
      });

      // Add labels to the newly created PR if provided in the configuration.
      if (this.config.releasePrLabels !== undefined) {
        await this.git.github.issues.addLabels({
          ...this.git.remoteParams,
          issue_number: data.number,
          labels: this.config.releasePrLabels,
        });
      }

      info(green(`  ✓   Created pull request #${data.number} in ${repoSlug}.`));

    } catch (err) {
      console.error(err);
    }
    return {prNumber, url};
  }


  protected async createReleaseCommit(newVersion: semver.SemVer, publishBranch: string) {
    if (this.git.getCurrentBranchOrRevision() !== publishBranch) {
      throw Error();
    }
    // Commit message for the release point.
    const commitMessage = getCommitMessageForRelease(newVersion) + '\n\n[ci skip]';
    // Create a release staging commit including changelog and version bump.
    this.git.run(
        ['commit', '--no-verify', '-m', commitMessage, this.pkgJsonPath, this.changelogPath]);
    info(green(`  ✓   Created release commit for: "${newVersion}".`));

    return this.git.run(['rev-parse', 'HEAD']).stdout;
  }

  /** Pushes the current Git `HEAD` to the given remote branch in the configured project. */
  protected async pushHeadToRemoteBranch(branch: string) {
    // Push the local `HEAD` to the remote branch in the configured project.
    this.git.run(['push', '-f', this.git.getRepoGitUrl(), `HEAD:refs/heads/${branch}`]);
  }


  protected async addChangelogEntry(version: semver.SemVer) {
    const releaseNotes = new ReleaseNotes(version);
    const changelogPath = getLocalChangelogFilePath(this.projectDir);
    const [entry, currentChangelogContents] =
        await Promise.all([releaseNotes.getChangelogEntry(), fs.readFile(changelogPath, 'utf8')]);
    await fs.writeFile(changelogPath, `${entry}\n\n${currentChangelogContents}`);
    info(green(`  ✓   Updated the changelog to capture changes for "${version}".`));
  }


  protected async updateProjectVersion(newVersion: semver.SemVer) {
    const pkgJson = JSON.parse(await fs.readFile(this.pkgJsonPath, 'utf8')) as
        {version: string, [key: string]: any};
    pkgJson.version = newVersion.format();
    // Write the `package.json` file. Note that we add a trailing new line
    // to avoid unnecessary diff. IDEs usually add a trailing new line.
    await fs.writeFile(this.pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`);
    info(green(`  ✓   Updated project version to ${pkgJson.version}`));
  }
}


export async function mergePr(
    {prNumber, owner, name}: {prNumber: number, owner: string, name: string}) {
  const git = GitClient.getInstance();

  console.log('would have merged');
  return;
  await git.github.pulls.merge({
    pull_number: prNumber,
    owner,
    repo: name,
    merge_method: 'squash',
  });
}


export async function waitForPullRequestApproval(
    {prNumber, owner, repo}: {prNumber: number, owner: string, repo: string}) {
  const git = GitClient.getInstance();
  const PR_APPROVAL_SCHEMA = {
    repository: params({name: `"${repo}"`, owner: `"${owner}"`}, {
      pullRequest: params({number: prNumber}, {
        reviewDecision:
            graphqlTypes.oneOf(['CHANGES_REQUESTED', 'APPROVED', 'REVIEW_REQUIRED'] as const),
      }),
    }),
  };

  const checkReviewState = async () => {
    const pullRequest = await git.github.graphql(PR_APPROVAL_SCHEMA);
    const approved = pullRequest.repository.pullRequest.reviewDecision === 'APPROVED';
    const data = 'still in a pending state';
    const status = approved ? 'COMPLETE' as const: 'PENDING' as const;
    return {data, status};
  };

  return withBackOff(checkReviewState);
}



function withBackOff(
    func: () => Promise<{data: string, status: 'COMPLETE' | 'ERROR' | 'PENDING'}>) {
  let backoffTime = 3 * 1000;
  const state$ = new Subject<
      {timeToNextAttempt: number, data: string, status: 'COMPLETE' | 'ERROR' | 'PENDING'}>();

  new Promise(async () => {
    while (!state$.closed) {
      const result = await func();

      const nextMessage = {timeToNextAttempt: backoffTime, ...result};

      switch (result.status) {
        case 'COMPLETE':
          state$.next(nextMessage);
          state$.complete();
          break;
        case 'ERROR':
          process.exit(1);
          break;
        case 'PENDING':
          state$.next(nextMessage);
          await new Promise<void>(resolve => setTimeout(() => resolve(), backoffTime));
          backoffTime = Math.min(backoffTime * 2, 20 * 1000);
          break;
        default:
          throw Error();
      }
    }
  })
  return state$.asObservable();
}

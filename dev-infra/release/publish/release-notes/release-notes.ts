/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {renderFile} from 'ejs';
import {join} from 'path';
import * as semver from 'semver';
import {CommitFromGitLog} from '../../../commit-message/parse';

import {getCommitsInRange} from '../../../commit-message/utils';
import {promptInput} from '../../../utils/console';
import {GitClient} from '../../../utils/git/index';
import {ReleaseConfig} from '../../config/index';
import {changelogPath} from '../constants';
import {RenderContext} from './context';

/** Gets the path for the changelog file in a given project. */
export function getLocalChangelogFilePath(projectDir: string): string {
  return join(projectDir, changelogPath);
}


/** Release note generation. */
export class ReleaseNotes {
  /** Construct a release note generation instance. */
  static async fromLatestTagToHead(version: semver.SemVer, config: ReleaseConfig):
      Promise<ReleaseNotes> {
    const instance = new ReleaseNotes(version, config);
    instance.commits = await getCommitsInRange(instance.git.getLatestSemverTag().format(), 'HEAD');
    return instance;
  }

  /** An instance of GitClient. */
  protected git = GitClient.getInstance();
  /** The RenderContext to be used during rendering. */
  protected renderContext: RenderContext|undefined;
  /** The title to use for the release. */
  protected title: string|false|undefined;
  /** A promise resolving to a list of Commits since the latest semver tag on the branch. */
  protected commits: CommitFromGitLog[] = [];

  protected constructor(public readonly version: semver.SemVer, protected config: ReleaseConfig) {}

  /** Retrieve the release note generated for a Github Release. */
  async getGithubReleaseEntry(): Promise<string> {
    return renderFile(
        join(__dirname, 'templates/github-release.ejs'), await this.generateRenderContext(),
        {rmWhitespace: true});
  }

  /** Retrieve the release note generated for a CHANGELOG entry. */
  async getChangelogEntry() {
    return renderFile(
        join(__dirname, 'templates/changelog.ejs'), await this.generateRenderContext(),
        {rmWhitespace: true});
  }

  /**
   * Prompt the user for a title for the release, if the project's configuration is defined to use a
   * title.
   */
  async promptForReleaseTitle() {
    if (this.title === undefined) {
      if (this.config.releaseNotes.useReleaseTitle) {
        this.title = await promptInput('Please provide a title for the release:');
      } else {
        this.title = false;
      }
    }
    return this.title;
  }

  /** Build the render context data object for constructing the RenderContext instance. */
  protected async generateRenderContext(): Promise<RenderContext> {
    if (!this.renderContext) {
      this.renderContext = new RenderContext({
        commits: this.commits,
        github: this.git.remoteConfig,
        version: this.version.format(),
        groupOrder: this.config.releaseNotes.groupOrder,
        hiddenScopes: this.config.releaseNotes.hiddenScopes,
        title: await this.promptForReleaseTitle(),
      });
    }
    return this.renderContext;
  }
}

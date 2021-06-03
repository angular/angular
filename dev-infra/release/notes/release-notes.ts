/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {render} from 'ejs';
import * as semver from 'semver';
import {CommitFromGitLog} from '../../commit-message/parse';

import {getCommitsInRange} from '../../commit-message/utils';
import {promptInput} from '../../utils/console';
import {GitClient} from '../../utils/git/git-client';
import {DevInfraReleaseConfig, getReleaseConfig, ReleaseNotesConfig} from '../config/index';
import {RenderContext} from './context';

import changelogTemplate from './templates/changelog';
import githubReleaseTemplate from './templates/github-release';

/** Release note generation. */
export class ReleaseNotes {
  static async fromRange(version: semver.SemVer, startingRef: string, endingRef: string) {
    return new ReleaseNotes(version, startingRef, endingRef);
  }

  /** An instance of GitClient. */
  private git = GitClient.get();
  /** The RenderContext to be used during rendering. */
  private renderContext: RenderContext|undefined;
  /** The title to use for the release. */
  private title: string|false|undefined;
  /** A promise resolving to a list of Commits since the latest semver tag on the branch. */
  private commits: Promise<CommitFromGitLog[]> =
      this.getCommitsInRange(this.startingRef, this.endingRef);
  /** The configuration for release notes. */
  private config: ReleaseNotesConfig = this.getReleaseConfig().releaseNotes;

  protected constructor(
      public version: semver.SemVer, private startingRef: string, private endingRef: string) {}

  /** Retrieve the release note generated for a Github Release. */
  async getGithubReleaseEntry(): Promise<string> {
    return render(githubReleaseTemplate, await this.generateRenderContext(), {rmWhitespace: true});
  }

  /** Retrieve the release note generated for a CHANGELOG entry. */
  async getChangelogEntry() {
    return render(changelogTemplate, await this.generateRenderContext(), {rmWhitespace: true});
  }

  /**
   * Prompt the user for a title for the release, if the project's configuration is defined to use a
   * title.
   */
  async promptForReleaseTitle() {
    if (this.title === undefined) {
      if (this.config.useReleaseTitle) {
        this.title = await promptInput('Please provide a title for the release:');
      } else {
        this.title = false;
      }
    }
    return this.title;
  }

  /** Build the render context data object for constructing the RenderContext instance. */
  private async generateRenderContext(): Promise<RenderContext> {
    if (!this.renderContext) {
      this.renderContext = new RenderContext({
        commits: await this.commits,
        github: this.git.remoteConfig,
        version: this.version.format(),
        groupOrder: this.config.groupOrder,
        hiddenScopes: this.config.hiddenScopes,
        title: await this.promptForReleaseTitle(),
      });
    }
    return this.renderContext;
  }


  // These methods are used for access to the utility functions while allowing them to be
  // overwritten in subclasses during testing.
  protected async getCommitsInRange(from: string, to?: string) {
    return getCommitsInRange(from, to);
  }

  protected getReleaseConfig(config?: Partial<DevInfraReleaseConfig>) {
    return getReleaseConfig(config);
  }
}

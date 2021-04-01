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

import {getCommitsInRange} from '../../../commit-message/utils';
import {getConfig} from '../../../utils/config';
import {promptInput} from '../../../utils/console';
import {GitClient} from '../../../utils/git/index';
import {getReleaseConfig} from '../../config/index';
import {changelogPath} from '../constants';
import {RenderContext} from './context';


/**
 * Gets the default pattern for extracting release notes for the given version.
 * This pattern matches for the conventional-changelog Angular preset.
 */
export function getDefaultExtractReleaseNotesPattern(version: semver.SemVer): RegExp {
  const escapedVersion = version.format().replace('.', '\\.');
  // TODO: Change this once we have a canonical changelog generation tool. Also update this
  // based on the conventional-changelog version. They removed anchors in more recent versions.
  return new RegExp(`(<a name="${escapedVersion}"></a>.*?)(?:<a name="|$)`, 's');
}

/** Gets the path for the changelog file in a given project. */
export function getLocalChangelogFilePath(projectDir: string): string {
  return join(projectDir, changelogPath);
}


/** Release note generation. */
export class ReleaseNotes {
  /** An instance of GitClient. */
  private git = new GitClient();
  /** The github configuration. */
  private readonly github = getConfig().github;
  /** The configuration for the release notes generation. */
  // TODO(josephperrott): Remove non-null assertion after usage of ReleaseNotes is integrated into
  // release publish tooling.
  private readonly config = getReleaseConfig().releaseNotes! || {};
  /** A promise resolving to a list of Commits since the latest semver tag on the branch. */
  private commits = getCommitsInRange(this.git.getLatestSemverTag().format(), 'HEAD');
  /** The RenderContext to be used during rendering. */
  private renderContext: RenderContext|undefined;
  /** The title to use for the release. */
  private title: string|false|undefined;

  constructor(private version: semver.SemVer) {}

  /** Retrieve the release note generated for a Github Release. */
  async getGithubReleaseEntry(): Promise<string> {
    return await renderFile(
        join(__dirname, 'templates/github-release.ejs'), await this.generateRenderContext());
  }

  /** Retrieve the release note generated for a CHANGELOG entry. */
  async getChangelogEntry() {
    return await renderFile(
        join(__dirname, 'templates/changelog.ejs'), await this.generateRenderContext());
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
        github: getConfig().github,
        version: this.version.format(),
        groupOrder: this.config.groupOrder,
        hiddenScopes: this.config.hiddenScopes,
        title: await this.promptForReleaseTitle(),
      });
    }
    return this.renderContext;
  }
}

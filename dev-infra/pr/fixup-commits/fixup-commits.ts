/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {edit} from 'external-editor';
import {moveCursor} from 'readline';

import {parseCommitMessage, ParsedCommitMessage} from '../../commit-message/parse';
import {green, info, promptConfirm, yellow} from '../../utils/console';
import {GitClient} from '../../utils/git';
import {checkOutPullRequestLocally} from '../common/checkout-pr';

/** Fixup the commits  */
export async function fixupCommits(pr: number, githubToken: string) {
  /** Client for interacting with Git and Github */
  const git = new GitClient(githubToken);
  git.printGitCommands = false;
  /** The commits contained in the PR. */
  const commits = await getCommitsForPr(git, pr);
  /** Total number of commits which have been ammended. */
  let ammendedCommitCount = 0;
  const {
    /** Push the local changes back to the PR upstream. */
    pushToUpstream,
    /** Reset the local repository back to the state before the command was run. */
    resetGitState
  } = await checkOutPullRequestLocally(pr, githubToken);
  /** The SHA of the commit/ref immediately before the PR. */
  const shaBeforePr = git.run(['rev-parse', `${commits[0].sha}~1`]).stdout.trim();

  info(`PR #${pr} contains ${commits.length} commit message(s)`);

  // Reset the git environment to the sha before the PR
  git.run(['reset', '--hard', shaBeforePr]);

  for (const commit of commits) {
    /** The parsed commit information from the commit message. */
    const parsedCommit = parseCommitMessage(commit.commit.message);
    /** The commit message diff as a patch string. */
    const commitAsPatch = git.run(['format-patch', '-1', commit.sha, '--stdout']).stdout;
    // Apply the commit patch
    git.run(['am'], {input: commitAsPatch});

    // All commits which are fixups should be skipped as they will be squashed anyway.
    if (parsedCommit.isFixup) {
      continue;
    }

    // Ask the user via command prompt if the commit should be ammended.
    if (await presentCommitForAmendment(parsedCommit)) {
      /** The text of the new commit message. */
      const commitMessage = await ammendCommit(parsedCommit);
      if (commitMessage.raw !== parsedCommit.raw) {
        // Ammend the commit message with the new commit message text, using --no-verify to skip
        // commit message validation checks.
        git.run(['commit', '--amend', '--no-verify', '-m', commitMessage.raw]);
        ammendedCommitCount++;
      }
    }
  }

  // Rebase the PR to resolve all fixup commits.
  git.run(['rebase', '-i', shaBeforePr], {env: {GIT_SEQUENCE_EDITOR: ':'}});

  // Only push changes to upstream if a commit has actually been ammended
  if (ammendedCommitCount > 0) {
    info(`${ammendedCommitCount} commit message(s) ammended, pushing to upstream.`);
    pushToUpstream();
  } else {
    info('No commit messages were ammended, skipping push to upstream.');
  }

  // Reset the git repository back the state before the command was run.
  resetGitState();
}

/** Retrieves all commits for a specified PR. */
async function getCommitsForPr(git: GitClient, pr: number) {
  const {owner, name: repo} = git.remoteConfig;
  return (await git.github.pulls.listCommits({pull_number: pr, owner, repo})).data;
}

/** Ask the user via command prompt if the provided commit should be ammended. */
async function presentCommitForAmendment(commit: ParsedCommitMessage) {
  /**
   * Print a message in the console, returning a function to clear the printed message from
   * the console, replacing it with a new message if provided.
   */
  function writeCommitMsg(message: string): (message?: string) => void {
    /** The number of lines the message uses. */
    const lineCount = message.split('\n').length + 1;
    info(message);

    return (newMessage?: string) => {
      // Move the cursor back to the position before the original message was written.
      moveCursor(process.stdout, -1000, -lineCount);
      process.stdout.clearScreenDown();
      if (newMessage) {
        info(newMessage);
      }
    };
  }

  /**
   * Function to rewrite the contents of stdout, after it has printed the commit message provided.
   */
  const writeResultInStdOut = writeCommitMsg(`\n${commit.message}\n`);
  /** Whether the user would like to modify this commit message.  */
  const promptResult = await promptConfirm(`Would you like to modify the commit message?`, true);
  /**
   * The string to prepend to the commit message header line, based on whether the commit is
   * being ammended.
   */
  const resultPrepend = promptResult ? green('Updated:') : yellow('Skipped:');

  writeResultInStdOut(`${resultPrepend} ${commit.header}`);
  return promptResult;
}

/** Amend the procided commit message */
async function ammendCommit(commit: ParsedCommitMessage): Promise<ParsedCommitMessage> {
  // TODO(josephperrott): run commit message validation on new commit message text.
  const newCommitMessage = edit(commit.raw);
  return parseCommitMessage(newCommitMessage);
}

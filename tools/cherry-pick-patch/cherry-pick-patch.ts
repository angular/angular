import {GitHub} from './github';
import {outputResults} from './output-results';
import {
  requestLatestCherryPickedCommitSha,
  requestPatchBranch,
  verifyLatestCherryPickedCommit
} from './prompt';


/**
 * Task to run the script that attempts to produce cherry-pick commands for the patch branch.
 */
class CherryPickPatchTask {
  github = new GitHub();

  async run() {
    const patchBranchSuggestion = await this.github.getPatchBranchSuggestion();
    const branch = await requestPatchBranch(patchBranchSuggestion);
    const sha = await this.getLatestCherryPickedCommitSha(branch);

    const commit = await this.github.getCommit(sha);
    const pullRequests = await this.github.getPatchPullRequestsSince(commit.commit.author.date);

    outputResults(pullRequests);
  }

  /** Returns the commit SHA of the last cherry-picked commit on master. */
  async getLatestCherryPickedCommitSha(branch: any): Promise<string> {
    const commits = await this.github.listCommits(branch);

    /** Gets the SHA from the string: "(cherry picked from commit 4c6eeb9aba73d3)" */
    const regexp = new RegExp('cherry picked from commit (.*[^)])');
    const latestShas = commits
                           .map(d => {
                             const result = d.commit.message.match(regexp);
                             return result ? result[1] : null;
                           })
                           .filter(d => !!d);

    const latestSha = latestShas[0];
    if (!latestSha) {
      return await requestLatestCherryPickedCommitSha();
    } else {
      const commit = await this.github.getCommit(latestSha);
      return await verifyLatestCherryPickedCommit(commit);
    }
  }
}

/** Entry-point for the script. */
if (require.main === module) {
  new CherryPickPatchTask().run();
}

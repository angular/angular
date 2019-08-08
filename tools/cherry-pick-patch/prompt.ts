import {prompt} from 'inquirer';
import * as OctokitApi from '@octokit/rest';

/** Requests the user to provide the name of the patch branch. */
export async function requestPatchBranch(suggestion: string): Promise<string> {
  const result = await prompt<{branch: string}>([{
    type: 'input',
    name: 'branch',
    message: `What is the name of the current patch branch?`,
    default: suggestion || null,
  }]);

  return result.branch;
}

/** Confirms the latest cherry-picked commit on master; requests one if not confirmed. */
export async function verifyLatestCherryPickedCommit(commit: OctokitApi.ReposGetCommitResponse) {
  console.log(`\nThe last cherry-picked commit on master is "${commit.commit.message}"`);

  const result = await prompt<{confirm: boolean}>([{
    type: 'confirm',
    name: 'confirm',
    message: `Is this correct?`,
    default: true,
  }]);

  if (!result.confirm) {
    return await requestLatestCherryPickedCommitSha();
  } else {
    return commit.sha;
  }
}

/** Requests the SHA of the latest cherry picked commit on master. */
export async function requestLatestCherryPickedCommitSha(): Promise<string> {
  const result = await prompt<{sha: string}>([{
    type: 'input',
    name: 'sha',
    message: `What is the SHA of the latest cherry-picked commit on master?`,
  }]);

  return result.sha;
}

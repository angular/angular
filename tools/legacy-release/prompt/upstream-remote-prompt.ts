import {prompt} from 'inquirer';

/**
 * Prompts the current user-input interface for a Git remote that refers to the upstream
 * of the current Git project.
 */
export async function promptForUpstreamRemote(availableRemotes: string[]): Promise<string> {
  const {distTag} = await prompt<{ distTag: string }>({
    type: 'list',
    name: 'distTag',
    message: 'What is the Git remote for pushing changes upstream?',
    choices: availableRemotes.map(remoteName => ({value: remoteName, name: remoteName})),
  });

  return distTag;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {prompt} from 'inquirer';

import {debug, green, info, red, yellow} from '../../utils/console';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client';
import {getCaretakerConfig} from '../config';

/** Update the Github caretaker group, using a prompt to obtain the new caretaker group members.  */
export async function updateCaretakerTeamViaPrompt() {
  /** Caretaker specific configuration. */
  const caretakerConfig = getCaretakerConfig().caretaker;

  if (caretakerConfig.caretakerGroup === undefined) {
    throw Error('`caretakerGroup` is not defined in the `caretaker` config');
  }

  /** The list of current members in the group. */
  const current = await getGroupMembers(caretakerConfig.caretakerGroup);
  /** The list of members able to be added to the group as defined by a separate roster group. */
  const roster = await getGroupMembers(`${caretakerConfig.caretakerGroup}-roster`);
  const {
    /** The list of users selected to be members of the caretaker group. */
    selected,
    /** Whether the user positively confirmed the selected made. */
    confirm
  } =
      await prompt([
        {
          type: 'checkbox',
          choices: roster,
          message: 'Select 2 caretakers for the upcoming rotation:',
          default: current,
          name: 'selected',
          prefix: '',
          validate: (selected: string[]) => {
            if (selected.length !== 2) {
              return 'Please select exactly 2 caretakers for the upcoming rotation.';
            }
            return true;
          },
        },
        {
          type: 'confirm',
          default: true,
          prefix: '',
          message: 'Are you sure?',
          name: 'confirm',
        }
      ]);

  if (confirm === false) {
    info(yellow('  ⚠  Skipping caretaker group update.'));
    return;
  }

  if (JSON.stringify(selected) === JSON.stringify(current)) {
    info(green('  √  Caretaker group already up to date.'));
    return;
  }

  try {
    await setCaretakerGroup(caretakerConfig.caretakerGroup, selected);
  } catch {
    info(red('  ✘  Failed to update caretaker group.'));
    return;
  }
  info(green('  √  Successfully updated caretaker group'));
}


/** Retrieve the current list of members for the provided group. */
async function getGroupMembers(group: string) {
  /** The authenticated GitClient instance. */
  const git = AuthenticatedGitClient.get();

  return (await git.github.teams.listMembersInOrg({
           org: git.remoteConfig.owner,
           team_slug: group,
         }))
      .data.filter(_ => !!_)
      .map(member => member!.login);
}

async function setCaretakerGroup(group: string, members: string[]) {
  /** The authenticated GitClient instance. */
  const git = AuthenticatedGitClient.get();
  /** The full name of the group <org>/<group name>. */
  const fullSlug = `${git.remoteConfig.owner}/${group}`;
  /** The list of current members of the group. */
  const current = await getGroupMembers(group);
  /** The list of users to be removed from the group. */
  const removed = current.filter(login => !members.includes(login));
  /** Add a user to the group. */
  const add = async (username: string) => {
    debug(`Adding ${username} to ${fullSlug}.`);
    await git.github.teams.addOrUpdateMembershipForUserInOrg({
      org: git.remoteConfig.owner,
      team_slug: group,
      username,
      role: 'maintainer',
    });
  };
  /** Remove a user from the group. */
  const remove = async (username: string) => {
    debug(`Removing ${username} from ${fullSlug}.`);
    await git.github.teams.removeMembershipForUserInOrg({
      org: git.remoteConfig.owner,
      team_slug: group,
      username,
    });
  };

  debug.group(`Caretaker Group: ${fullSlug}`);
  debug(`Current Membership: ${current.join(', ')}`);
  debug(`New Membership:     ${members.join(', ')}`);
  debug(`Removed:            ${removed.join(', ')}`);
  debug.groupEnd();

  // Add members before removing to prevent the account performing the action from removing their
  // permissions to change the group membership early.
  await Promise.all(members.map(add));
  await Promise.all(removed.map(remove));

  debug(`Successfuly updated ${fullSlug}`);
}

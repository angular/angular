/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ListChoiceOptions} from 'inquirer';

import {info, promptAutocomplete, promptInput} from '../utils/console';

import {COMMIT_TYPES, CommitType, getCommitMessageConfig, ScopeRequirement} from './config';

/** Validate commit message at the provided file path. */
export async function buildCommitMessage() {
  // TODO(josephperrott): Add support for skipping wizard with local untracked config file
  // TODO(josephperrott): Add default commit message information/commenting into generated messages
  info('Just a few questions to start building the commit message!');

  /** The commit message type. */
  const type = await promptForCommitMessageType();
  /** The commit message scope. */
  const scope = await promptForCommitMessageScopeForType(type);
  /** The commit message summary. */
  const summary = await promptForCommitMessageSummary();

  return `${type.name}${scope ? '(' + scope + ')' : ''}: ${summary}\n\n`;
}

/** Prompts in the terminal for the commit message's type. */
async function promptForCommitMessageType(): Promise<CommitType> {
  info('The type of change in the commit. Allows a reader to know the effect of the change,');
  info('whether it brings a new feature, adds additional testing, documents the `project, etc.');

  /** List of commit type options for the autocomplete prompt. */
  const typeOptions: ListChoiceOptions[] =
      Object.values(COMMIT_TYPES).map(({description, name}) => {
        return {
          name: `${name} - ${description}`,
          value: name,
          short: name,
        };
      });
  /** The key of a commit message type, selected by the user via prompt. */
  const typeName = await promptAutocomplete('Select a type for the commit:', typeOptions);

  return COMMIT_TYPES[typeName];
}

/** Prompts in the terminal for the commit message's scope. */
async function promptForCommitMessageScopeForType(type: CommitType): Promise<string|false> {
  // If the commit type's scope requirement is forbidden, return early.
  if (type.scope === ScopeRequirement.Forbidden) {
    info(`Skipping scope selection as the '${type.name}' type does not allow scopes`);
    return false;
  }
  /** Commit message configuration */
  const config = getCommitMessageConfig();

  info('The area of the repository the changes in this commit most affects.');
  return await promptAutocomplete(
      'Select a scope for the commit:', config.commitMessage.scopes,
      type.scope === ScopeRequirement.Optional ? '<no scope>' : '');
}

/** Prompts in the terminal for the commit message's summary. */
async function promptForCommitMessageSummary(): Promise<string> {
  info('Provide a short summary of what the changes in the commit do');
  return await promptInput('Provide a short summary of the commit');
}

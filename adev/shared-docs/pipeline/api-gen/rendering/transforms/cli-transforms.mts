/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {marked} from 'marked';

import {CliCommand, CliOption} from '../cli-entities.mjs';
import {
  CliCardRenderable,
  CliCommandRenderable,
  CliOptionRenderable,
} from '../entities/renderables.mjs';

/** Given an unprocessed CLI entry, get the fully renderable CLI entry. */
export function getCliRenderable(command: CliCommand): CliCommandRenderable {
  return {
    ...command,
    subcommands: command.subcommands?.map((sub) => getCliRenderable(sub)),
    htmlDescription: marked.parse(command.longDescription ?? command.shortDescription) as string,
    cards: getCliCardsRenderable(command),
    argumentsLabel: getArgumentsLabel(command),
    hasOptions: getOptions(command).length > 0,
  };
}

export function getCliCardsRenderable(command: CliCommand): CliCardRenderable[] {
  const cards: CliCardRenderable[] = [];
  const args = getArgs(command);
  const options = getOptions(command);

  if (args.length > 0) {
    cards.push({
      type: 'Arguments',
      items: getRenderableOptions(args),
    });
  }

  if (options.length > 0) {
    cards.push({
      type: 'Options',
      items: getRenderableOptions(options),
    });
  }

  return cards;
}

function getRenderableOptions(items: CliOption[]): CliOptionRenderable[] {
  return items.map((option) => ({
    ...option,
    deprecated: option.deprecated ? {version: undefined, htmlMessage: undefined} : undefined,
    description: marked.parse(option.description) as string,
  }));
}

function getArgumentsLabel(command: CliCommand): string {
  const args = getArgs(command);
  if (args.length === 0) {
    return '';
  }
  return command.command.replace(`${command.name} `, '');
}

function getArgs(command: CliCommand): CliOption[] {
  return command.options.filter((options) => options.positional !== undefined);
}

function getOptions(command: CliCommand): CliOption[] {
  return command.options.filter((option) => option.positional === undefined);
}

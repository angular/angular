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
import {parseMarkdown} from '../../../shared/marked/parse.mjs';
import {getHighlighterInstance} from '../shiki/shiki.mjs';

/** Given an unprocessed CLI entry, get the fully renderable CLI entry. */
export function getCliRenderable(command: CliCommand): CliCommandRenderable {
  return {
    ...command,
    builders: command.builders?.filter((builder) => builder.options.length > 0),
    subcommands: command.subcommands?.map((sub) => getCliRenderable(sub)),
    htmlDescription: parseMarkdown(command.longDescription ?? command.shortDescription, {
      highlighter: getHighlighterInstance(),
    }),
    cards: getCliCardsRenderable(command),
    argumentsLabel: getArgumentsLabel(command),
    optionsLabel: getOptionsLabel(command),
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

  for (const builder of command.builders ?? []) {
    if (builder.options.length > 0) {
      cards.push({
        type: `${builder.name} builder options`,
        items: getRenderableOptions(builder.options),
      });
    }
  }

  return cards;
}

// Rewrite absolute angular.dev hrefs to root-relative so links stay in-site.
const angularDevHrefRegex = /(href=["'])https?:\/\/angular\.dev\//g;

function getRenderableOptions(items: CliOption[]): CliOptionRenderable[] {
  return items.map((option) => ({
    ...option,
    deprecated: option.deprecated ? {version: undefined} : undefined,
    deprecationMessage:
      typeof option.deprecated === 'string'
        ? (marked.parse(option.deprecated) as string).replace(angularDevHrefRegex, '$1/')
        : null,
    description: (marked.parse(option.description) as string).replace(angularDevHrefRegex, '$1/'),
  }));
}

function getArgumentsLabel(command: CliCommand): string {
  const args = getArgs(command);
  if (args.length === 0) {
    return '';
  }
  const label = command.command.replace(/^ng\s+/, '').replace(`${command.name} `, '');
  return ` ${label}`;
}

function getOptionsLabel(command: CliCommand): string {
  const hasOptions =
    getOptions(command).length > 0 ||
    (command.builders?.some((b) => b.options.length > 0) ?? false);
  return hasOptions ? ' [options]' : '';
}

function getArgs(command: CliCommand): CliOption[] {
  return command.options.filter((options) => options.positional !== undefined);
}

function getOptions(command: CliCommand): CliOption[] {
  return command.options.filter((option) => option.positional === undefined);
}

/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {marked} from 'marked';
import {parseMarkdown} from '../../../shared/marked/parse.mjs';
import {getHighlighterInstance} from '../shiki/shiki.mjs';
/** Given an unprocessed CLI entry, get the fully renderable CLI entry. */
export function getCliRenderable(command) {
  return {
    ...command,
    subcommands: command.subcommands?.map((sub) => getCliRenderable(sub)),
    htmlDescription: parseMarkdown(command.longDescription ?? command.shortDescription, {
      highlighter: getHighlighterInstance(),
    }),
    cards: getCliCardsRenderable(command),
    argumentsLabel: getArgumentsLabel(command),
    hasOptions: getOptions(command).length > 0,
  };
}
export function getCliCardsRenderable(command) {
  const cards = [];
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
function getRenderableOptions(items) {
  return items.map((option) => ({
    ...option,
    deprecated: option.deprecated ? {version: undefined} : undefined,
    description: marked.parse(option.description),
  }));
}
function getArgumentsLabel(command) {
  const args = getArgs(command);
  if (args.length === 0) {
    return '';
  }
  return command.command.replace(`${command.name} `, '');
}
function getArgs(command) {
  return command.options.filter((options) => options.positional !== undefined);
}
function getOptions(command) {
  return command.options.filter((option) => option.positional === undefined);
}
//# sourceMappingURL=cli-transforms.mjs.map

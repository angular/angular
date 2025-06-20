/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {CliCommandRenderable} from '../entities/renderables.mjs';
import {REFERENCE_MEMBERS} from '../styling/css-classes.mjs';
import {CliCard} from './cli-card';
import {HeaderCli} from './header-cli';
import {RawHtml} from './raw-html';
import {SectionHeading} from './section-heading';

/** Component to render a CLI command reference document. */
export function CliCommandReference(entry: CliCommandRenderable) {
  return (
    <div className="docs-cli">
      <div className="docs-reference-cli-content">
        <HeaderCli command={entry} />
        {[entry.name, ...entry.aliases].map((command) => (
          <div class="docs-code docs-reference-cli-toc">
            <code>
              <div className={'shiki line cli'}>
                ng {commandName(entry, command)}
                {entry.argumentsLabel ? (
                  <button member-id={'Arguments'} className="shiki-ln-line-argument">
                    {entry.argumentsLabel}
                  </button>
                ) : (
                  <></>
                )}
                {entry.hasOptions ? (
                  <button member-id={'Options'} className="shiki-ln-line-option">
                    [options]
                  </button>
                ) : (
                  <></>
                )}
              </div>
            </code>
          </div>
        ))}
        <RawHtml value={entry.htmlDescription} />
        {entry.subcommands && entry.subcommands?.length > 0 ? (
          <>
            <h3>Sub-commands</h3>
            <p>This command has the following sub-commands</p>
            <ul>
              {entry.subcommands.map((subcommand) => (
                <li>
                  <a href={`cli/${entry.name}/${subcommand.name}`}>{subcommand.name}</a>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <></>
        )}
      </div>
      <div className={REFERENCE_MEMBERS}>
        {entry.cards.map((card) => (
          <>
            <SectionHeading name={card.type} />
            <CliCard card={card} />
          </>
        ))}
      </div>
    </div>
  );
}

function commandName(entry: CliCommandRenderable, command: string) {
  if (entry.parentCommand?.name) {
    return `${entry.parentCommand?.name} ${command}`;
  } else {
    return command;
  }
}

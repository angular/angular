/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {CliCardRenderable} from '../entities/renderables';
import {DeprecatedLabel} from './deprecated-label';

export function CliCard(props: {card: CliCardRenderable}) {
  return (
    <div id={props.card.type} class="docs-reference-member-card" tabIndex={-1}>
      <header>
        <div class="docs-card-ref-header">
          <h3>{props.card.type}</h3>
        </div>
      </header>
      <div class="docs-reference-card-body">
        {props.card.items.map((item) => (
          <div class="docs-ref-content">
            {item.deprecated ? <DeprecatedLabel entry={item} /> : <></>}
            <div class="docs-ref-option-and-description">
              <div class="docs-reference-option">
                <code>{item.name}</code>
                {item.aliases?.map((alias) => (
                  <div class="docs-reference-option-aliases">
                    <span>Alias</span>
                    <code>{alias} </code>
                  </div>
                ))}
              </div>
              <div dangerouslySetInnerHTML={{__html: item.description}}></div>
            </div>
            <div class="docs-reference-type-and-default">
              <span>Value Type</span>
              <code>{item.type}</code>
              {/* Default Value */}
              {item.default !== undefined ? <span>Default</span> : <></>}
              {props.card.type === 'Options' && item.default !== undefined ? (
                <code>{item.default.toString()}</code>
              ) : (
                <></>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

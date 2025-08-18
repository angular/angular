/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {CliCardRenderable} from '../entities/renderables.mjs';
import {DeprecatedLabel} from './deprecated-label';
import {REFERENCE_MEMBER_CARD, REFERENCE_MEMBER_CARD_BODY} from '../styling/css-classes.mjs';

export function CliCard(props: {card: CliCardRenderable}) {
  return (
    <div class={REFERENCE_MEMBER_CARD}>
      <div className={REFERENCE_MEMBER_CARD_BODY}>
        {props.card.items.map((item) => (
          <div class="docs-ref-content">
            {item.deprecated ? <DeprecatedLabel entry={item} /> : <></>}
            <div class="docs-ref-option-and-description">
              <div class="docs-reference-option">
                <code>{item.name}</code>
                {item.aliases?.map((alias) => (
                  <div class="docs-reference-option-aliases">
                    <span>Alias</span>
                    <code>{alias}</code>
                  </div>
                ))}
              </div>
              <div dangerouslySetInnerHTML={{__html: item.description}}></div>
            </div>
            <div class="docs-reference-type-and-default">
              {/* Display the type expected for the option and the enum values if there are some. */}
              <span>Value Type</span>
              <code>{item.type}</code>
              {item.enum ? (
                <>
                  <span>Allowed Values</span>
                  {item.enum.map((val, i, items) => (
                    <>
                      <code>{val}</code>
                      {i < items.length - 1 && ', '}
                    </>
                  ))}
                </>
              ) : (
                <></>
              )}
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

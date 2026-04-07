/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {DecoratorEntryRenderable, PropertyEntryRenderable} from '../entities/renderables.mjs';
import {
  API_REFERENCE_CONTAINER,
  REFERENCE_MEMBER_CARD,
  REFERENCE_MEMBER_CARD_BODY,
  REFERENCE_MEMBER_CARD_HEADER,
  REFERENCE_MEMBER_CARD_ITEM,
  REFERENCE_MEMBERS,
} from '../styling/css-classes.mjs';
import {CodeSymbol} from './code-symbols';
import {HeaderApi} from './header-api';
import {RawHtml} from './raw-html';
import {SectionApi} from './section-api';
import {SectionDescription} from './section-description';
import {SectionUsageNotes} from './section-usage-notes';

export const signatureCard = (
  name: string,
  member: PropertyEntryRenderable,
  opts: {id: string},
) => {
  return (
    <div id={opts.id} class={REFERENCE_MEMBER_CARD}>
      <header class={REFERENCE_MEMBER_CARD_HEADER}>
        <h3>{name}</h3>
        <div>
          <CodeSymbol code={member.type} />
        </div>
      </header>
      <div class={REFERENCE_MEMBER_CARD_BODY}>
        <div className={`${REFERENCE_MEMBER_CARD_ITEM}`}>
          <p>
            <RawHtml value={member.htmlDescription} />
          </p>
        </div>
      </div>
    </div>
  );
};

/** Component to render a decorator API reference document. */
export function DecoratorReference(entry: DecoratorEntryRenderable) {
  return (
    <div className={API_REFERENCE_CONTAINER}>
      <HeaderApi entry={entry} />
      <SectionApi entry={entry} />
      <div className={REFERENCE_MEMBERS}>
        {entry.members.map((member, index) =>
          signatureCard(member.name, member, {
            id: `${member.name}_${index}`,
          }),
        )}
      </div>
      <SectionDescription entry={entry} />
      <SectionUsageNotes entry={entry} />
    </div>
  );
}

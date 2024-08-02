/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {FunctionEntryRenderable} from '../entities/renderables';
import {
  PARAM_KEYWORD_CLASS_NAME,
  REFERENCE_HEADER,
  REFERENCE_MEMBERS,
  REFERENCE_MEMBERS_CONTAINER,
  REFERENCE_MEMBER_CARD,
  REFERENCE_MEMBER_CARD_BODY,
} from '../styling/css-classes';
import {ClassMethodInfo} from './class-method-info';
import {HeaderApi} from './header-api';
import {TabApi} from './tab-api';
import {TabDescription} from './tab-description';
import {TabUsageNotes} from './tab-usage-notes';

/** Component to render a function API reference document. */
export function FunctionReference(entry: FunctionEntryRenderable) {
  return (
    <div class="api">
      <HeaderApi entry={entry} />
      <TabApi entry={entry} />
      <TabDescription entry={entry} />
      <TabUsageNotes entry={entry} />
      <div className={REFERENCE_MEMBERS_CONTAINER}>
        <div className={REFERENCE_MEMBERS}>
          <div className={REFERENCE_MEMBER_CARD}>
            <header>
              <div className={REFERENCE_HEADER}>
                <h3>{entry.name}</h3>
                <div>
                  <code>{entry.returnType}</code>
                </div>
              </div>
              {entry.isDeprecated && (
                <span className={`${PARAM_KEYWORD_CLASS_NAME} docs-deprecated`}>@deprecated</span>
              )}
            </header>
            <div className={REFERENCE_MEMBER_CARD_BODY}>
              {entry.overloads ? (
                entry.overloads.map((overload) => <ClassMethodInfo entry={overload} />)
              ) : (
                <ClassMethodInfo entry={entry} isOverloaded={true} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

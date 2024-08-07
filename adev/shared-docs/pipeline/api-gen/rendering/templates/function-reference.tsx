/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {FunctionEntryRenderable, FunctionSignatureMetadataRenderable} from '../entities/renderables';
import {
  REFERENCE_MEMBERS,
  REFERENCE_MEMBERS_CONTAINER,
  REFERENCE_MEMBER_CARD,
  REFERENCE_MEMBER_CARD_BODY,
  REFERENCE_MEMBER_CARD_HEADER,
} from '../styling/css-classes';
import {ClassMethodInfo} from './class-method-info';
import {HeaderApi} from './header-api';
import {TabApi} from './tab-api';
import {TabDescription} from './tab-description';
import {TabUsageNotes} from './tab-usage-notes';
import {HighlightTypeScript} from './highlight-ts';
import {printInitializerFunctionSignatureLine} from '../transforms/code-transforms';
import {getFunctionMetadataRenderable} from '../transforms/function-transforms';

export const signatureCard = (
  name: string,
  signature: FunctionSignatureMetadataRenderable,
  opts: {id: string},
  printSignaturesAsHeader: boolean,
) => {
  return (
    <div class={REFERENCE_MEMBER_CARD} id={opts.id} tabIndex={-1}>
      <header>
        {printSignaturesAsHeader ? (
          <code>
            <HighlightTypeScript
              code={printInitializerFunctionSignatureLine(
                name,
                signature,
                // Always omit types in signature headers, to keep them short.
                true,
              )}
              removeFunctionKeyword={true}
            />
          </code>
        ) : (
          <div className={REFERENCE_MEMBER_CARD_HEADER}>
            <h3>{name}</h3>
            <div>
              <code>{signature.returnType}</code>
            </div>
          </div>
        )}
      </header>
      <div class={REFERENCE_MEMBER_CARD_BODY}>
        <ClassMethodInfo entry={signature} />
      </div>
    </div>
  );
};

/** Component to render a function API reference document. */
export function FunctionReference(entry: FunctionEntryRenderable) {
  // Use signatures as header if there are multiple signatures.
  const printSignaturesAsHeader = entry.signatures.length > 1;

  return (
    <div class="api">
      <HeaderApi entry={entry} />
      <TabApi entry={entry} />
      <TabDescription entry={entry} />
      <TabUsageNotes entry={entry} />
      <div className={REFERENCE_MEMBERS_CONTAINER}>
        <div className={REFERENCE_MEMBERS}>
          {entry.signatures.map((s, i) =>
            signatureCard(
              s.name,
              getFunctionMetadataRenderable(s, entry.moduleName),
              {
                id: `${s.name}_${i}`,
              },
              printSignaturesAsHeader,
            ),
          )}
        </div>
      </div>
    </div>
  );
}

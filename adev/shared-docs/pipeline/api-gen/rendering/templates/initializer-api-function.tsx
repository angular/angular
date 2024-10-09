/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h, JSX} from 'preact';
import {InitializerApiFunctionRenderable} from '../entities/renderables';
import {HeaderApi} from './header-api';
import {TabApi} from './tab-api';
import {TabUsageNotes} from './tab-usage-notes';
import {REFERENCE_MEMBERS, REFERENCE_MEMBERS_CONTAINER} from '../styling/css-classes';
import {getFunctionMetadataRenderable} from '../transforms/function-transforms';
import {signatureCard} from './function-reference';

/** Component to render a constant API reference document. */
export function InitializerApiFunction(entry: InitializerApiFunctionRenderable) {
  // Use signatures as header if there are multiple signatures.
  const printSignaturesAsHeader =
    entry.callFunction.signatures.length > 1 ||
    entry.subFunctions.some((sub) => sub.signatures.length > 1);

  // If the initializer API function is just a function, checked by existence of an
  // implementation, and the descriptions of the "API" and the first function match,
  // avoid rendering it another time in the member card.
  if (
    entry.callFunction.signatures.length === 1 &&
    entry.callFunction.implementation !== null &&
    entry.description === entry.callFunction.signatures[0].description
  ) {
    entry.callFunction.signatures[0].description = '';
  }

  return (
    <div class="api">
      <HeaderApi entry={entry} showFullDescription={true} />
      <TabApi entry={entry} />
      <TabUsageNotes entry={entry} />

      <div class={REFERENCE_MEMBERS_CONTAINER}>
        <div class={REFERENCE_MEMBERS}>
          {entry.callFunction.signatures.map((s, i) =>
            signatureCard(
              s.name,
              getFunctionMetadataRenderable(s, entry.moduleName),
              {
                id: `${s.name}_${i}`,
              },
              printSignaturesAsHeader,
            ),
          )}

          {entry.subFunctions.reduce(
            (elements, subFunction) => [
              ...elements,
              ...subFunction.signatures.map((s, i) =>
                signatureCard(
                  `${entry.name}.${s.name}`,
                  getFunctionMetadataRenderable(s, entry.moduleName),
                  {
                    id: `${entry.name}_${s.name}_${i}`,
                  },
                  printSignaturesAsHeader,
                ),
              ),
            ],
            [] as JSX.Element[],
          )}
        </div>
      </div>
    </div>
  );
}

/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h, JSX} from 'preact';
import {InitializerApiFunctionRenderable} from '../entities/renderables.mjs';
import {API_REFERENCE_CONTAINER, REFERENCE_MEMBERS} from '../styling/css-classes.mjs';
import {getFunctionMetadataRenderable} from '../transforms/function-transforms.mjs';
import {signatureCard} from './function-reference';
import {HeaderApi} from './header-api';
import {SectionApi} from './section-api';
import {SectionUsageNotes} from './section-usage-notes';

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
    <div className={API_REFERENCE_CONTAINER}>
      <HeaderApi entry={entry} showFullDescription={true} />
      <SectionApi entry={entry} />

      <div class={REFERENCE_MEMBERS}>
        {entry.callFunction.signatures.map((s, i) =>
          signatureCard(
            s.name,
            getFunctionMetadataRenderable(s, entry.moduleName, entry.repo),
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
                getFunctionMetadataRenderable(s, entry.moduleName, entry.repo),
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

      <SectionUsageNotes entry={entry} />
    </div>
  );
}

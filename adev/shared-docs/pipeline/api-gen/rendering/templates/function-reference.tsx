/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h, Fragment} from 'preact';
import {
  FunctionEntryRenderable,
  FunctionSignatureMetadataRenderable,
} from '../entities/renderables';
import {
  API_REFERENCE_CONTAINER,
  REFERENCE_MEMBERS,
  REFERENCE_MEMBER_CARD,
  REFERENCE_MEMBER_CARD_BODY,
  REFERENCE_MEMBER_CARD_HEADER,
} from '../styling/css-classes';
import {ClassMethodInfo} from './class-method-info';
import {HeaderApi} from './header-api';
import {SectionApi} from './section-api';
import {SectionDescription} from './section-description';
import {SectionUsageNotes} from './section-usage-notes';
import {HighlightTypeScript} from './highlight-ts';
import {printInitializerFunctionSignatureLine} from '../transforms/code-transforms';
import {getFunctionMetadataRenderable} from '../transforms/function-transforms';
import {CodeSymbol} from './code-symbols';

export const signatureCard = (
  name: string,
  signature: FunctionSignatureMetadataRenderable,
  opts: {id: string},
  printSignaturesAsHeader: boolean,
) => {
  return (
    <div id={opts.id} class={REFERENCE_MEMBER_CARD}>
      <header class={REFERENCE_MEMBER_CARD_HEADER}>
        {printSignaturesAsHeader ? (
          <code>
            <HighlightTypeScript
              code={printInitializerFunctionSignatureLine(
                name,
                signature,
                // Always omit types in signature headers, to keep them short.
                true,
              )}
            />
          </code>
        ) : (
          <>
            <h3>{name}</h3>
            <div>
              <CodeSymbol code={signature.returnType} />
            </div>
          </>
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
    <div className={API_REFERENCE_CONTAINER}>
      <HeaderApi entry={entry} />
      <SectionApi entry={entry} />
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

      <SectionDescription entry={entry} />
      <SectionUsageNotes entry={entry} />
    </div>
  );
}

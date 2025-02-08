/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {EntryType, isDocEntryWithSourceInfo} from '../entities';
import {DocEntryRenderable} from '../entities/renderables';
import {
  HEADER_CLASS_NAME,
  HEADER_ENTRY_CATEGORY,
  HEADER_ENTRY_LABEL,
  HEADER_ENTRY_TITLE,
} from '../styling/css-classes';
import {DocsPillRow} from './docs-pill-row';

/** Component to render a header of the API page. */
export function HeaderApi(props: {entry: DocEntryRenderable; showFullDescription?: boolean}) {
  const entry = props.entry;

  // TODO: This link point to the main branch.
  // When ADEV is not deployed on the main branch branch anymore,
  // We should update it to point to the tag of the released version which ADEV runs on.

  const sourceUrl = isDocEntryWithSourceInfo(entry)
    ? `https://github.com/angular/angular/blob/main${entry.source.filePath}#L${entry.source.startLine}-L${entry.source.endLine}`
    : null;

  return (
    <header className={HEADER_CLASS_NAME}>
      <span className={HEADER_ENTRY_CATEGORY}>{entry.moduleName}</span>

      <div className={HEADER_ENTRY_TITLE}>
        <div>
          <h1>{entry.name}</h1>
          <div className={`${HEADER_ENTRY_LABEL} type-${entry.entryType.toLowerCase()} full`}>
            {getEntryTypeDisplayName(entry.entryType)}
          </div>
          {entry.isDeprecated && (
            <div className={`${HEADER_ENTRY_LABEL} type-deprecated full`}>
              Deprecated
            </div>
          )}
          {entry.isDeveloperPreview && (
            <div className={`${HEADER_ENTRY_LABEL} type-developer_preview full`}>
              <a href="/reference/releases#developer-preview">Developer preview</a>
            </div>
          )}
          {entry.isExperimental && (
            <div className={`${HEADER_ENTRY_LABEL} type-experimental full`}>
              <a href="/reference/releases#experimental">Experimental</a>
            </div>
          )}
        </div>
        {sourceUrl && (
          <a
            class="docs-github-links"
            target="_blank"
            href={sourceUrl}
            title="View source"
            aria-label="View source"
          >
            <i role="presentation" aria-hidden="true" class="material-symbols-outlined">
              code
            </i>
          </a>
        )}
      </div>

      <section
        className={'docs-reference-description'}
        dangerouslySetInnerHTML={{
          __html: props.showFullDescription ? entry.htmlDescription : entry.shortHtmlDescription,
        }}
      ></section>

      <DocsPillRow links={entry.additionalLinks} />
    </header>
  );
}

function getEntryTypeDisplayName(entryType: EntryType | string): string {
  switch (entryType) {
    case EntryType.NgModule:
      return 'NgModule';
    case EntryType.TypeAlias:
      return 'Type Alias';
    case EntryType.UndecoratedClass:
      return 'Class';
    case EntryType.InitializerApiFunction:
      return 'Initializer API';
  }
  return entryType;
}

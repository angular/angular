/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {EntryType, isDocEntryWithSourceInfo, PipeEntry} from '../entities.mjs';
import {DocEntryRenderable, PipeEntryRenderable} from '../entities/renderables.mjs';
import {
  HEADER_CLASS_NAME,
  HEADER_ENTRY_CATEGORY,
  HEADER_ENTRY_LABEL,
  HEADER_ENTRY_TITLE,
} from '../styling/css-classes.mjs';
import {DocsPillRow} from './docs-pill-row';

/** Component to render a header of the API page. */
export function HeaderApi(props: {
  entry: DocEntryRenderable | PipeEntryRenderable;
  showFullDescription?: boolean;
}) {
  const entry = props.entry;

  // TODO: This link point to the main branch.
  // When ADEV is not deployed on the main branch branch anymore,
  // We should update it to point to the tag of the released version which ADEV runs on.

  const sourceUrl = sourceUrlForEntry(entry);

  return (
    <header className={HEADER_CLASS_NAME}>
      <span className={HEADER_ENTRY_CATEGORY}>{entry.moduleName}</span>

      <div className={HEADER_ENTRY_TITLE}>
        <div>
          <h1>{entry.name}</h1>
          <div className={`${HEADER_ENTRY_LABEL} type-${entry.entryType.toLowerCase()} full`}>
            {getEntryTypeDisplayName(entry.entryType)}
          </div>
          {statusTag(entry)}
          {entry.entryType === EntryType.Pipe && !(entry as PipeEntry).isPure && (
            <div className={`${HEADER_ENTRY_LABEL} type-impure-pipe full`}>Impure</div>
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

      {entry.deprecated?.htmlMessage && (
        <div class="docs-alert docs-alert-important">
          <p className="foo">
            <strong>IMPORTANT:</strong>{' '}
            <span
              dangerouslySetInnerHTML={{
                __html: entry.deprecated?.htmlMessage.replace(/<p>(.*)<\/p>/s, '$1'),
              }}
            ></span>
          </p>
        </div>
      )}

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

function statusTag(entry: DocEntryRenderable) {
  let tag: h.JSX.HTMLAttributes<HTMLDivElement> | null = null;

  // Cascading Deprecated > Stable > Developer Preview > Experimental

  if (entry.deprecated) {
    tag = (
      <div className={`${HEADER_ENTRY_LABEL} type-deprecated full`}>
        {tagInVersionString('deprecated', entry.deprecated)}
      </div>
    );
  } else if (entry.stable) {
    tag = (
      <div className={`${HEADER_ENTRY_LABEL} type-stable full`}>
        {tagInVersionString('stable', entry.stable)}
      </div>
    );
  } else if (entry.developerPreview) {
    tag = (
      <div className={`${HEADER_ENTRY_LABEL} type-developer_preview full`}>
        <a href="/reference/releases#developer-preview">
          {tagInVersionString('developer preview', entry.developerPreview)}
        </a>
      </div>
    );
  } else if (entry.experimental) {
    tag = (
      <div className={`${HEADER_ENTRY_LABEL} type-experimental full`}>
        <a href="/reference/releases#experimental">
          {tagInVersionString('experimental', entry.experimental)}
        </a>
      </div>
    );
  }

  return tag;
}

function tagInVersionString(label: string, tag: {version: string | undefined} | undefined) {
  if (tag?.version) {
    return (
      <>
        <span className="status-label">{label}</span>
        <span className="status-version">since v{tag.version}</span>
      </>
    );
  }

  return <>{label}</>;
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

function sourceUrlForEntry(entry: DocEntryRenderable): string | null {
  if (!isDocEntryWithSourceInfo(entry)) {
    return null;
  }

  if (entry.source.filePath.includes('node_modules')) {
    // We don't know the source path in external repos link the CLI
    return null;
  } else {
    const filePath = entry.source.filePath.replace(/^\//, '');
    return `https://github.com/${entry.repo}/blob/main/${filePath}#L${entry.source.startLine}-L${entry.source.endLine}`;
  }
}

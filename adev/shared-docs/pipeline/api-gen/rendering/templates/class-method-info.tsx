/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {
  FunctionEntryRenderable,
  FunctionSignatureMetadataRenderable,
  MethodEntryRenderable,
  ParameterEntryRenderable,
} from '../entities/renderables';
import {PARAM_KEYWORD_CLASS_NAME, REFERENCE_MEMBER_CARD_ITEM} from '../styling/css-classes';
import {DeprecatedLabel} from './deprecated-label';
import {Parameter} from './parameter';
import {RawHtml} from './raw-html';

/**
 * Component to render the method-specific parts of a class's API reference.
 */
export function ClassMethodInfo(props: {
  entry: FunctionSignatureMetadataRenderable;
  isOverloaded?: boolean;
}) {
  const entry = props.entry;

  return (
    <div
      className={`${REFERENCE_MEMBER_CARD_ITEM} ${entry.isDeprecated ? 'docs-reference-card-item-deprecated' : ''}`}
    >
      <RawHtml value={entry.htmlDescription} className={'docs-function-definition'} />
      {/* In case when method is overloaded we need to indicate which overload is deprecated */}
      {entry.isDeprecated ? (
        <div>
          <DeprecatedLabel entry={entry} />
        </div>
      ) : (
        <></>
      )}
      {entry.params.map((param: ParameterEntryRenderable) => (
        <Parameter param={param} />
      ))}
      <div className={'docs-return-type'}>
        <span className={PARAM_KEYWORD_CLASS_NAME}>@returns</span>
        <code>{entry.returnType}</code>
      </div>
      {entry.htmlUsageNotes ? (
        <div className={'docs-usage-notes'}>
          <span className={PARAM_KEYWORD_CLASS_NAME}>Usage notes</span>
          <RawHtml value={entry.htmlUsageNotes} />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

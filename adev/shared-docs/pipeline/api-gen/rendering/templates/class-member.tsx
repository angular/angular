/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {
  isClassMethodEntry,
  isGetterEntry,
  isPropertyEntry,
  isSetterEntry,
} from '../entities/categorization';
import {
  FunctionSignatureMetadataRenderable,
  MemberEntryRenderable,
  MethodEntryRenderable,
} from '../entities/renderables';
import {
  REFERENCE_MEMBER_CARD,
  REFERENCE_MEMBER_CARD_BODY,
  REFERENCE_MEMBER_CARD_HEADER,
  REFERENCE_MEMBER_CARD_ITEM,
} from '../styling/css-classes';
import {ClassMethodInfo} from './class-method-info';
import {DeprecatedLabel} from './deprecated-label';
import {RawHtml} from './raw-html';
import {getFunctionMetadataRenderable} from '../transforms/function-transforms';

export function ClassMember(props: {member: MemberEntryRenderable}) {
  const body = (
    <div className={REFERENCE_MEMBER_CARD_BODY}>
      {isClassMethodEntry(props.member) ? (
        props.member.signatures.map((sig, i, signatures) => {
          const renderableMember = getFunctionMetadataRenderable(sig);
          return <ClassMethodInfo entry={renderableMember} isOverloaded={signatures.length > 1} />;
        })
      ) : (
        <div className={REFERENCE_MEMBER_CARD_ITEM}>
          {props.member.deprecationMessage !== null ? (
            <DeprecatedLabel entry={props.member} />
          ) : (
            <></>
          )}
          <RawHtml value={props.member.htmlDescription} />
        </div>
      )}
    </div>
  );

  const memberName = props.member.name;
  const returnType = getMemberType(props.member);
  return (
    <div id={memberName} className={REFERENCE_MEMBER_CARD} tabIndex={-1}>
      <header>
        <div className={REFERENCE_MEMBER_CARD_HEADER}>
          <h3>{memberName}</h3>
          <div>
            {isClassMethodEntry(props.member) && props.member.signatures.length > 1 ? (
              <span>{props.member.signatures.length} overloads</span>
            ) : returnType ? (
              <code>{returnType}</code>
            ) : (
              <></>
            )}
          </div>
        </div>
      </header>
      {body}
    </div>
  );
}

function getMemberType(entry: MemberEntryRenderable): string | null {
  if (isClassMethodEntry(entry)) {
    return entry.implementation.returnType;
  } else if (isPropertyEntry(entry) || isGetterEntry(entry) || isSetterEntry(entry)) {
    return entry.type;
  }
  return null;
}

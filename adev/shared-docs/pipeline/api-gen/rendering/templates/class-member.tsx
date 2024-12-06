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
import {MemberEntryRenderable, MethodEntryRenderable} from '../entities/renderables';
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
import {CodeSymbol} from './code-symbols';

export function ClassMember(props: {member: MemberEntryRenderable}) {
  const member = props.member;

  const renderMethod = (method: MethodEntryRenderable) => {
    const signature = method.signatures.length ? method.signatures : [method.implementation];
    return signature.map((sig) => {
      const renderableMember = getFunctionMetadataRenderable(sig);
      return <ClassMethodInfo entry={renderableMember} options={{showUsageNotes: true}} />;
    });
  };

  const body = (
    <div className={REFERENCE_MEMBER_CARD_BODY}>
      {isClassMethodEntry(member) ? (
        renderMethod(member)
      ) : member.htmlDescription || member.deprecationMessage ? (
        <div className={REFERENCE_MEMBER_CARD_ITEM}>
          <DeprecatedLabel entry={member} />
          <RawHtml value={member.htmlDescription} />
        </div>
      ) : (
        <></>
      )}
    </div>
  );

  const memberName = member.name;
  const returnType = getMemberType(member);
  return (
    <div id={memberName} tabIndex={-1} className={REFERENCE_MEMBER_CARD}>
      <header className={REFERENCE_MEMBER_CARD_HEADER}>
        <h3>{memberName}</h3>
        {isClassMethodEntry(member) && member.signatures.length > 1 ? (
          <span>{member.signatures.length} overloads</span>
        ) : returnType ? (
          <CodeSymbol code={returnType} />
        ) : (
          <></>
        )}
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

/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {MemberType} from '../entities.mjs';
import {
  isClassMethodEntry,
  isGetterEntry,
  isInterfaceEntry,
  isPropertyEntry,
  isSetterEntry,
} from '../entities/categorization.mjs';
import {MemberEntryRenderable, MethodEntryRenderable} from '../entities/renderables.mjs';
import {
  PARAM_KEYWORD_CLASS_NAME,
  REFERENCE_MEMBER_CARD,
  REFERENCE_MEMBER_CARD_BODY,
  REFERENCE_MEMBER_CARD_HEADER,
  REFERENCE_MEMBER_CARD_ITEM,
} from '../styling/css-classes.mjs';
import {getFunctionMetadataRenderable} from '../transforms/function-transforms.mjs';
import {ClassMethodInfo} from './class-method-info';
import {CodeSymbol} from './code-symbols';
import {CodeTableOfContents} from './code-table-of-contents';
import {DeprecatedLabel} from './deprecated-label';
import {RawHtml} from './raw-html';

export function ClassMember(props: {member: MemberEntryRenderable}) {
  const member = props.member;

  const renderMethod = (method: MethodEntryRenderable) => {
    const signature = method.signatures.length ? method.signatures : [method.implementation];
    return signature.map((sig) => {
      const renderableMember = getFunctionMetadataRenderable(sig, method.moduleName, method.repo);
      return <ClassMethodInfo entry={renderableMember} />;
    });
  };

  const body = (
    <div className={REFERENCE_MEMBER_CARD_BODY}>
      {isClassMethodEntry(member) ? (
        renderMethod(member)
      ) : member.htmlDescription || member.deprecationMessage ? (
        <div className={REFERENCE_MEMBER_CARD_ITEM}>
          <DeprecatedLabel entry={member} />
          {member.experimental && <span className="docs-member-tag">@experimental</span>}
          <RawHtml value={member.htmlDescription} />
        </div>
      ) : (
        <></>
      )}
    </div>
  );

  const memberName = member.name;
  const displayName = member.displayName;
  const returnType = getMemberType(member);
  return (
    <div id={memberName} className={REFERENCE_MEMBER_CARD}>
      <header className={REFERENCE_MEMBER_CARD_HEADER}>
        <h3>{displayName ?? memberName}</h3>
        {isClassMethodEntry(member) && member.signatures.length > 1 ? (
          <span>{member.signatures.length} overloads</span>
        ) : returnType ? (
          <CodeSymbol code={returnType} />
        ) : (
          <></>
        )}
      </header>
      {body}
      {isInterfaceEntry(member) ? (
        <CodeTableOfContents entry={member} hideCopyButton={true} embedded={true} />
      ) : (
        <></>
      )}
    </div>
  );
}

function getMemberType(entry: MemberEntryRenderable): string | null {
  if (isClassMethodEntry(entry)) {
    return entry.implementation.returnType;
  } else if (isPropertyEntry(entry) || isGetterEntry(entry) || isSetterEntry(entry)) {
    return entry.type;
  } else if (entry.memberType === MemberType.TypeAlias) {
    return 'type';
  } else if (entry.memberType === MemberType.Interface) {
    return 'interface';
  }
  return null;
}

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
import {MemberEntryRenderable} from '../entities/renderables';
import {
  REFERENCE_HEADER,
  REFERENCE_MEMBER_CARD,
  REFERENCE_MEMBER_CARD_BODY,
  REFERENCE_MEMBER_CARD_ITEM,
} from '../styling/css-classes';
import {ClassMethodInfo} from './class-method-info';
import {DeprecatedLabel} from './deprecated-label';
import {RawHtml} from './raw-html';

export function ClassMember(props: {members: MemberEntryRenderable[]}) {
  const memberName = props.members[0].name;
  const returnType = getMemberType(props.members[0]);

  // Do not create body element when there is no description
  const body = props.members.every(
    (member) => !member.htmlDescription && !isClassMethodEntry(member),
  ) ? (
    <></>
  ) : (
    <div className={REFERENCE_MEMBER_CARD_BODY}>
      {props.members.map((member) => {
        return isClassMethodEntry(member) ? (
          <ClassMethodInfo entry={member} isOverloaded={props.members.length > 1} />
        ) : (
          <div className={REFERENCE_MEMBER_CARD_ITEM}>
            {props.members.every((member) => member.deprecationMessage !== null) ? (
              <DeprecatedLabel entry={props.members[0]} />
            ) : (
              <></>
            )}
            <RawHtml value={member.htmlDescription} />
          </div>
        );
      })}
    </div>
  );

  return (
    <div id={memberName} className={REFERENCE_MEMBER_CARD} tabIndex={-1}>
      <header>
        <div className={REFERENCE_HEADER}>
          <h3>{memberName}</h3>
          <div>
            {props.members.length > 1 ? (
              <span>{props.members.length} overloads</span>
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
    return entry.returnType;
  } else if (isPropertyEntry(entry) || isGetterEntry(entry) || isSetterEntry(entry)) {
    return entry.type;
  }
  return null;
}

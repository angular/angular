/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

export function getMemberName(member: ts.ClassElement | ts.PropertyAssignment): string | null {
  if (member.name === undefined) {
    return null;
  }
  if (ts.isIdentifier(member.name) || ts.isStringLiteralLike(member.name)) {
    return member.name.text;
  }
  if (ts.isPrivateIdentifier(member.name)) {
    return `#${member.name.text}`;
  }
  return null;
}
